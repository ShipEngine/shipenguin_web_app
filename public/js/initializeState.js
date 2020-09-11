import { getLocalStorageItem } from "./local-storage.js";
import { setStep, loading, showError, populateCheckoutPage, populateDimensionsAndWeightPage, clearError } from "./ui-helpers.js";
import { getLabel } from "./get-label.js";
import { sendEmail } from "./send-email.js";
import { rateEstimate, populateRatePage } from "./rate-estimate.js";
import { verifyStripePayment } from "./payment.js";

export function initializeState() {

  setCurrentStep(true);

  // Populate fields

  // From Address
  const fromAddress = getLocalStorageItem("fromAddress");
  if (fromAddress) {
    document.getElementById("from-name").value = fromAddress.name;
    document.getElementById("from-address1").value = fromAddress.address_line1;
    document.getElementById("from-address2").value = fromAddress.address_line2;
    document.getElementById("from-city").value = fromAddress.city_locality;
    document.getElementById("from-state").value = fromAddress.state_province;
    document.getElementById("from-zip").value = fromAddress.postal_code;
  }

  // To Address
  const toAddress = getLocalStorageItem("toAddress");
  if (toAddress) {
    document.getElementById("to-name").value = toAddress.name;
    document.getElementById("to-address1").value = toAddress.address_line1;
    document.getElementById("to-address2").value = toAddress.address_line2;
    document.getElementById("to-city").value = toAddress.city_locality;
    document.getElementById("to-state").value = toAddress.state_province;
    document.getElementById("to-zip").value = toAddress.postal_code;
  }

  // Package Weight
  const packageWeight = getLocalStorageItem("weight");
  if (packageWeight) {
    document.getElementById("weight-lbs").value = packageWeight.pounds;
    document.getElementById("weight-ounces").value = packageWeight.ounces;
  }

  // Dimensions
  const dimensions = getLocalStorageItem("dimensions");
  if (dimensions) {
    document.getElementById("length").value = dimensions.length;
    document.getElementById("width").value = dimensions.width;
    document.getElementById("height").value = dimensions.height;
  }
}

export async function setCurrentStep(isBrowserLoad) {

  switch (window.location.hash) {
    case "#step1":
      setStep("step-one");
      break;

    case "#step2":
      populateDimensionsAndWeightPage();
      setStep("step-two");
      break;

    case "#step3":

      if (isBrowserLoad) {
        await rateEstimate();
      }

      populateRatePage();

      setStep("step-three");
      break;

    case "#step4":
      populateCheckoutPage();
      setStep("step-four");
      break;

    case "#step5":
      setStep("step-five");
      loading(true);
      const madePayment = await verifyStripePayment();
      clearError();
      if (!madePayment) {
        loading(false);
        showError("Stripe Payment", "Sorry but you don't appear to have made a payment, please contact ShipEngine support");
        break;
      }
      const labelUrls = await getLabel();
      await sendEmail(labelUrls);
      loading(false);
      setStep("step-five");
      break;

    default:
      setStep("step-zero");
  }
}

