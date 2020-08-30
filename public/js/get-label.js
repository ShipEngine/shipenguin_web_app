export function getLabel() {
  console.log("=== STEP XX: Get Label ===");
  $(".label_preview").attr("src", "/images/ajax-loading.gif");

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
    var labelPdf = data.label_download.pdf;
    var labelImage = data.label_download.png;

    $("#labelPlaceholder").attr("href", labelPdf);
    $(".label_preview").attr("src", labelImage);

  })
}