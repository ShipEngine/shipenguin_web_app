import { getLocalStorageItem } from "./local-storage.js";
import { showError, loading, clearError } from "./ui-helpers.js";

export async function rateEstimate() {
  const rateBody = {
    rate_options: {
      carrier_ids: [], // Added server side
      package_types: [] // Added server side
    },
    shipment: {
      validate_address: "no_validation",
      ship_to: getLocalStorageItem("toAddress"),
      ship_from: {
        ...getLocalStorageItem("fromAddress"),
        phone: "111-111-1111"
      },
      packages: [
        {
          weight: {
            value: getLocalStorageItem("totalWeight"),
            unit: "ounce"
          },
          dimensions: {
            unit: "inch",
          }
        }
      ]
    }
  };

  const dimensions = getLocalStorageItem("dimensions");
  if (dimensions.length !== "") {
    rateBody.shipment.packages[0].dimensions = {
      ...dimensions,
      unit: "inch"
    }
  }

  loading(true);
  clearError();
  try {
    const response = await fetch("/rates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(rateBody)
    });

    const data = await response.json();

    if (data.errors && data.errors.length > 0) {

      if (data.errors[0].message.includes("Mailpiece length plus girth")) {
        showError("Package Dimensions Error", "Package length plus girth dimensions cannot exceed 130 inches.");
      }
      else {
        showError("Shipping Rates Error", data.errors[0].message);
      }
      loading(false);
      return;
    }

    const rateInputList = document.getElementById("rate-input-list");
    rateInputList.innerHTML = "";
    let defaultChecked = false;
    const sortedRates = data.rate_response.rates.sort((a, b) => (a.shipping_amount.amount > b.shipping_amount.amount) ? 1 : ((b.shipping_amount.amount > a.shipping_amount.amount) ? -1 : 0));

    for (let rate of sortedRates) {
      const totalAmount = rate.shipping_amount.amount + rate.insurance_amount.amount + rate.confirmation_amount.amount + rate.other_amount.amount;

      const radioInput = document.createElement("input");
      radioInput.id = rate.rate_id;
      radioInput.value = rate.rate_id;
      radioInput.type = "radio";
      radioInput.setAttribute("name", "rates");
      radioInput.className = "checked:bg-gray-900 checked:border-transparent mr-2";

      if (!defaultChecked) {
        radioInput.setAttribute("checked", "checked");
        defaultChecked = true;
      }

      const inputLabel = document.createElement("div");
      inputLabel.className = "flex flex-row justify-between w-full";

      const inputTitle = document.createElement("p");
      inputTitle.className = "w-1/3";
      inputTitle.innerText = rate.service_type
      inputLabel.append(inputTitle);

      const inputToolTip = document.createElement("p");
      inputToolTip.className = "w-1/3";
      inputToolTip.innerText = "Learn More"
      inputLabel.append(inputToolTip);

      const inputPrice = document.createElement("p");
      inputPrice.className = "w-1/3 font-bold";
      inputPrice.innerText = `$${totalAmount.toFixed(2)}`
      inputLabel.append(inputPrice);

      const inputWrapper = document.createElement("div");
      inputWrapper.className = "flex items-center border-b-2 border-dotted border-gray-400";
      inputWrapper.append(radioInput);
      inputWrapper.append(inputLabel);

      rateInputList.append(inputWrapper);
    }

    if (data.rate_response.rates.length === 0) {
      rateInputList.textContent = "Sorry, we were unable to find any rates based on the criteria that you provided."
    }

    loading(false);
    return true;
  }
  catch (e) {
    loading(false);
    showError("Shipping Rates Error", "There was an issue with retrieving rates");
    return false;
  }
}
