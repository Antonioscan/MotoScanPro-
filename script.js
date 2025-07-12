window.addEventListener("load", function () {
  const splash = document.getElementById("splash");
  const app = document.getElementById("app");

  setTimeout(() => {
    splash.style.display = "none";
    app.style.display = "block";
  }, 1500); // Splash visibile per 1.5 secondi
});

document.getElementById("snapBtn").addEventListener("click", function () {
  const fileInput = document.getElementById("fileInput");
  const result = document.getElementById("result");

  if (!fileInput.files || fileInput.files.length === 0) {
    result.textContent = "Nessun file selezionato.";
    return;
  }

  result.textContent = "Analisi immagine in corso...";

  setTimeout(() => {
    result.innerHTML = "<strong>Pinza freno radiale rilevata – Ducati</strong>";
  }, 1500);
});
