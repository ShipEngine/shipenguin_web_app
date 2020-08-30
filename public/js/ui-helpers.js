import { getLabel } from "./get-label.js";

// Show the customer the error from Stripe if their card fails to charge
export function showError(errorMsgText) {
  loading(false);
  const errorMsg = document.querySelector("#card-errors");
  errorMsg.textContent = errorMsgText;
  setTimeout(function () {
    errorMsg.textContent = "";
  }, 4000);
};

// Show a spinner on payment submission
export function loading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("button").disabled = true;
  } else {
    document.querySelector("button").disabled = false;
  }
};

// Shows a success message when the payment is complete
export function orderComplete (paymentIntentId) {
  loading(false);
  //   document
  //     .querySelector(".result-message a")
  //     .setAttribute(
  //       "href",
  //       "https://dashboard.stripe.com/test/payments/" + paymentIntentId
  //     );

  // RELEASE THE HOUNDS!
  console.log("=== STEP XX: Release the hounds! I mean form ===");
  getLabel();
  $(".result-message").removeClass("is-hidden");
  $(".container").removeClass("step0 step1 step2 step3");
  $(".container").addClass("step3");
  $(".step_three").addClass("is-hidden");
  $(".step_four").removeClass("is-hidden");
  // Steps Adjust
  $(".steps-segment").removeClass("is-active");
  $(".steps-segment:nth-child(4)").addClass("is-active");

  document.querySelector("button").disabled = true;
};