function openCamera() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "environment"; // usa fotocamera posteriore
  input.style.display = "none";
  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      alert("Foto scattata: " + file.name);
      // Qui puoi aggiungere l'analisi AI o il caricamento
    }
  };
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
}

document.querySelectorAll(".btn-blue").forEach((btn) => {
  btn.addEventListener("click", openCamera);
});

document.querySelector(".btn-ebay").addEventListener("click", () => {
  alert("Creazione inserzione eBay in sviluppo!");
});
