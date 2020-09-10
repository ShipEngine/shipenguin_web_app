import { loading, showError } from "./ui-helpers.js";
import { getLocalStorageItem } from "./local-storage.js";

// A reference to Stripe.js initialized with your real test publishable API key.
const stripe = Stripe("pk_test_0gDWcjB7xWWgt34p1UQoCxFH00CcruEzwb");

// A reference to Stripe.js initialized with your real test publishable API key.
export function pay() {

  fetch("/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ "rateID": getLocalStorageItem("rateID") })
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (session) {
      return stripe.redirectToCheckout({ sessionId: session.id });
    })
    .then(function (result) {
      // If `redirectToCheckout` fails due to a browser or network
      // error, you should display the localized error message to your
      // customer using `error.message`.
      if (result.error) {
        alert(result.error.message);
      }
    })
    .catch(function (error) {
      console.error('Error:', error);
    });
}
