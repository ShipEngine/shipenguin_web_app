import { getLocalStorageItem } from "./local-storage.js";

export function sendEmail(labelUrls, email){
  const emailBody = {
    labelUrls,
    email: getLocalStorageItem("email")
  }
  return fetch("/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(emailBody)
  })
}