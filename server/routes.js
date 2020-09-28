"use strict";

const config = require("./config");
const fetch = require("node-fetch");
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(config.stripe.secretKey);
stripe.setApiVersion(config.stripe.apiVersion);

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(config.sendgrid.apiKey);

require("dotenv").config();

// Render the main app HTML.
router.get("/", (req, res) => {
  res.render("index.ejs", { nonce: res.locals.cspNonce, stripePublishableKey: config.stripe.publishableKey });
});

// ShipEngine API Address Validation
router.post("/verify-addresses", async (req, res) => {
  try {

    const options = {
      "method": "POST",
      "headers": {
        "Host": "api.shipengine.com",
        "API-Key": config.shipengine.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    };
    const response = await fetch("https://api.shipengine.com/v1/addresses/validate", options);
    const parsedResponse = await response.json();
    res.json(parsedResponse);
  }
  catch (e) {
    console.error(e.message);
    res.send(500, "Unexpected Server Error");
  }
});

// Simple ShipEngine rates call
router.post("/rates", async (req, res) => {
  try {

    req.body.rate_options.carrier_ids.push(
      config.shipengine.stampsCarrierID
    );

    // We currently only want to return generic custom package types to the user
    req.body.rate_options.package_types.push("package");

    const options = {
      "method": "POST",
      "headers": {
        "Host": "api.shipengine.com",
        "API-Key": config.shipengine.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)

    };

    const response = await fetch("https://api.shipengine.com/v1/rates", options);
    const parsedResponse = await response.json();
    // TODO: Check for rate errors
    res.json(parsedResponse);
  }
  catch (e) {
    console.error(e.message);
    res.send(500, "Unexpected Server Error");
  }
});

// Call iovation with the information passed from the browser to check for fraud
router.post("/check-for-fraud", async (req, res) => {
  try {

    const subscriberID = config.iovation.subscriberID;
    const subscriberAccount = config.iovation.subscriberAccount;
    const passCode = config.iovation.passCode;

    const basicAuthString = `${subscriberID}/${subscriberAccount}:${passCode}`;

    req.body.accountCode = subscriberAccount;
    req.body.statedIp = req.ip;
    // req.body.type = "ShipPenguin";
    req.body.type = "ShipEngine";

    const options = {
      "method": "POST",
      "headers": {
        "Authorization": `Basic ${new Buffer(basicAuthString).toString("base64")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    };

    const response = await fetch(config.iovation.url, options);
    const parsedResponse = await response.json();
    res.json(parsedResponse);
  }
  catch (e) {
    console.error(e.message);
    res.send(500, "Unexpected Server Error");
  }
});

// Create a user's label
router.post("/label", async (req, res) => {
  try {

    const rate = req.body.rate;
    const rateUrl = "https://api.shipengine.com/v1/labels/rates/" + rate;
    const stripePaymentIntentID = req.body.stripePaymentIntentID;

    delete req.body.stripePaymentIntentID;

    const options = {
      "method": "POST",
      "headers": {
        "Host": "api.shipengine.com",
        "API-Key": config.shipengine.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    };

    const response = await fetch(rateUrl, options);
    const parsedResponse = await response.json();

    notifySlackChannel(stripePaymentIntentID);

    res.json(parsedResponse)
  }
  catch (e) {
    console.error(e.message);
    res.status(500).send("Unexpected Server Error");
  }
});

// Email the user their various label downloads
router.post("/email", async (req, res) => {
  try {

    const { email, labelUrls } = req.body;
    const pdfResponse = await fetch(labelUrls.pdf);
    const parsedPdfResponse = await pdfResponse.buffer();

    const zplResponse = await fetch(labelUrls.zpl);
    const parsedZPLResponse = await zplResponse.buffer();

    const pngResponse = await fetch(labelUrls.png);
    const parsedPNGResponse = await pngResponse.buffer();

    const msg = {
      to: email,
      from: "ShipPenguin@shipengine.com", // Use the email address or domain you verified above
      subject: "Here's your shipping label!",
      // text: "and easy to do anywhere, even with Node.js",
      html: `Thanks for using ShipPenguin, the fastest, cheapest way to print a shipping label. You’ll find your label attached in this message. Have questions? Just reply to this email.
    <br/><br/>
    And, remember: ShipPenguin is always here for you when you want to skip the line at the Post Office. Happy shipping!
    <br/><br/>
    The ShipPenguin Team`,
      attachments: [
        {
          content: parsedPdfResponse.toString("base64"),
          filename: "label.pdf",
          type: "application/pdf",
          disposition: "attachment",
          contentId: "mytext",
        },
        {
          content: parsedZPLResponse.toString("base64"),
          filename: "label.zpl",
          type: "application/zpl",
          disposition: "attachment",
          contentId: "mytext",
        },
        {
          content: parsedPNGResponse.toString("base64"),
          filename: "label.png",
          type: "application/png",
          disposition: "attachment",
          contentId: "mytext",
        }
      ]
    };

    await sgMail.send(msg);
    res.status(200).send();
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.body)
    }
    res.status(500).send("Unexpected Server Error");
  }
});

// Create a Stripe Checkout Session
router.post("/create-payment-intent", async (req, res) => {
  try {
    const options = {
      "method": "GET",
      "headers": {
        "Host": "api.shipengine.com",
        "API-Key": config.shipengine.apiKey,
      }
    };

    // Get the totalCharge from the rateID rather than passing a payment amount in the call from the
    // the browser to attempt to mitigate potential fraud.
    const response = await fetch(`https://api.shipengine.com/v1/rates/${req.body.rateID}/`, options);
    const parsedResponse = await response.json();

    const totalCharge = parsedResponse.shipping_amount.amount + parsedResponse.insurance_amount.amount + parsedResponse.confirmation_amount.amount + parsedResponse.other_amount.amount;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCharge * 100,
      currency: "usd",
      receipt_email: req.body.email,
      metadata: {
        "terms-of-service": "TOSv1",
        "date-accepted": new Date().toISOString(),
        "customer-ip": req.ip,
        "email": req.body.email
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  }
  catch (e) {
    console.error(e.message);
    res.status(500).send("Unexpected Server Error");
  }
});

// Return the stripe publishable key config based on environments
router.get("/config", (req, res) => {
  res.json({
    stripePublishableKey: config.stripe.publishableKey
  });
});

async function notifySlackChannel(stripePaymentIntentID, isRefund) {
  if (!config.slackChannel) {
    return;
  }
  try {

    const stripeSession = await stripe.paymentIntents.retrieve(stripePaymentIntentID);

    const dollars = stripeSession.amount / 100;
    const totalAmount = dollars.toLocaleString("en-US", { style: "currency", currency: "USD" });

    const action = isRefund ? "refunded" : "purchased";

    const body = {
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `A Label has been ${action} for the amount of ${totalAmount} \n Payment Intent ID: ${stripeSession.id}`
          }
        }
      ]
    }

    const options = {
      "method": "POST",
      "headers": {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    };

    await fetch(`https://hooks.slack.com/services/${config.slackChannel}`, options);
  }
  catch (e) {
    console.error(`Error notifying slack channel: ${e.message}`);
  }
}

module.exports = router;
