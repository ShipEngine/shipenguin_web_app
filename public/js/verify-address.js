import { setLocalStorage } from "./local-storage.js";

export function verifyAddress(data, statusButton, unique) {

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

  const addressDataFormat = JSON.stringify(addressData);

  console.log('Format address to verify with SE');
  console.log(addressDataFormat);

  // Reset button status while verifing
  // statusButton.className = "tag verify is-warning"
  // statusButton.innerHTML = `<i class="fas fa-cog fa-spin"></i>Verifying via ShipEngine`;

  ///// STEP TWO (B): Check with SHIPENGINE -> router.post('/verify') //////
  return fetch("/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: addressDataFormat
  })
    .then(function (response) {
      return response.json();
    }).then(function (data) {

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

      return data[0].status === "verified" && data[1].status === "verified";
    });
}