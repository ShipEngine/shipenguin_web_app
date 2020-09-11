import { getLocalStorageItem } from "./local-storage.js";
import { showError, clearError } from "./ui-helpers.js";

export async function getLabel() {
  const labelBody = { "rate": getLocalStorageItem("rateID") };
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
    return { pdf: data.label_download.pdf, zpl: data.label_download.zpl, png: data.label_download.png };
  }
  catch(e) {
    showError("Label Purchase", "There was an error purchasing your label, please contact ShipEngine support");
  }
}