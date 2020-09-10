import { orderComplete, loading, showError } from "./ui-helpers.js";
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


  // fetch("/create-payment-intent", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json"
  //   },
  //   body: JSON.stringify(rate)
  // })
  //   .then(function (result) {
  //     return result.json();
  //   })
  //   .then(function (data) {
  //     var elements = stripe.elements();

  //     var style = {
  //       base: {
  //         color: "#32325d",
  //         fontFamily: "Arial, sans-serif",
  //         fontSmoothing: "antialiased",
  //         fontSize: "16px",
  //         "::placeholder": {
  //           color: "#32325d"
  //         }
  //       },
  //       invalid: {
  //         fontFamily: "Arial, sans-serif",
  //         color: "#fa755a",
  //         iconColor: "#fa755a"
  //       }
  //     };

  //     var card = elements.create("card", { style: style });
  //     // Stripe injects an iframe into the DOM
  //     card.mount("#card-element");

  //     card.on("change", function (event) {
  //       // Disable the Pay button if there are no card details in the Element
  //       document.querySelector("button").disabled = event.empty;
  //       document.querySelector("#card-errors").textContent = event.error ? event.error.message : "";
  //     });

  //     var form = document.getElementById("payment-form");
  //     form.addEventListener("submit", function (event) {
  //       event.preventDefault();
  //       // Complete payment when the submit button is clicked
  //       payWithCard(stripe, card, data.clientSecret);
  //     });
  //   });
}
