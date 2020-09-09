export function getLocalStorageItem(key) {
  const current = getLocalStorageBlob();
  return current[key];
}

export function clearLocalStorage() {
  localStorage.removeItem("shippenguin");
  // Clear all user inputs
  $("#shipToAddress").val("");
  $("#shipFromAddress").val("");
  $("#emailAddress").val("");
}

export function setLocalStorage(key, value) {
  const current = getLocalStorageBlob();
  current[key] = value;
  localStorage.setItem("shippenguin", JSON.stringify(current));
}

export function getLocalStorageBlob() {

  let shipPenguinString = localStorage.getItem("shippenguin");
  if(!shipPenguinString) {
    localStorage.setItem("shippenguin", "{}");
    shipPenguinString = "{}";
  }

  return JSON.parse(shipPenguinString);
}

export function setLocalStorageBlob(blob) {
  localStorage.setItem("shippenguin", JSON.stringify(blob));
}