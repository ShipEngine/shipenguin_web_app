import { setLocalStorage } from "./local-storage.js";
import { showError, loading } from "./ui-helpers.js";

export async function verifyAddress() {

  const fromName = document.getElementById("from-name").value;
  const fromAddress1 = document.getElementById("from-address1").value;
  const fromAddress2 = document.getElementById("from-address2").value;
  const fromCity = document.getElementById("from-city").value;
  const fromState = document.getElementById("from-state").value;
  const fromZip = document.getElementById("from-zip").value;

  const toName = document.getElementById("to-name").value;
  const toAddress1 = document.getElementById("to-address1").value;
  const toAddress2 = document.getElementById("to-address2").value;
  const toCity = document.getElementById("to-city").value;
  const toState = document.getElementById("to-state").value;
  const toZip = document.getElementById("to-zip").value;

  const addressData = [
    {
      name: fromName,
      address_line1: fromAddress1,
      address_line2: fromAddress2,
      city_locality: fromCity,
      state_province: fromState,
      postal_code: fromZip,
      country_code: "US"
    },
    {
      name: toName,
      address_line1: toAddress1,
      address_line2: toAddress2,
      city_locality: toCity,
      state_province: toState,
      postal_code: toZip,
      country_code: "US"
    }
  ];

  let data = [];

  loading(true);
  try {
    const response = await fetch("/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(addressData)
    })

    data = await response.json();

    data.forEach((item, index) => {
      if (item.status === "verified") {
        const key = index === 0 ? "fromAddress" : "toAddress";
        setLocalStorage(key, item.matched_address);
      }
      else {
        // error status types ("unverified, warning, error")
        const addressName = index === 0 ? "Shipping From" : "Shipping To";
        window.alert(`Could not verify ${addressName} address`);
      }
    });

    loading(false);

    return true;

  }
  catch (e) {
    showError("Unable to verify your addresses");
    loading(false);
    return false;
  }


}