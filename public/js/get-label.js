import { getLocalStorageItem } from "./local-storage.js";
import { showError, clearError } from "./ui-helpers.js";

export async function getLabel() {
  const labelBody = { "rate": getLocalStorageItem("rateID"), "stripeSession": getLocalStorageItem("stripeSession") };
  clearError();
  try {
    const response = await fetch("/label", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(labelBody)
    })
    const data = await response.json();

    if(data.errors && data.errors.length > 0) {
      if(data.errors[0].message.includes("Can not purchase")) {
        showError("Duplicate Label Purchase", "Label has already been purchased for this session, please contact ShipEngine support.");
        return {};
      }
      else {
        showError("Label Purchase Error", data.errors[0].message);
        return { labelPurchaseError: true };
      } 
    }

    return { pdf: data.label_download.pdf, zpl: data.label_download.zpl, png: data.label_download.png };
  }
  catch(e) {
    showError("Label Purchase", "There was an error purchasing your label, please contact ShipEngine support");
  }
}