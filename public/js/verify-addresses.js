import { setLocalStorage } from "./local-storage.js";

export async function verifyAddresses() {
  const verified = {
    fromAddress: false,
    toAddress: false,
  };

  try {
    const fromName = document.getElementById("from-name").value;
    const fromAddress1 = document.getElementById("from-address1").value;
    const fromAddress2 = document.getElementById("from-address2").value;
    const fromCity = document.getElementById("from-city").value;
    const fromState = document.getElementById("from-state").value;
    const fromZip = document.getElementById("from-zip").value;
    const fromVerified = document.getElementById("from-address-verified");

    const toName = document.getElementById("to-name").value;
    const toAddress1 = document.getElementById("to-address1").value;
    const toAddress2 = document.getElementById("to-address2").value;
    const toCity = document.getElementById("to-city").value;
    const toState = document.getElementById("to-state").value;
    const toZip = document.getElementById("to-zip").value;
    const toVerified = document.getElementById("to-address-verified");

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

    const response = await fetch("/verify-addresses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(addressData)
    })

    const verificationData = await response.json();

    if (verificationData.length === 2) {
      verified.fromAddress = verifyAddress("fromAddress", fromVerified, verificationData[0]);
      verified.toAddress = verifyAddress("toAddress", toVerified, verificationData[1]);
    }
  }
  catch (error) {
    console.error(error);
  }

  return verified;
}


function verifyAddress(addressName, verifiedIcon, { status, matched_address }) {
  if (status === "verified") {
    setLocalStorage(addressName, matched_address);
    verifiedIcon.classList.remove("hidden");
    return true;
  }
  else {  // error status types ("unverified, warning, error")
    verifiedIcon.classList.add("hidden");
    return false;
  }
}
