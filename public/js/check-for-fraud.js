import { getLocalStorageItem } from "./local-storage.js"
import { showError, clearError } from "./ui-helpers.js";

export async function checkForFraud() {

  const fromAddress = getLocalStorageItem("fromAddress");

  const body = {
    accountCode: "", // This will be set server side.
    blackBox: document.getElementById("iovation-input").value,
    type: "", // This will be set server side.
    statedIp: "",
    transactionInsight: {
      email: document.getElementById("email").value,
      // homePhoneNumber: "",
      billingCity: fromAddress.city_locality,
      billingCountry: "US",
      billingPostalCode: fromAddress.postal_code,
      billingRegion: fromAddress.state_province,
      billingStreet: fromAddress.address_line1 + fromAddress.address_line2 + fromAddress.address_line3
    }
  }
  clearError();
  try {
    const response = await fetch("/check-for-fraud", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
    const data = await response.json();

    if (data.result === "A") {
      return false;
    }
    return true;
  } 
  catch (e) {
    showError("Fraud Detection", "Error validating your identity, please contact ShipEngine support");
  }
}