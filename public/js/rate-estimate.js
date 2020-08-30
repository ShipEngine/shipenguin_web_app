export function rateEstimate(someData) {
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

    $('.newRate').remove();

    $(data.rate_response.rates).each(function () {
      console.log(this);
      $('.rate_holder').append('<div class="newRate" id="' + this.rate_id + '"><strong>' + this.service_type + '</strong><em>' + ' ' + format_package_codes(this.package_type) + '</em><span>$' + this.shipping_amount.amount + '</span></div>');
    });

    $('#nextButton').removeClass('is-hidden');

  });
}

function format_package_codes(str) {
  let newStr = str.split("_");

  for (let i = 0; i < newStr.length; i++) {
    newStr[i] = newStr[i][0].toUpperCase() + newStr[i].substr(1);
  }
  return newStr.join(" ");
}
