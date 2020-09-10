
"use strict";

const config = require("./config");
const fetch = require("node-fetch");
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(config.stripe.secretKey);
stripe.setApiVersion(config.stripe.apiVersion);

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

require("dotenv").config();

// Render the main app HTML.
router.get("/", (req, res) => {
  res.render("index.html");
});

const isProd = process.env.NODE_ENV === "production";

router.post("/verify", async (req, res) => {

  const options = {
    "method": "POST",
    "headers": {
      "Host": "api.shipengine.com",
      "API-Key": isProd ? process.env.SHIPENGINE_PROD_API_KEY : process.env.SHIPENGINE_SANDBOX_API_KEY,
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


router.post("/rates", async (req, res) => {

  req.body.rate_options.carrier_ids.push(
    isProd ? process.env.SHIPENGINE_PROD_SDC_CARRIER_ID : process.env.SHIPENGINE_SANDBOX_SDC_CARRIER_ID  
  );

  const options = {
    "method": "POST",
    "headers": {
      "Host": "api.shipengine.com",
      "API-Key": isProd ? process.env.SHIPENGINE_PROD_API_KEY : process.env.SHIPENGINE_SANDBOX_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(req.body)

  };

  try {
    const response = await fetch("https://api.shipengine.com/v1/rates", options);
    const parsedResponse = await response.json();
    res.json(parsedResponse);
  }
  catch(e) {
    console.error(e.message);
    res.send(500, "Unexpected Server Error");
  }
});


router.post("/checkForFraud", async (req, res) => {

  const subscriberID = isProd ? process.env.SUBSCRIBER_ID : process.env.DEV_SUBSCRIBER_ID;
  const subscriberAccount = isProd ? process.env.SUBSCRIBER_ACCOUNT : process.env.DEV_SUBSCRIBER_ACCOUNT;
  const passCode = isProd ? process.env.SUBSCRIBER_PASS_CODE : process.env.DEV_SUBSCRIBER_PASS_CODE;

  const iovationUrl = isProd ? `https://api.iovation.com/fraud/v1/subs/${subscriberID}/checks` : `https://ci-api.iovation.com/fraud/v1/subs/${subscriberID}/checks`;

  const basicAuthString = `${subscriberID}/${subscriberAccount}:${passCode}`;

  req.body.accountCode = subscriberAccount;
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
    const response = await fetch(iovationUrl, options);
    const parsedResponse = await response.json();
    res.json(parsedResponse);
  }
  catch(e) {
    console.error(e.message);
    res.send(500, "Unexpected Server Error");
  }
});

router.post("/label", async (req, res) => {

  const rate = req.body.rate;
  const rateUrl = "https://api.shipengine.com/v1/labels/rates/" + rate;

  const options = {
    "method": "POST",
    "headers": {
      "Host": "api.shipengine.com",
      "API-Key": isProd ? process.env.SHIPENGINE_PROD_API_KEY : process.env.SHIPENGINE_SANDBOX_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(req.body)
  };

  try {
    const response = await fetch(rateUrl, options);
    const parsedResponse = await response.json();
    res.json(parsedResponse)
  }
  catch(e) {
    console.error(e.message);
    res.send(500, "Unexpected Server Error");
  }
});

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
    from: "noresponse@shipengine.com", // Use the email address or domain you verified above
    subject: "ShipEngine Labels",
    // text: "and easy to do anywhere, even with Node.js",
    html: "<strong>Thank you for your purchase!</strong>",
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

router.post("/create-checkout-session", async (req, res) => {

  const url = isProd ? "https://www.shippenguin.com" : "https://ship-penguin.ngrok.io";

  const options = {
    "method": "GET",
    "headers": {
      "Host": "api.shipengine.com",
      "API-Key": isProd ? process.env.SHIPENGINE_PROD_API_KEY : process.env.SHIPENGINE_SANDBOX_API_KEY,
    }
  };
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
      success_url: `${url}/#step5`,
      cancel_url: `${url}/#step4`,
    });
  
    res.json({ id: session.id });
  }
  catch(e) {
    console.error(e.message);
    res.send(500, "Unexpected Server Error");
  }

});

module.exports = router;
