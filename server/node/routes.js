
"use strict";

const config = require("./config");
const request = require("request");
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(config.stripe.secretKey);
stripe.setApiVersion(config.stripe.apiVersion);

require("dotenv").config();

// Render the main app HTML.
router.get("/", (req, res) => {
  res.render("index.html");
});


router.post("/verify", (req, res) => {

    var options = {
        "method": "POST",
        "url": "https://api.shipengine.com/v1/addresses/validate",
        "headers": {
          "Host": "api.shipengine.com",
          "API-Key": process.env.NODE_ENV === "development" ?
            process.env.SHIPENGINE_SANDBOX_API_KEY : process.env.NODE_ENV === "development" ?
            process.env.SHIPENGINE_SANDBOX_API_KEY : process.env.SHIPENGINE_PROD_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      };
      request(options, function (error, response) {
        if (error) throw new Error(error) && console.log(error);

        var responseBody =  JSON.parse(response.body);
        // var verification = responseBody[0].status;
        // console.log(verification);
        console.log(responseBody);
        res.json(responseBody);
        // res.json(response);
        // res.status(200).json(response);
    });

});


router.post("/rates", (req, res) => {

    req.body.rate_options.carrier_ids.push(
      process.env.NODE_ENV === "development" ? process.env.SHIPENGINE_SANDBOX_SDC_CARRIER_ID : process.env.SHIPENGINE_PROD_SDC_CARRIER_ID
    );

    var options = {
        "method": "POST",
        "url": "https://api.shipengine.com/v1/rates",
        "headers": {
          "Host": "api.shipengine.com",
          "API-Key": process.env.NODE_ENV === "development" ?
            process.env.SHIPENGINE_SANDBOX_API_KEY : process.env.SHIPENGINE_PROD_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)

      };
      request(options, function (error, response) {
        if (error) throw new Error(error);

        var responseBody =  JSON.parse(response.body);
        // quick reference -> app console
        // var verification = responseBody[0].status;
        // console.log(verification);
        console.log(responseBody);
        res.json(responseBody);
        // res.json(response);
        // res.status(200).json(response);
    });
});

router.post("/label", (req, res) => {

    var rate = req.body.rate;
    var rateUrl = "https://api.shipengine.com/v1/labels/rates/" + rate;

    var options = {
        "method": "POST",
        "url": rateUrl,
        "headers": {
          "Host": "api.shipengine.com",
          "API-Key": process.env.NODE_ENV === "development" ?
            process.env.SHIPENGINE_SANDBOX_API_KEY : process.env.SHIPENGINE_PROD_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)

      };
      request(options, function (error, response) {
        if (error) throw new Error(error) && console.log(error);

        var responseBody =  JSON.parse(response.body);
        // quick reference -> app console
        // var verification = responseBody[0].status;
        // console.log(verification);
        // console.log(responseBody);
        res.json(responseBody);
        // res.json(response);
        // res.status(200).json(response);
    });
});



// Webhook handler to process payments for sources asynchronously.
router.post("/webhook", async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  if (config.stripe.webhookSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        config.stripe.webhookSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }
  const object = data.object;

  // Monitor payment_intent.succeeded & payment_intent.payment_failed events.
  if (object.object === "payment_intent") {
    const paymentIntent = object;
    if (eventType === "payment_intent.succeeded") {
      console.log(
        `🔔  Webhook received! Payment for PaymentIntent ${paymentIntent.id} succeeded.`
      );
    } else if (eventType === "payment_intent.payment_failed") {
      const paymentSourceOrMethod = paymentIntent.last_payment_error
        .payment_method
        ? paymentIntent.last_payment_error.payment_method
        : paymentIntent.last_payment_error.source;
      console.log(
        `🔔  Webhook received! Payment on ${paymentSourceOrMethod.object} ${paymentSourceOrMethod.id} of type ${paymentSourceOrMethod.type} for PaymentIntent ${paymentIntent.id} failed.`
      );
      // Note: you can use the existing PaymentIntent to prompt your customer to try again by attaching a newly created source:
      // https://stripe.com/docs/payments/payment-intents/usage#lifecycle
    }
  }

  // Monitor `source.chargeable` events.
  if (
    object.object === "source" &&
    object.status === "chargeable" &&
    object.metadata.paymentIntent
  ) {
    const source = object;
    console.log(`🔔  Webhook received! The source ${source.id} is chargeable.`);
    // Find the corresponding PaymentIntent this source is for by looking in its metadata.
    const paymentIntent = await stripe.paymentIntents.retrieve(
      source.metadata.paymentIntent
    );
    // Check whether this PaymentIntent requires a source.
    if (paymentIntent.status != "requires_payment_method") {
      return res.sendStatus(403);
    }
    // Confirm the PaymentIntent with the chargeable source.
    await stripe.paymentIntents.confirm(paymentIntent.id, {source: source.id});
  }

  // Monitor `source.failed` and `source.canceled` events.
  if (
    object.object === "source" &&
    ["failed", "canceled"].includes(object.status) &&
    object.metadata.paymentIntent
  ) {
    const source = object;
    console.log(`🔔  The source ${source.id} failed or timed out.`);
    // Cancel the PaymentIntent.
    await stripe.paymentIntents.cancel(source.metadata.paymentIntent);
  }

  // Return a 200 success code to Stripe.
  res.sendStatus(200);
});

/**
 * Routes exposing the config as well as the ability to retrieve products.
 */

// Expose the Stripe publishable key and other pieces of config via an endpoint.
router.get("/config", (req, res) => {
  res.json({
    stripePublishableKey: config.stripe.publishableKey,
    stripeCountry: config.stripe.country,
    country: config.country,
    currency: config.currency,
    paymentMethods: config.paymentMethods,
    shippingOptions: config.shippingOptions,
  });
});

// Retrieve the PaymentIntent status.
router.get("/payment_intents/:id/status", async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);
  res.json({paymentIntent: {status: paymentIntent.status}});
});

module.exports = router;
