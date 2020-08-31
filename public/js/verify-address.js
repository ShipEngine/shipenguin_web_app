export function verifyAddressWithShipEngine(data, statusButton, unique) {
  const addressData = [];
  var store = false;
  var obj = {};

  let streetNumber;
  ///// STEP TWO (A): Clean //////
  for (var i = 0; i < data.address_components.length; i++) {
    var addressType = data.address_components[i].types[0];
    var val = data.address_components[i].short_name;

    // SHIPENGINE ADDRESS FORMAT
    // [{"address_line1":"Winchester Blvd","city_locality":"San Jose","state_province":"CA","postal_code":"78756","country_code":"US"}]

    // store street number and route into address_line1
    if (addressType == "street_number") {
      streetNumber = val;
      var store = false;
      continue;
    }
    if (addressType == "route") {
      addressType = "address_line1";
      if(streetNumber) {
        val = streetNumber + " " + val;
      }
    }
    if (addressType == "locality") {
      addressType = "city_locality";
    }
    if (addressType == "administrative_area_level_1") {
      addressType = "state_province";
    }
    
    // Translating and hardcoding US
    if (addressType == "country") {
      addressType = "country_code";
      val = "US";
    }

    var store = true;

    if (store == true) {
      obj[addressType] = val;
    }

  }
  addressData.push(obj);

  // Name is associated with Address for ShipEngine
  if (unique != 2) {
    obj["name"] = $("#my_name").val();
  } else {
    obj["name"] = $("#rep_name").val();
  }
  // adding a placeholder because we don't ask for phone number
  obj["phone"] = "111-111-1111";
  // adding a placeholder because we don't ask for phone number

  const addressDataFormat = JSON.stringify(addressData);

  console.log('Format address to verify with SE');
  console.log(addressDataFormat);

  // Reset button status while verifing
  statusButton.className = "tag verify is-warning"
  statusButton.innerHTML = `<i class="fas fa-cog fa-spin"></i>Verifying via ShipEngine`;

  ///// STEP TWO (B): Check with SHIPENGINE -> router.post('/verify') //////
  fetch("/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: addressDataFormat
  })
    .then(function (response) {
      return response.json();
    }).then(function (data) {
    // console.log(data);

    // Check Status
    if (data[0].status) {
      var status = data[0].status;
      if (status == "verified") {
        statusButton.className = "tag verify is-success";
        statusButton.innerHTML = "Verified by ShipEngine!";

        var whichUnique = "address" + unique;
        localStorage.setItem(whichUnique, addressDataFormat);

      } else if (status == "unverified") {
        statusButton.innerHTML = "Could not verify address";
      } else if (status == "warning") {
        statusButton.className += " is-danger";
        statusButton.innerHTML = "Error with Address! Please try again.";
      } else if (status == "error") {
        statusButton.className += " is-danger";
        statusButton.innerHTML = "Error with Address! Please try again.";
      }
    }
    ;
  });
}