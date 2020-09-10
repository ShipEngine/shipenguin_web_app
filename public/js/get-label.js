import { getLocalStorageItem } from "./local-storage.js";

export function getLabel() {
  console.log("=== STEP XX: Get Label ===");
  // $(".label_preview").attr("src", "/images/ajax-loading.gif");

  console.log(localStorage.getItem("rateId"));

  const labelBody = {"rate": getLocalStorageItem("rateID")};

  console.log(labelBody);

  return fetch("/label", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(labelBody)
  })
    .then(function (response) {
      return response.json();
    }).then(function (data) {

    console.log(data);
    return { pdf: data.label_download.pdf, zpl: data.label_download.zpl, png: data.label_download.png };
    // var labelPdf = data.label_download.pdf;
    // var labelImage = data.label_download.png;

    // $("#labelPlaceholder").attr("href", labelPdf);
    // $(".label_preview").attr("src", labelImage);

  })
}