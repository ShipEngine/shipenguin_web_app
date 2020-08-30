import { verifyAddressWithShipEngine } from "./verify-address.js";

let placeSearch, autocomplete, autocomplete2;
let componentForm = {
  street_number: "short_name",
  route: "long_name",
  locality: "long_name",
  administrative_area_level_1: "short_name",
  country: "long_name",
  postal_code: "short_name"
};


export function initAutocomplete() {

  autocomplete = new google.maps.places.Autocomplete(
  /** @type {!HTMLInputElement} */
    (document.getElementById("autocomplete")), {
      types: ["geocode"]
    });


  autocomplete.addListener("place_changed", function () {
    $("#verify").toggleClass("is-hidden");
    fillInAddress(autocomplete, "");
  });

  autocomplete2 = new google.maps.places.Autocomplete(
  /** @type {!HTMLInputElement} */
    (document.getElementById("autocomplete2")), {
      types: ["geocode"]
    });
  autocomplete2.addListener("place_changed", function () {
    $("#verify2").toggleClass("is-hidden");
    fillInAddress(autocomplete2, "2");
  });

}

function fillInAddress(autocomplete, unique) {

  var place = autocomplete.getPlace();

  for (var component in componentForm) {
    if (!!document.getElementById(component + unique)) {
      document.getElementById(component + unique).value = "";
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

export function geolocate() {
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