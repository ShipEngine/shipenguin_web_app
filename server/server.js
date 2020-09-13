"use strict";

require("dotenv").config();

const config = require("./config");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const ngrok = config.ngrok.enabled ? require("ngrok") : null;
const app = express();
const morgan = require("morgan");
const opn = require("opn");
const http = require("http");
const enforce = require("express-sslify");
const helmet = require("helmet");
const crypto = require("crypto");

const isProd = process.env.NODE_ENV === "production";

app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
  next();
});

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", "https://use.fontawesome.com", "https://js.stripe.com", "https://mpsnare.iesnare.com", "wss://mpsnare.iesnare.com/"],
    scriptSrc: ["'self'", "https://mpsnare.iesnare.com",  (req, res) => `'nonce-${res.locals.cspNonce}'`],
    styleSrc: ["'self'", "https://use.fontawesome.com",  (req, res) => `'nonce-${res.locals.cspNonce}'`]
  }
}));

/* ATTN: If this project ever gets hosted on any services that do not set the x-forwarded-proto header
DO NOT use the Options object that is being passed to enforce.HTTPS(); as it is easy to spoof
HTTP headers outside of environments that are actively setting/removing that specific header.
e.g. load-balancers, heroku */
if(isProd) {
  app.use(enforce.HTTPS({
    trustProtoHeader: true
  }));
}

app.use(morgan("dev"));
app.use(
  bodyParser.json({
    // The raw body to verify webhook signatures.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "../public")));
// app.engine("html", require("ejs").renderFile);
app.set("views", path.join(__dirname, "..", "public"));
app.set("view engine", "ejs");

app.use("/", require("./routes"));
app.use(express.static("."));
app.use(express.json());

// Configure the HTTPS server
http.createServer(app)
  .listen(config.port, () => {
    console.log(`🚀🚀 Express server listening on port ${config.port} 🚀🚀`);
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
