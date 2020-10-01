import { getLocalStorageItem } from "./local-storage.js";
import { showError, loading, clearError } from "./ui-helpers.js";

function setToolTip(package_type) {
  switch (package_type) {
    case 'USPS Media Mail':
      return "Media mail (Delivery in 2–8 days for books, manuscripts, recordings and other media in packages 70 lbs. or less)"
    case 'USPS Priority Mail':
      return "Priority: Priority (Delivery in 1–3 days on average for letters, envelopes, tubes and small packages 70 lbs. or less)"
    case 'USPS Priority Mail Express':
      return "First class mail (Delivery in 1–3 days for packages 13 oz. or less and envelopes 3.5 oz. or less)"
    case 'USPS Parcel Select Ground':
      return "Priority express (Delivery in 1–2 days guaranteed for letters, envelopes, tubes and small packages 70 lbs. or less)"
  }
}

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
      inputLabel.className = "flex flex-row justify-between w-full pt-16px pb-16px";

      const infoLogo = document.createElement("img");
      infoLogo.className = "info-logo inline h-4 w-4";
      infoLogo.src = "/images/information-logo.svg";
      infoLogo.alt = "Information Logo";

      const toolTip = document.createElement("span");
      toolTip.className = "tooltiptext";
      toolTip.innerText = setToolTip(rate.service_type)

      const rateTitle = document.createElement("span");
      rateTitle.innerText = rate.service_type;
      rateTitle.className = "rate-title";

      const inputTitle = document.createElement("p");
      inputTitle.className = "tooltip";
      // inputTitle.innerText = rate.service_type;
      inputTitle.id = `carrier-service-${rate.rate_id}`;
      inputTitle.append(rateTitle);
      inputTitle.append(infoLogo);
      inputTitle.append(toolTip);

      inputLabel.append(inputTitle);

      const inputPrice = document.createElement("p");
      inputPrice.className = "font-bold";
      inputPrice.innerText = `$${totalAmount.toFixed(2)}`
      inputPrice.id = `carrier-service-cost-${rate.rate_id}`
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
