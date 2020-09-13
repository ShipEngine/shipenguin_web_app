
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
  res.render("index.html");
});

// ShipEngine API Address Validation
router.post("/verify-addresses", async (req, res) => {

  const options = {
    "method": "POST",
    "headers": {
      "Host": "api.shipengine.com",
      "API-Key": config.shipengine.apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(req.body)
  };
  try {
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

  try {
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

  try {
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

  const rate = req.body.rate;
  const rateUrl = "https://api.shipengine.com/v1/labels/rates/" + rate;

  const options = {
    "method": "POST",
    "headers": {
      "Host": "api.shipengine.com",
      "API-Key": config.shipengine.apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(req.body)
  };

  try {
    const response = await fetch(rateUrl, options);
    const parsedResponse = await response.json();

    res.json(parsedResponse)
  }
  catch (e) {
    console.error(e.message);
    res.send(500, "Unexpected Server Error");
  }
});

// Email the user their various label downloads
router.post("/email", async (req, res) => {

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

  try {
    await sgMail.send(msg);
    res.send(200);
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.body)
    }
    res.send(500, "Unexpected Server Error");
  }
});

// Create a Stripe Checkout Session
router.post("/create-checkout-session", async (req, res) => {

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

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Shipping Label",
            },
            unit_amount: totalCharge * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${config.shippenguin.url}/#step5`,
      cancel_url: `${config.shippenguin.url}/#step4`,
      metadata: {
        "terms-of-service": "v1",
        "date-accepted": new Date().toISOString(),
        "customer-ip": req.ip
      }
    });

    res.json({ id: session.id });
  }
  catch (e) {
    console.error(e.message);
    res.send(500, "Unexpected Server Error");
  }
});

// Verify the Stripe Payment
router.get("/verify-stripe-payment", async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.sessionID);
  res.send(200, session.payment_status === "paid")
});


// Return the stripe publishable key config based on environments
router.get("/config", (req, res) => {
  res.json({
    stripePublishableKey: config.stripe.publishableKey
  });
});

module.exports = router;
