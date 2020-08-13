localStorage.clear();

//////////////////////////////////////////
///// STEP ONE: Google Autocomplete //////
var placeSearch, autocomplete, autocomplete2;
var componentForm = {
  street_number: 'short_name',
  route: 'long_name',
  locality: 'long_name',
  administrative_area_level_1: 'short_name',
  country: 'long_name',
  postal_code: 'short_name'
};

function initAutocomplete() {

  autocomplete = new google.maps.places.Autocomplete(
  /** @type {!HTMLInputElement} */
    (document.getElementById('autocomplete')), {
      types: ['geocode']
    });


  autocomplete.addListener('place_changed', function () {
    $('#verify').toggleClass('is-hidden');
    fillInAddress(autocomplete, "");
  });

  autocomplete2 = new google.maps.places.Autocomplete(
  /** @type {!HTMLInputElement} */
    (document.getElementById('autocomplete2')), {
      types: ['geocode']
    });
  autocomplete2.addListener('place_changed', function () {
    $('#verify2').toggleClass('is-hidden');
    fillInAddress(autocomplete2, "2");
  });

}

function fillInAddress(autocomplete, unique) {
  var place = autocomplete.getPlace();

  for (var component in componentForm) {
    if (!!document.getElementById(component + unique)) {
      document.getElementById(component + unique).value = '';
      document.getElementById(component + unique).disabled = false;
    }
  }

  for (var i = 0; i < place.address_components.length; i++) {
    var addressType = place.address_components[i].types[0];
    if (componentForm[addressType] && document.getElementById(addressType + unique)) {
      var val = place.address_components[i][componentForm[addressType]];
      document.getElementById(addressType + unique).textContent = val;
    }
  }
  const statusButton = document.getElementById("verify" + unique);

  verifyAddressWithShipEngine(place, statusButton, unique);
}

google.maps.event.addDomListener(window, "load", initAutocomplete);

function geolocate() {
  $("#autocomplete").attr("autocomplete", "new-password");
  $("#autocomplete2").attr("autocomplete", "new-password");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    });
  }
}

///// END STEP ONE: Google Autocomplete //////
/////////////////////////////////////////////

/////////////////////////////////////////////
///// STEP TWO: Verify with ShipEngine //////
function verifyAddressWithShipEngine(data, statusButton, unique) {
  const addressData = [];
  var store = false;
  var obj = {};

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
      val = streetNumber + " " + val;
    }
    if (addressType == "locality") {
      addressType = "city_locality"
    }
    ;
    if (addressType == "administrative_area_level_1") {
      addressType = "state_province"
    }
    ;
    // Translating and hardcoding US
    if (addressType == "country") {
      addressType = "country_code";
      val = "US";
    }
    ;

    var store = true;

    if (store == true) {
      obj[addressType] = val;
    }

  }
  addressData.push(obj);

  // Name is assocaited with Address for ShipEngine
  if (unique != 2) {
    obj["name"] = $('#my_name').val();
  } else {
    obj["name"] = $('#rep_name').val();
  }
  // adding a placeholder because we don't ask for phone number
  obj["phone"] = "111-111-1111";
  // adding a placeholder because we don't ask for phone number

  const addressDataFormat = JSON.stringify(addressData);

  console.log('Format address to verify with SE');
  console.log(addressDataFormat);

  // Reset button status while verifing
  statusButton.className = "tag verify is-warning"
  statusButton.innerHTML = '<i class="fas fa-cog fa-spin"></i>Verifying via ShipEngine';

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

    // Check Satus
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

///// END STEP TWO: Verify with ShipEngine //////
/////////////////////////////////////////////


$('#goToStep2').click(function () {
  $('.container').removeClass('step0 step1 step2 step3');
  $('.container').addClass('step1');
  $('.step_one').addClass('is-hidden');
  $('.step_two').removeClass('is-hidden');
  $('.steps-segment').removeClass('is-active');
  $('.steps-segment:nth-child(2)').addClass('is-active');
});

$('.package_type, .package_type button').click(function (event) {
  event.preventDefault();
  if (!$('.package_type').hasClass('is-inactive')) {
    $('.rate_list').animate({top: 0}, 800);
  }
});

$('.rate_list .close').click(function (event) {
  event.preventDefault()
  $('.rate_list').animate({top: "-100%"}, 800);
});

$("body").on("click", ".newRate", function (event) {
  event.preventDefault();
  $('.rate_list').animate({top: "-100%"}, 800);
  var newPackageId = $(this).attr('id');
  var newPackageService = $(this).find('strong').text();
  var newPackageName = $(this).find('em').text();
  var newPackagePrice = $(this).find('span').text();
  var newServiceClass = $(this).find('strong').text();
  console.log(newPackageId + newServiceClass + newPackageName + " " + newPackagePrice);
  var stripePrice = newPackagePrice.replace('$', '');

  // overwriting baseRate and storing
  localStorage.setItem("rateId", newPackageId);
  localStorage.setItem("ratePrice", stripePrice);
  localStorage.setItem("userSelectedServiceClass", newServiceClass);
  console.log("New Rate ID: " + newPackageId + " New Label Price: " + stripePrice + " New Service Class: " + newServiceClass);

  $('.package_label').text(newPackageService + newPackageName);
  $('.rate span').text(newPackagePrice);
  $('.final_price strong').text('$' + stripePrice);
  $('.final_price span').text(newServiceClass + " shipment");
});

$('#goToStep3').click(function (event) {
  event.preventDefault();
  $('#mainBox').css('margin-left', '');
  if (($('.checkHazardous:checked').is(':checked')) && ($('.checkTcs:checked').is(':checked'))) {
    // Container Adjust
    $('.container').removeClass('step0 step1 step2 step3');
    $('.container').addClass('step2');
    $('.step_two').slideUp();
    $('.step_three').slideDown().removeClass('is-hidden');

    // Steps Adjust
    $('.steps-segment').removeClass('is-active');
    $('.steps-segment:nth-child(3)').addClass('is-active');

    // Send new price to stripe
    console.log("pre step 3");
    console.log(localStorage.getItem("rateId"));
    pay(localStorage.getItem("ratePrice"));
  } else {
    $('.t_and_c .checkbox').addClass('is-error');
  }


});

$("#step_two_form input").change(function (e) {
  console.log('=== STEP: Form and data check ===');

  $('#cog').addClass('fa-spin');

  if (localStorage.getItem("address2") != null) {
    var ship_to = JSON.parse(localStorage.getItem("address2"))[0];
  }
  if (localStorage.getItem("address") != null) {
    var ship_from = JSON.parse(localStorage.getItem("address"))[0];
  }

  if ($('.weight_lb').val() === '') {
    $('.weight_lb').val(0);
  }

  if (!$('#size_length').val()) {
    var size_length = 0;
  } else {
    var size_length = $('#size_length').val();
  }

  if (!$('#size_width').val()) {
    var size_width = 0;
  } else {
    var size_width = $('#size_width').val();
  }

  if (!$('#size_height').val()) {
    var size_height = 0;
  } else {
      var size_height = $('#size_height').val();
  }

  // Calculate weight
  var lbs = $('#weight_lb').val();
  var oz = $('#weight_oz').val();
  var totalWeight = (lbs * 16) + oz;

  // Calculate size

  var someData =
    {
      // It is recommended to obfuscate carrier_ids when possible.
      rate_options: {
        "carrier_ids": [
          "se-256091"
        ],  // TODO: confirm with robertbahn if we want to
        // "package_types": [
        //   "package"
        // ]
      },
      shipment: {
        validate_address: "no_validation",
        ship_to: ship_to,
        ship_from: ship_from,
        packages: [
          {
            "weight": {
              "value": totalWeight,
              "unit": "ounce"
            },
            "dimensions": {
              "unit": "inch",
              "length": size_length,
              "width": size_width,
              "height": size_height
            }
          }
        ]
      }
    };

  var dataArray = [ship_to, ship_from, totalWeight, size_length, size_width, size_height];
  console.log(dataArray);
  if (!dataArray.includes(undefined)) {
    console.log('exsists');
    var packages = JSON.stringify(someData);
    estimate(packages);
  }
});

$('#addPackageOption').click(function (event) {
  event.preventDefault();
  $('#packageDimForm').toggleClass('is-hidden');
  $('#size_length').val('');
  $('#size_width').val('');
  $('#size_height').val('');
});

function estimate(someData) {
  console.log('STEP: Estimate');

  fetch("/rates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: someData
  })
    .then(function (response) {
      return response.json();
    }).then(function (data) {
      console.log(data);

    // console.log(data.rate_response.rates[0]);
    var baseRate = data.rate_response.rates[0].shipping_amount.amount;
    var rateId = data.rate_response.rates[0].rate_id;
    var baseServiceType = data.rate_response.rates[0].service_type;
    var basePackageType = data.rate_response.rates[0].package_type;

    console.log("=== RATE ID ===");
    console.log(rateId);

    // Run actions with base rate data
    $('.rate span').text('$' + baseRate.toFixed(2));
    $('.final_price strong').text('$' + baseRate.toFixed(2));
    $('.package_type').removeClass('is-inactive');
    $('.package_type .package_label').text(baseServiceType + ' ' + basePackageType);
    $('.rate_box .rate').addClass('is-active');

    // Allow to go to Step 3
    $('#goToStep3').removeAttr("disabled").removeClass('is-inactive').addClass('is-success');

    // Store base rate ID
    localStorage.setItem("rateId", rateId);
    localStorage.setItem("ratePrice", baseRate);
    localStorage.setItem("serviceClass", baseServiceType);
    console.log("Base Rate ID: " + rateId + " Base Label Price: " + baseRate + " Base Service Class: " + baseServiceType);

    $('#labelSummaryText').text(baseServiceType + " shipment");

    console.log("rateId: " + localStorage.getItem("rateId"));
    console.log("ratePrice: " + localStorage.getItem("ratePrice"));

    $(data.rate_response.rates).each(function () {
      console.log(this);
      $('.rate_holder').append('<div class="newRate" id="' + this.rate_id + '"><strong>' + this.service_type + '</strong><em>' + ' ' + format_package_codes(this.package_type) + '</em><span>$' + this.shipping_amount.amount + '</span></div>');
    });

    $('#nextButton').removeClass('is-hidden');

  });
}

$('#nextButton').click(function(event) {
  event.preventDefault();
  $('#nextButton button').addClass('is-loading');
  $('#mainBox').css('margin-left', '-115px');
  $('aside').removeClass('is-hidden');
  $(this).fadeOut(1000, function () {
    $(this).remove();
  });
});

// A reference to Stripe.js initialized with your real test publishable API key.
var stripe = Stripe("pk_test_0gDWcjB7xWWgt34p1UQoCxFH00CcruEzwb");

function pay(storedRate) {
  console.log("=== STEP Pay() ===");
  console.log(storedRate);

  var rate = {"rate": storedRate};

  fetch("/create-payment-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(rate)
  })
    .then(function (result) {
      return result.json();
    })
    .then(function (data) {
      var elements = stripe.elements();

      var style = {
        base: {
          color: "#32325d",
          fontFamily: 'Arial, sans-serif',
          fontSmoothing: "antialiased",
          fontSize: "16px",
          "::placeholder": {
            color: "#32325d"
          }
        },
        invalid: {
          fontFamily: 'Arial, sans-serif',
          color: "#fa755a",
          iconColor: "#fa755a"
        }
      };

      var card = elements.create("card", {style: style});
      // Stripe injects an iframe into the DOM
      card.mount("#card-element");

      card.on("change", function (event) {
        // Disable the Pay button if there are no card details in the Element
        document.querySelector("button").disabled = event.empty;
        document.querySelector("#card-errors").textContent = event.error ? event.error.message : "";
      });

      var form = document.getElementById("payment-form");
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        // Complete payment when the submit button is clicked
        payWithCard(stripe, card, data.clientSecret);
      });
    });


}

// Calls stripe.confirmCardPayment
// If the card requires authentication Stripe shows a pop-up modal to
// prompt the user to enter authentication details without leaving your page.
var payWithCard = function (stripe, card, clientSecret) {
  loading(true);
  stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: card
    }
  })
    .then(function (result) {
      if (result.error) {
        // Show error to your customer
        showError(result.error.message);
      } else {
        // The payment succeeded!
        orderComplete(result.paymentIntent.id);
      }
    });
};

/* ------- UI helpers ------- */

// Shows a success message when the payment is complete
var orderComplete = function (paymentIntentId) {
  loading(false);
  //   document
  //     .querySelector(".result-message a")
  //     .setAttribute(
  //       "href",
  //       "https://dashboard.stripe.com/test/payments/" + paymentIntentId
  //     );

  // RELEASE THE HOUNDS!
  console.log('=== STEP XX: Release the hounds! I mean form ===');
  getLabel();
  $('.result-message').removeClass("is-hidden");
  $('.container').removeClass('step0 step1 step2 step3');
  $('.container').addClass('step3');
  $('.step_three').addClass('is-hidden');
  $('.step_four').removeClass('is-hidden');
  // Steps Adjust
  $('.steps-segment').removeClass('is-active');
  $('.steps-segment:nth-child(4)').addClass('is-active');

  document.querySelector("button").disabled = true;
};

// Show the customer the error from Stripe if their card fails to charge
var showError = function (errorMsgText) {
  loading(false);
  var errorMsg = document.querySelector("#card-errors");
  errorMsg.textContent = errorMsgText;
  setTimeout(function () {
    errorMsg.textContent = "";
  }, 4000);
};

// Show a spinner on payment submission
var loading = function (isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("button").disabled = true;
  } else {
    document.querySelector("button").disabled = false;
  }
};

function getLabel() {
  console.log('=== STEP XX: Get Label ===');
  $('.label_preview').attr("src", '/images/ajax-loading.gif');

  console.log(localStorage.getItem("rateId"));

  var rate = {"rate": localStorage.getItem("rateId")};

  console.log(rate);

  fetch("/label", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(rate)
  })
    .then(function (response) {
      return response.json();
    }).then(function (data) {

    console.log(data);
    var labelPdf = data.label_download.png;
    var labelImage = data.label_download.png;

    $('#labelPlaceholder').attr("href", labelPdf);
    $('.label_preview').attr("src", labelImage);

  })
}

// util functions
function format_package_codes(str) {
  let newStr = str.split("_");

  for (let i = 0; i < newStr.length; i++) {
    newStr[i] = newStr[i][0].toUpperCase() + newStr[i].substr(1);
  }
  return newStr.join(" ");
}
