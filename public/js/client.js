import { rateEstimate } from "./rate-estimate.js";
import { setLocalStorage, clearLocalStorage, clearInputs } from "./local-storage.js";
import { pay } from "./payment.js";
import { initializeState, setCurrentStep } from "./initializeState.js";
import { verifyAddress } from "./verify-address.js";
import { checkForFraud } from "./check-for-fraud.js";
import { debounce, loading, showError } from "./ui-helpers.js";


window.addEventListener("load", () => {

  initializeState();

  document.getElementById("step0NextButton").addEventListener("click", () => {
    window.location.hash = "#step1"
  })

  // If the user does an address auto complete via their browser then that can cause many change
  // events to be fired at once. We wrap it in a debounce function to keep the api calls limited. 
  async function runVerifyAddress() {
    loading(true);
    await verifyAddress();
    loading(false);
  }
  // const debouncedAddressVerify = debounce(runVerifyAddress);
  document.getElementById("address-form").addEventListener("change", debounce(runVerifyAddress));

  
  document.getElementById("step-1-next-button").addEventListener("click", async (evt) => {
    // evt.preventDefault();
    loading(true);
    const isVerified = await verifyAddress();
    loading(false);
    if (isVerified) {
      window.location.hash = "#step2";
    }
  });

  document.getElementById("step-2-form").addEventListener("submit", async (evt) => {
    evt.preventDefault();


    const pounds = document.getElementById("weight-lbs").value;
    const ounces = document.getElementById("weight-ounces").value;
    const length = document.getElementById("length").value;
    const width = document.getElementById("width").value;
    const height = document.getElementById("height").value;

    const totalWeight = 16 * Number(pounds) + Number(ounces);

    if(!totalWeight) {
      showError("Please enter in a weight for your package");
      return;
    }


    const allFilledDimensions = [length, width, height].every((item) => item !== undefined && item !== null && item !== "" );
    const allEmptyDimensions = [length, width, height]. every((item) => item === undefined || item === null || item === "");
    if(!allFilledDimensions && !allEmptyDimensions) {
      showError("Please complete filling out the package dimensions");
      return;
    }

    setLocalStorage("weight", { pounds, ounces });
    setLocalStorage("totalWeight", totalWeight);
    setLocalStorage("dimensions", { length, width, height });

    const rateSucess = await rateEstimate();
    if(rateSucess) {
      window.location.hash = "#step3";
    }
  });

  document.getElementById("step-3-form").addEventListener("submit", (evt) => {
    evt.preventDefault();
    const rateFieldSet = document.getElementById("rate-input-list");
    const selectedRate = rateFieldSet.querySelector("input:checked");
    const rateID = selectedRate.value;

    const rateLabel = rateFieldSet.querySelector(`label[for="${rateID}`);
    
    const carrierService = rateLabel.textContent.split("-")[1].split("/")[0].trim();
    const shippingCost = rateLabel.textContent.split("-")[0].trim();
    setLocalStorage("carrierService", carrierService);
    setLocalStorage("shippingCost", shippingCost);
    setLocalStorage("rateID", rateID);
    window.location.hash = "#step4";
  });

  document.getElementById("step4Form").addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const isFraud = await checkForFraud();

    if (isFraud) {
      window.alert("You have been flagged for potential fraud, please contact the ShipEngine support team");
    }
    else {
      setLocalStorage("email", document.getElementById("email").value);
      await pay();
    }
  });

  document.getElementById("createAnotherLabel").addEventListener("click", () => {
    clearLocalStorage();
    clearInputs();
    window.location.hash = "";
  });

  window.addEventListener("hashchange", (evt) => {
    setCurrentStep();
  });
});
