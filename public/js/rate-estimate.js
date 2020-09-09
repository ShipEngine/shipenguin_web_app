import { getLocalStorageItem } from "./local-storage.js";

export function rateEstimate() {

  console.log("STEP: Estimate");
  const rateBody = {
    // It is recommended to obfuscate carrier_ids when possible. Ours are added on the server side when the
    // request is made, before sending off to ShipEngine API.
    rate_options: {
      carrier_ids: []
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

  return fetch("/rates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(rateBody)
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      const rateSelectList = document.getElementById("estimated-rates");
      rateSelectList.innerHTML = "";
      for(let rate of data.rate_response.rates) {
        const option = document.createElement("option");
        option.id = rate.rate_id;
        option.value = rate.rate_id;
        const totalAmount = rate.shipping_amount.amount + rate.insurance_amount.amount + rate.confirmation_amount.amount + rate.other_amount.amount;
        option.textContent = `$${totalAmount.toFixed(2)} - ${rate.service_type} / ${rate.delivery_days} day(s)`;

        rateSelectList.append(option);
      }
  });
}
