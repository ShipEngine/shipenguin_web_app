import { getLocalStorageItem, setLocalStorage } from "./local-storage.js";
import { loading } from "./ui-helpers.js";

export async function makeStripePayment(stripe, card) {
  // TODO: add error handling
  const response = await fetch("/create-payment-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ 
      "rateID": getLocalStorageItem("rateID"),
      "email": getLocalStorageItem("email")
    })
  })

  const jsonResponse = await response.json();

  payWithCard(stripe, card, jsonResponse.clientSecret)
}

// Calls stripe.confirmCardPayment
// If the card requires authentication Stripe shows a pop-up modal to
// prompt the user to enter authentication details without leaving your page.
const payWithCard = (stripe, card, clientSecret) => {
  loading(true);
  stripe
    .confirmCardPayment(clientSecret, {
      payment_method: {
        card: card
      }
    })
    .then(function (result) {
      if (result.error) {
        // Show error to your customer
        showError(result.error.message);
      } else {
        // The payment succeeded!
        orderComplete(result.paymentIntent.id);
      }
    });
};

/* ------- UI helpers ------- */
// Shows a success message when the payment is complete
const orderComplete = function (paymentIntentId) {
  loading(false);
  setLocalStorage("stripePaymentIntentID", paymentIntentId)
  window.location.hash = "#step5"
};

// Show the customer the error from Stripe if their card fails to charge
const showError = function (errorMsgText) {
  loading(false);
  const errorMsg = document.querySelector("#card-errors");
  errorMsg.textContent = errorMsgText;
  setTimeout(function () {
    errorMsg.textContent = "";
  }, 4000);
};
