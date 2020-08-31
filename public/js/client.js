import { initAutocomplete, geolocate } from "./address-auto-complete.js";
import { rateEstimate } from "./rate-estimate.js";

import { pay } from "./payment.js";
localStorage.clear();

window.addEventListener("load", (evt) => {

  initAutocomplete();


  $("#goToStep2").click(() => {
    $(".container").removeClass("step0 step1 step2 step3");
    $(".container").addClass("step1");
    $(".step_one").addClass("is-hidden");
    $(".step_two").removeClass("is-hidden");
    $(".steps-segment").removeClass("is-active");
    $(".steps-segment:nth-child(2)").addClass("is-active");
  });

  $(".package_type, .package_type button").click((evt) => {
    evt.preventDefault();
    if (!$(".package_type").hasClass("is-inactive")) {
      $(".rate_list").animate({ top: 0 }, 800);
    }
  });

  $(".rate_list .close").click((evt) => {
    evt.preventDefault()
    $(".rate_list").animate({ top: "-100%" }, 800);
  });

  $("body").on("click", ".newRate", (evt) => {
    evt.preventDefault();
    $(".rate_list").animate({ top: "-100%" }, 800);
    const newPackageId = $(this).attr("id");
    const newPackageService = $(this).find("strong").text();
    const newPackageName = $(this).find("em").text();
    const newPackagePrice = $(this).find("span").text();
    const newServiceClass = $(this).find("strong").text();
    console.log(newPackageId + newServiceClass + newPackageName + " " + newPackagePrice);
    const stripePrice = newPackagePrice.replace("$", "");

    // overwriting baseRate and storing
    localStorage.setItem("rateId", newPackageId);
    localStorage.setItem("ratePrice", stripePrice);
    localStorage.setItem("userSelectedServiceClass", newServiceClass);
    console.log("New Rate ID: " + newPackageId + " New Label Price: " + stripePrice + " New Service Class: " + newServiceClass);

    $(".package_label").text(newPackageService + newPackageName);
    $(".rate span").text(newPackagePrice);
    $(".final_price strong").text("$" + stripePrice);
    $(".final_price span").text(newServiceClass + " shipment");
  });

  $("#autocomplete").focus((evt) => {
    evt.target.setAttribute("autocomplete", "new-password");
    geolocate();
  });

  $("#autocomplete2").focus((evt) => {
    evt.target.setAttribute("autocomplete", "new-password");
    geolocate();
  });

  $("#my_name").focus((evt) => {
    evt.target.setAttribute("autocomplete", "new-password")
  });

  $("#rep_name").focus((evt) => {
    evt.target.setAttribute("autocomplete", "new-password");
  });

  $("#goToStep3").click((evt) => {
    evt.preventDefault();
    $("#mainBox").css("margin-left", "");
    if (($(".checkHazardous:checked").is(":checked")) && ($(".checkTcs:checked").is(":checked"))) {
      // Container Adjust
      $(".container").removeClass("step0 step1 step2 step3");
      $(".container").addClass("step2");
      $(".step_two").slideUp();
      $(".step_three").slideDown().removeClass("is-hidden");

      // Steps Adjust
      $(".steps-segment").removeClass("is-active");
      $(".steps-segment:nth-child(3)").addClass("is-active");

      // Send new price to stripe
      console.log("pre step 3");
      console.log(localStorage.getItem("rateId"));
      pay(localStorage.getItem("ratePrice"));
    } else {
      $(".t_and_c .checkbox").addClass("is-error");
    }
  });

  $("#step_two_form input:not([type=checkbox])").change((e) => {
    console.log("=== STEP: Form and data check ===");

    $("#cog").addClass("fa-spin");

    if (localStorage.getItem("address2") != null) {
      var ship_to = JSON.parse(localStorage.getItem("address2"))[0];
    }
    if (localStorage.getItem("address") != null) {
      var ship_from = JSON.parse(localStorage.getItem("address"))[0];
    }

    if ($(".weight_lb").val() === "") {
      $(".weight_lb").val(0);
    }

    if (!$("#size_length").val()) {
      var size_length = 0;
    } else {
      var size_length = $("#size_length").val();
    }

    if (!$("#size_width").val()) {
      var size_width = 0;
    } else {
      var size_width = $("#size_width").val();
    }

    if (!$("#size_height").val()) {
      var size_height = 0;
    } else {
      var size_height = $("#size_height").val();
    }

    // Calculate weight
    var lbs = $("#weight_lb").val();
    var oz = $("#weight_oz").val();
    var totalWeight = (lbs * 16) + oz;

    // Calculate size
    var someData =
    {
      // It is recommended to obfuscate carrier_ids when possible. Ours are added on the server side when the
      // request is made, before sending off to ShipEngine API.
      rate_options: {
        "carrier_ids": []
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

    const dataArray = [ship_to, ship_from, totalWeight, size_length, size_width, size_height];
    console.log(dataArray);
    if (!dataArray.includes(undefined)) {
      console.log("exists");
      const packages = JSON.stringify(someData);
      rateEstimate(packages);
    }
  });

  $("#addPackageOption").click((evt) => {
    evt.preventDefault();
    $("#packageDimForm").toggleClass("is-hidden");
    $("#size_length").val("");
    $("#size_width").val("");
    $("#size_height").val("");
  });



  $("#nextButton").click(function (event) {
    event.preventDefault();
    $("#nextButton button").addClass("is-loading");
    if (getWidth() >= 1585) {
      $("#mainBox").css("margin-left", "-115px");
    }
    $("aside").removeClass("is-hidden");
    $(this).fadeOut(1000, function () {
      $(this).remove();
    });
  });

});


function getWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}
