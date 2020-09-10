import { getLocalStorageItem } from "./local-storage.js";
import { showError } from "./ui-helpers.js";

export async function getLabel() {
  console.log("=== STEP XX: Get Label ===");
  // $(".label_preview").attr("src", "/images/ajax-loading.gif");

  console.log(localStorage.getItem("rateId"));

  const labelBody = { "rate": getLocalStorageItem("rateID") };

  console.log(labelBody);

  try {
    const response = await fetch("/label", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(labelBody)
    })
    const data = await response.json();
    return { pdf: data.label_download.pdf, zpl: data.label_download.zpl, png: data.label_download.png };
  }
  catch(e) {
    showError("Unable to create label");
  }
  // var labelPdf = data.label_download.pdf;
  // var labelImage = data.label_download.png;

  // $("#labelPlaceholder").attr("href", labelPdf);
  // $(".label_preview").attr("src", labelImage);

}