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
      const rateFieldSet = document.getElementById("step3Fieldset");
      rateFieldSet.innerHTML = "";
      let defaultChecked = false;
      for(let rate of data.rate_response.rates) {
        const radioInput = document.createElement("input");
        radioInput.id = rate.rate_id;
        radioInput.value = rate.rate_id;
        radioInput.type = "radio";
        radioInput.setAttribute("name", "rates");

        const label = document.createElement("label");
        const totalAmount = rate.shipping_amount.amount + rate.insurance_amount.amount + rate.confirmation_amount.amount + rate.other_amount.amount;
        label.setAttribute("for", rate.rate_id);
        label.textContent = `$${totalAmount.toFixed(2)} - ${rate.service_type} / ${rate.delivery_days} day(s)`;


        if(!defaultChecked) {
          radioInput.setAttribute("checked", "checked");
          defaultChecked = true;
        }

        rateFieldSet.append(radioInput);
        rateFieldSet.append(label);
        rateFieldSet.append(document.createElement("br"));
      }
  });
}
