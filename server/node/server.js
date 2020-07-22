
'use strict';

require('dotenv').config();

const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const ngrok = config.ngrok.enabled ? require('ngrok') : null;
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const opn = require('opn');
const { read } = require('fs');

app.use(
  bodyParser.json({
    // The raw body to verify webhook signatures.
    verify: function(req, res, buf) {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    },
  })
);
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '../../public')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', require('./routes'));
app.use(express.static("."));
app.use(express.json());


function calculateOrderAmount(rate) {
    const converRate = (rate / 100).toFixed(4);
    const convertedCost = parseInt(converRate.toString().replace(".", ""), 10);
    return convertedCost;
}

app.post("/create-payment-intent", async (req, res) => {
    const rate = req.body.rate;
    const convertedCost = calculateOrderAmount(rate);


    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: convertedCost,
        currency: "usd"
    });
    res.send({
        clientSecret: paymentIntent.client_secret
    });
});

const server = app.listen(config.port, () => {
  console.log(`🚀🚀🚀🚀  Server listening on port ${server.address().port}`);
  console.log(`Navigate to http://localhost:${server.address().port}`)
});

// Turn on the ngrok tunneverifyl in development, which provides both the mandatory HTTPS
// support for all card payments, and the ability to consume webhooks locally.
if (ngrok) {
  ngrok
    .connect({
      addr: config.ngrok.port,
      subdomain: config.ngrok.subdomain,
      authtoken: config.ngrok.authtoken,
    })
    .then(url => {
      console.log(`App URL to see the demo in your browser: ${url}/`);
      opn(url);
      //opn(url+ '/verify');
    })
    .catch(err => {
      if (err.code === 'ECONNREFUSED') {
        console.log(`⚠️  Connection refused at ${err.address}:${err.port}`);
      } else {
        console.log(`⚠️ Ngrok error: ${JSON.stringify(err)}`);
      }
      process.exit(1);
    });
}
