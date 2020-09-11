import { getLocalStorageItem, setLocalStorage } from "./local-storage.js";

// A reference to Stripe.js initialized with your real test publishable API key.
let stripe;

// A reference to Stripe.js initialized with your real test publishable API key.
export async function pay() {

  if (!stripe) {
    const response = await fetch("/config");
    const config = await response.json();
    stripe = Stripe(config.stripePublishableKey);
  }

  // TODO: add error handling
  const response = await fetch("/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ "rateID": getLocalStorageItem("rateID") })
  })

  const session = await response.json();
  setLocalStorage("stripeSession", session.id);
  await stripe.redirectToCheckout({ sessionId: session.id });


  //   .then(function (result) {
  //   // If `redirectToCheckout` fails due to a browser or network
  //   // error, you should display the localized error message to your
  //   // customer using `error.message`.
  //   if (result.error) {
  //     alert(result.error.message);
  //   }
  // })
  //   .catch(function (error) {
  //     console.error('Error:', error);
  //   });
}

export async function verifyStripePayment() {

  const sessionID = getLocalStorageItem("stripeSession");

  const response = await fetch(`/verify-stripe-payment?sessionID=${sessionID}`);
  const success = await response.json();

  return success;
}