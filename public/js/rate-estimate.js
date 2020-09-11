import { getLocalStorageItem } from "./local-storage.js";
import { showError, loading } from "./ui-helpers.js";

export async function rateEstimate() {
  const rateBody = {
    rate_options: {
      carrier_ids: [] // Added server side
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
            ...getLocalStorageItem("dimensions")
          }
        }
      ]
    }
  };

  loading(true);
  try {
    const response = await fetch("/rates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(rateBody)
    });

    const data = await response.json();

    loading(false);

    const rateInputList = document.getElementById("rate-input-list");
    rateInputList.innerHTML = "";
    let defaultChecked = false;
    for (let rate of data.rate_response.rates) {
      const radioInput = document.createElement("input");
      radioInput.id = rate.rate_id;
      radioInput.value = rate.rate_id;
      radioInput.type = "radio";
      radioInput.setAttribute("name", "rates");

      const label = document.createElement("label");
      const totalAmount = rate.shipping_amount.amount + rate.insurance_amount.amount + rate.confirmation_amount.amount + rate.other_amount.amount;
      label.setAttribute("for", rate.rate_id);
      label.textContent = `$${totalAmount.toFixed(2)} - ${rate.service_type} / ${rate.delivery_days} day(s)`;

      if (!defaultChecked) {
        radioInput.setAttribute("checked", "checked");
        defaultChecked = true;
      }

      const inputWrapper = document.createElement("div");
      inputWrapper.classList.add("py-1");

      inputWrapper.append(radioInput);
      inputWrapper.append(label);

      rateInputList.append(inputWrapper);
    }
    return true;
  }
  catch (e) {
    loading(false);
    showError("There was an issue with retrieving rates");
    return false;
  }
}

export function populateRatePage() {

  //From Address
  const fromAddress = getLocalStorageItem("fromAddress");

  const fromName = document.querySelector("#rate-from-summary .name");
  fromName.innerHTML = "";
  fromName.textContent = fromAddress.name;

  const fromStreetAdress = document.querySelector("#rate-from-summary .street-address");
  fromStreetAdress.innerHTML = "";
  fromStreetAdress.textContent = `${fromAddress.address_line1} ${fromAddress.address_line2}`;

  const fromCityStateZip = document.querySelector("#rate-from-summary .city-state-zip");
  fromCityStateZip.innerHTML = "";
  fromCityStateZip.textContent = `${fromAddress.city_locality}, ${fromAddress.state_province}, ${fromAddress.postal_code}`;

  // To Address
  const toAddress = getLocalStorageItem("toAddress");

  const toName = document.querySelector("#rateToSummary .name");
  toName.innerHTML = "";
  toName.textContent = toAddress.name;

  const toStreetAdress = document.querySelector("#rateToSummary .street-address");
  toStreetAdress.innerHTML = "";
  toStreetAdress.textContent = `${toAddress.address_line1} ${toAddress.address_line2}`;

  const toCityStateZip = document.querySelector("#rateToSummary .city-state-zip");
  toCityStateZip.innerHTML = "";
  toCityStateZip.textContent = `${toAddress.city_locality}, ${toAddress.state_province}, ${toAddress.postal_code}`;

  // dimensions
  const dimensions = getLocalStorageItem("dimensions");
  const weight = getLocalStorageItem("weight");

  const dimensionWeight = document.querySelector("#rate-dimension-weight-summary");

  dimensionWeight.innerHTML = "";
  dimensionWeight.textContent = `${weight.pounds ? weight.pounds : "0"}lb(s), ${weight.ounces ? weight.ounces : "0"}oz (${dimensions.length} x ${dimensions.width} x ${dimensions.height} in)`;
}