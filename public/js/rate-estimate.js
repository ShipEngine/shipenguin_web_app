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
      const radioInput = document.createElement("input");
      radioInput.id = rate.rate_id;
      radioInput.value = rate.rate_id;
      radioInput.type = "radio";
      radioInput.setAttribute("name", "rates");
      radioInput.className = "mx-3 w-4 h-4 align-text-top";

      const label = document.createElement("label");
      const totalAmount = rate.shipping_amount.amount + rate.insurance_amount.amount + rate.confirmation_amount.amount + rate.other_amount.amount;
      label.setAttribute("for", rate.rate_id);

      if (rate.service_type.includes("Media Mail")) {
        label.innerHTML = `<a class="link" target="_blank" href="https://about.usps.com/notices/not121/not121_tech.htm">${rate.service_type}</a> / ${rate.delivery_days} day(s) $${totalAmount.toFixed(2)}`;
      }
      else {
        label.textContent = `${rate.service_type} / ${rate.delivery_days} day(s) $${totalAmount.toFixed(2)}`;
      }
      label.className = "py-2";

      if (!defaultChecked) {
        radioInput.setAttribute("checked", "checked");
        defaultChecked = true;
      }

      const inputWrapper = document.createElement("div");
      inputWrapper.className = "my-2 pb-16px border-b-2 border-dotted border-gray";

      inputWrapper.append(radioInput);
      inputWrapper.append(label);

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
