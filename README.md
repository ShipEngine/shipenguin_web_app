# Shipenguin Web App (In Development)

- See it action here: https://shipenguin-dev.herokuapp.com/

This is a reference implementation of the following ShipEngine API services:
* Address Validation
* Shipping Rates
* Shipping Labels

- The first step to run this source code locally, will be creating a `.env` file in the project directory. You can copy the contents of [.env.example](./.env.example "Environment Variable Template") and add in your own values before starting the server.
    
    * *Note:* You will need to create a free [ShipEngine Account](https://www.shipengine.com/signup "Create a ShipEngine Account") to obtain Sandbox and Production API Key's and carrier_id's to run this application successfully.
    
- Next, you will install the projects' dependencies at the command line.

    ```npm
    npm install && npm start
    ```
- Go to the server address in your browser `https://<ngrok_hash>.ngrok.io/` listening on port `8000`. When you run `npm start` you will see the server address provided in your terminal.

- This app also uses [Stripe](https://stripe.com/docs "Stripe Developer Portal") for payments. 
    * You can use the following test card information to pay for the label: 
    * `4242 4242 4242 4242` `CVV:<any 3 digits>` `EXP:<any future date>` `ZIPCODE:<any 6 digits>`
    
## Local Development
When running this code in development mode if you do not have an NGROK account, use the following npm script:
```npm
npm run dev
```
- This runs with the `NODE_ENV` set to `production`  because there is logic in [server/node/config.js](./server/node/config.js "Local config.js file") on line 74.
    
If you have an NGROK account and have added your NGROK authtoken to your `.env` file, use the following npm script:
```npm
npm run dev:ngrok
```
- This runs with the `NODE_ENV` set to `development` to trigger the NGROK config to use your NGROK authtoken and subdomain. 
