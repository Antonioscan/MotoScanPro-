document.querySelector("button").addEventListener("click", () => {
  const output = document.querySelector(".output");
  output.textContent = "Analisi in corso...";
  setTimeout(() => {
    output.textContent = "Pinza freno radiale rilevata - Ducati.";
  }, 3000);
});
