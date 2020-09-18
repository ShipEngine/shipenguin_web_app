import { getLocalStorageItem } from "./local-storage.js";

export async function sendEmail(labelUrls, email){
  const emailBody = {
    labelUrls,
    email: getLocalStorageItem("email")
  }
  await fetch("/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(emailBody)
  })
}