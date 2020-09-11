import { getLocalStorageItem } from "./local-storage.js";


// Show the customer the error from Stripe if their card fails to charge
export function showError(errorTitle, errorMsg) {
  document.getElementById("error-title").textContent = errorTitle;
  document.getElementById("error-message").textContent = errorMsg;
  document.getElementById("error-card").classList.remove("hidden");
};

export function clearError() {
  document.getElementById("error-card").classList.add("hidden");
}

// Show a spinner on any long running api call and disable buttons to prevent further action
export function loading(isLoading) {
  if (isLoading) {

    const buttons =  document.querySelectorAll("button.next-step");
    for(let button of buttons) {
      button.setAttribute("disabled", "disabled");
    }

    const buttonContents = document.querySelectorAll(".button-content");
    for (let buttonContent of buttonContents) {
      buttonContent.classList.add("hidden");
    }

    const spinners = document.querySelectorAll("button .animate-spin");

    for (let spinner of spinners) {
      spinner.classList.remove("hidden");
    }
  } 
  else {

    const buttons =  document.querySelectorAll("button.next-step");
    for(let button of buttons) {
      button.removeAttribute("disabled");
    }

    const buttonContents = document.querySelectorAll(".button-content");
    for (let buttonContent of buttonContents) {
      buttonContent.classList.remove("hidden");
    }

    const spinners = document.querySelectorAll("button .animate-spin");

    for (let spinner of spinners) {
      spinner.classList.add("hidden");
    }

  }
};

export function setStep(stepName) {
  const stepSectionClasses = ["step-zero", "step-one", "step-two", "step-three", "step-four", "step-five"];

  for(let step of stepSectionClasses) {
    if(step === stepName) {
      document.querySelector(`.${step}`).classList.remove("hidden");
    }
    else {
      document.querySelector(`.${step}`).classList.add("hidden");
    }
  }
}

/** Wrap a function in a debouncer, helps with event listeners that can 
 * fire multiple times with a short period.
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}


export function populateCheckoutPage() {

  //Carrier Service
  const carrierServiceName = getLocalStorageItem("carrierService");

  const carrierService = document.getElementById("carrier-service");
  carrierService.innerHTML = "";
  carrierService.textContent = carrierServiceName;

  //From Address
  const fromAddress = getLocalStorageItem("fromAddress");

  const fromName = document.querySelector("#checkout-from-address .name");
  fromName.innerHTML = "";
  fromName.textContent = fromAddress.name;

  const fromStreetAdress = document.querySelector("#checkout-from-address .street-address");
  fromStreetAdress.innerHTML = "";
  fromStreetAdress.textContent = `${fromAddress.address_line1} ${fromAddress.address_line2}`;

  const fromCityStateZip = document.querySelector("#checkout-from-address .city-state-zip");
  fromCityStateZip.innerHTML = "";
  fromCityStateZip.textContent = `${fromAddress.city_locality}, ${fromAddress.state_province}, ${fromAddress.postal_code}`;

  // To Address
  const toAddress = getLocalStorageItem("toAddress");

  const toName = document.querySelector("#checkout-to-address .name");
  toName.innerHTML = "";
  toName.textContent = toAddress.name;

  const toStreetAdress = document.querySelector("#checkout-to-address .street-address");
  toStreetAdress.innerHTML = "";
  toStreetAdress.textContent = `${toAddress.address_line1} ${toAddress.address_line2}`;

  const toCityStateZip = document.querySelector("#checkout-to-address .city-state-zip");
  toCityStateZip.innerHTML = "";
  toCityStateZip.textContent = `${toAddress.city_locality}, ${toAddress.state_province}, ${toAddress.postal_code}`;

  // payment amount
  const shippingCost = getLocalStorageItem("shippingCost");

  const paymentButton = document.querySelector("#print-label .button-content");
  paymentButton.textContent = `Pay ${shippingCost}`;

}

export function populateDimensionsAndWeightPage() {

  //From Address
  const fromAddress = getLocalStorageItem("fromAddress");

  const fromName = document.querySelector("#dimensions-from-summary .name");
  fromName.innerHTML = "";
  fromName.textContent = fromAddress.name;

  const fromStreetAdress = document.querySelector("#dimensions-from-summary .street-address");
  fromStreetAdress.innerHTML = "";
  fromStreetAdress.textContent = `${fromAddress.address_line1} ${fromAddress.address_line2}`;

  const fromCityStateZip = document.querySelector("#dimensions-from-summary .city-state-zip");
  fromCityStateZip.innerHTML = "";
  fromCityStateZip.textContent = `${fromAddress.city_locality}, ${fromAddress.state_province}, ${fromAddress.postal_code}`;

  // To Address
  const toAddress = getLocalStorageItem("toAddress");

  const toName = document.querySelector("#dimensions-to-summary .name");
  toName.innerHTML = "";
  toName.textContent = toAddress.name;

  const toStreetAdress = document.querySelector("#dimensions-to-summary .street-address");
  toStreetAdress.innerHTML = "";
  toStreetAdress.textContent = `${toAddress.address_line1} ${toAddress.address_line2}`;

  const toCityStateZip = document.querySelector("#dimensions-to-summary .city-state-zip");
  toCityStateZip.innerHTML = "";
  toCityStateZip.textContent = `${toAddress.city_locality}, ${toAddress.state_province}, ${toAddress.postal_code}`;

}


export function populateRatePage() {
  //From Address
  const fromAddress = getLocalStorageItem("fromAddress");

  const fromName = document.querySelector("#rate-from-summary .name");
  fromName.innerHTML = "";
  fromName.textContent = fromAddress.name;

  const fromStreetAdress = document.querySelector("#rate-from-summary .street-address");
  fromStreetAdress.innerHTML = "";
  fromStreetAdress.textContent = `${fromAddress.address_line1} ${fromAddress.address_line2}`;

  const fromCityStateZip = document.querySelector("#rate-from-summary .city-state-zip");
  fromCityStateZip.innerHTML = "";
  fromCityStateZip.textContent = `${fromAddress.city_locality}, ${fromAddress.state_province}, ${fromAddress.postal_code}`;

  // To Address
  const toAddress = getLocalStorageItem("toAddress");

  const toName = document.querySelector("#rateToSummary .name");
  toName.innerHTML = "";
  toName.textContent = toAddress.name;

  const toStreetAdress = document.querySelector("#rateToSummary .street-address");
  toStreetAdress.innerHTML = "";
  toStreetAdress.textContent = `${toAddress.address_line1} ${toAddress.address_line2}`;

  const toCityStateZip = document.querySelector("#rateToSummary .city-state-zip");
  toCityStateZip.innerHTML = "";
  toCityStateZip.textContent = `${toAddress.city_locality}, ${toAddress.state_province}, ${toAddress.postal_code}`;

  // dimensions
  const dimensions = getLocalStorageItem("dimensions");
  const weight = getLocalStorageItem("weight");

  const dimensionWeight = document.querySelector("#rate-dimension-weight-summary");

  dimensionWeight.innerHTML = "";
  const weightString =  `${weight.pounds ? weight.pounds : "0"}lb(s), ${weight.ounces ? weight.ounces : "0"}oz`;
  const dimensionsString = dimensions.length ? `(${dimensions.length} x ${dimensions.width} x ${dimensions.height} in)` : "";

  dimensionWeight.textContent = `${weightString} ${dimensionsString}`;
}