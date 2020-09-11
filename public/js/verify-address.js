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

  try {
    const response = await fetch("/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(addressData)
    })

    data = await response.json();

    const fromVerifiedIcon = document.getElementById("from-address-verified");
    const fromUnVerifiedIcon = document.getElementById("from-address-unverified");

    const toVerifiedIcon = document.getElementById("to-address-verified");
    const toUnVerifiedIcon = document.getElementById("to-address-unverified");

    let isVerified = true;
    for (let i = 0; i < data.length; i++) {
      const key = i === 0 ? "fromAddress" : "toAddress";
      console.log(`${key}: ${data[i].status}`);
      if (data[i].status === "verified") {
        setLocalStorage(key, data[i].matched_address);

        if(key === "fromAddress") {
          fromVerifiedIcon.classList.remove("hidden");
          fromUnVerifiedIcon.classList.add("hidden");
          
        }
        else {
          toVerifiedIcon.classList.remove("hidden");
          toUnVerifiedIcon.classList.add("hidden");

        }
      }
      else {
        // error status types ("unverified, warning, error")
        const addressName = i === 0 ? "Shipping From" : "Shipping To";
        // window.alert(`Could not verify ${addressName} address`);

        if(key === "fromAddress") {
          fromVerifiedIcon.classList.add("hidden");
          fromUnVerifiedIcon.classList.remove("hidden");

        }
        else {
          toVerifiedIcon.classList.add("hidden");
          toUnVerifiedIcon.classList.remove("hidden");
        }

        isVerified = false;
      }
    }

    return isVerified;
  }
  catch (e) {
    // showError("Unable to verify your addresses");
    loading(false);
    return false;
  }


}