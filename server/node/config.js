
"use strict";

// Load environment variables from the `.env` file.
require("dotenv").config();

const isProd = process.env.NODE_ENV === "production";

const config = {
  // Default country for the checkout form.
  country: "US",

  // Store currency.
  currency: "eur",

  // Configuration for Stripe.
  // API Keys: https://dashboard.stripe.com/account/apikeys
  // Webhooks: https://dashboard.stripe.com/account/webhooks
  // Storing these keys and secrets as environment variables is a good practice.
  // You can fill them in your own `.env` file.
  stripe: {
    // The two-letter country code of your Stripe account (required for Payment Request).
    // country: process.env.STRIPE_ACCOUNT_COUNTRY || "US",
    // API version to set for this app (Stripe otherwise uses your default account version).
    apiVersion: "2019-03-14",
    // Use your test keys for development and live keys for real charges in production.
    // For non-card payments like iDEAL, live keys will redirect to real banking sites.
    publishableKey: isProd ? process.env.STRIPE_PUBLISHABLE_KEY : process.env.STRIPE_DEV_PUBLISHABLE_KEY,
    secretKey: isProd ? process.env.STRIPE_SECRET_KEY : process.env.STRIPE_DEV_SECRET_KEY,
    
  },

  shipengine: {
    stampsCarrierID: isProd ? process.env.SHIPENGINE_PROD_SDC_CARRIER_ID : process.env.SHIPENGINE_SANDBOX_SDC_CARRIER_ID,
    apiKey: isProd ? process.env.SHIPENGINE_PROD_API_KEY : process.env.SHIPENGINE_SANDBOX_API_KEY
  },

  shippenguin: {
    url: isProd ? process.env.SHIPPENGUIN_URL : "https://ship-penguin.ngrok.io"
  },

  iovation: {
    subscriberID: isProd ? process.env.SUBSCRIBER_ID : process.env.DEV_SUBSCRIBER_ID,
    subscriberAccount: isProd ? process.env.SUBSCRIBER_ACCOUNT : process.env.DEV_SUBSCRIBER_ACCOUNT,
    passCode: isProd ? process.env.SUBSCRIBER_PASS_CODE : process.env.DEV_SUBSCRIBER_PASS_CODE
  },

  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY
  },

  // Server port.
  port: process.env.PORT || 8000,

  // Tunnel to serve the app over HTTPS and be able to receive webhooks locally.
  // Optionally, if you have a paid ngrok account, you can specify your `subdomain`
  // and `authtoken` in your `.env` file to use it.
  ngrok: {
    enabled: process.env.NODE_ENV !== "production",
    // enabled: true,
    port: process.env.PORT || 8000,
    subdomain: process.env.NGROK_SUBDOMAIN,
    authtoken: process.env.NGROK_AUTHTOKEN,
  },
};

config.iovation.url = isProd ? `https://api.iovation.com/fraud/v1/subs/${config.iovation.subscriberID}/checks` : `https://ci-api.iovation.com/fraud/v1/subs/${config.iovation.subscriberID}/checks`;

module.exports = config;