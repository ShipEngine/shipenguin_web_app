import { rateEstimate } from "./rate-estimate.js";
import { setLocalStorage, clearLocalStorage, clearInputs } from "./local-storage.js";
import { pay } from "./payment.js";
import { initializeState, setCurrentStep } from "./initializeState.js";
import { verifyAddress } from "./verify-address.js";
import { checkForFraud } from "./check-for-fraud.js";
import { debounce } from "./ui-helpers.js";


window.addEventListener("load", () => {

  initializeState();

  document.getElementById("step0NextButton").addEventListener("click", () => {
    window.location.hash = "#step1"
  })

  // If the user does an address auto complete via their browser then that can cause many change
  // events to be fired at once. We wrap it in a debounce function to keep the api calls limited. 
  async function runVerifyAddress() {
    await verifyAddress();
  }
  // const debouncedAddressVerify = debounce(runVerifyAddress);
  document.getElementById("step1Form").addEventListener("change", debounce(runVerifyAddress));

  document.getElementById("step1Form").addEventListener("submit", async (evt) => {
    evt.preventDefault();
    const isVerified = await verifyAddress();
    if (isVerified) {
      window.location.hash = "#step2";
    }
  });

  document.getElementById("step2Form").addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const pounds = document.getElementById("weight-lbs").value;
    const ounces = document.getElementById("weight-ounces").value;
    const length = document.getElementById("length").value;
    const width = document.getElementById("width").value;
    const height = document.getElementById("height").value;

    setLocalStorage("weight", { pounds, ounces });
    setLocalStorage("totalWeight", 16 * Number(pounds) + Number(ounces));
    setLocalStorage("dimensions", { length, width, height });

    await rateEstimate();
    window.location.hash = "#step3";
  });

  document.getElementById("step3Form").addEventListener("submit", (evt) => {
    evt.preventDefault();
    const rateFieldSet = document.getElementById("step3Fieldset");
    const selectedRate = rateFieldSet.querySelector("input:checked");
    setLocalStorage("rateID", selectedRate.value);
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
