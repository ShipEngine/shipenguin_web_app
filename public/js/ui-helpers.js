// Show the customer the error from Stripe if their card fails to charge
export function showError(errorMsgText) {
  window.alert(errorMsgText);
};

// Show a spinner on payment submission
export function loading(isLoading) {
  if (isLoading) {
  } else {
  }
};

export function setStep(stepName) {
  const stepSectionClasses = ["step_zero", "step_one", "step_two", "step_three", "step_four", "step_five"];

  for(let step of stepSectionClasses) {
    if(step === stepName) {
      document.querySelector(`.${step}`).classList.remove("is-hidden");
    }
    else {
      document.querySelector(`.${step}`).classList.add("is-hidden");
    }
  }
}