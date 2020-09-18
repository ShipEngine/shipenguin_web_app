export function getLocalStorageItem(key) {
  const current = getLocalStorageBlob();
  return current[key];
}

export function clearLocalStorage() {
  localStorage.removeItem("shippenguin");
  // Clear all user inputs
}

export function setLocalStorage(key, value) {
  const current = getLocalStorageBlob();
  current[key] = value;
  localStorage.setItem("shippenguin", JSON.stringify(current));
}

export function getLocalStorageBlob() {

  let shipPenguinString = localStorage.getItem("shippenguin");
  if (!shipPenguinString) {
    localStorage.setItem("shippenguin", "{}");
    shipPenguinString = "{}";
  }

  return JSON.parse(shipPenguinString);
}

export function setLocalStorageBlob(blob) {
  localStorage.setItem("shippenguin", JSON.stringify(blob));
}

export function clearInputs() {
  // From Address
  document.getElementById("from-name").value = "";
  document.getElementById("from-address1").value = "";
  document.getElementById("from-address2").value = "";
  document.getElementById("from-city").value = ""
  document.getElementById("from-state").value = "";
  document.getElementById("from-zip").value = ""

  // To Address
  document.getElementById("to-name").value = "";
  document.getElementById("to-address1").value = "";
  document.getElementById("to-address2").value = "";
  document.getElementById("to-city").value = "";
  document.getElementById("to-state").value = "";
  document.getElementById("to-zip").value = "";

  // Package Weight
  document.getElementById("weight-lbs").value = "";
  document.getElementById("weight-ounces").value = "";

  // Dimensions
  document.getElementById("length").value = "";
  document.getElementById("width").value = "";
  document.getElementById("height").value = "";
}