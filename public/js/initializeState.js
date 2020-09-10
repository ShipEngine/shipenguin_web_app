import { getLocalStorageBlob } from "./local-storage.js";
import { setStep } from "./ui-helpers.js";
import { getLabel } from "./get-label.js";
import { sendEmail } from "./send-email.js";

export function initializeState() {
  const results = getLocalStorageBlob();

  setCurrentStep(results);

  // Populate fields

  if (results["shipFromAddress"]) {
    $("#shipFromAddress").val(results["shipFromAddress"]);
  }

  if (results["shipToAddress"]) {
    $("#shipToAddress").val(results["shipToAddress"]);
  }
}


export async function setCurrentStep() {

  switch (window.location.hash) {
    case "#step1":
      setStep("step_one");
      break;

    case "#step2":
      setStep("step_two");
      break;

    case "#step3":
      setStep("step_three");
      break;

    case "#step4":
      setStep("step_four");
      break;

    case "#step5":
      const labelUrls = await getLabel();
      await sendEmail(labelUrls);

      setStep("step_five");
      break;

    default:
      setStep("step_zero");
  }
}
