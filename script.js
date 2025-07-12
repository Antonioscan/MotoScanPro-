// Simulazione di riconoscimento ricambio (demo)
function riconosciRicambio(file, tipoRicambio) {
  // Simula un tempo di elaborazione
  setTimeout(() => {
    const imageUrl = "https://i.imgur.com/qK42fUu.jpg"; // immagine reale

    document.getElementById("scheda").innerHTML = `
      <img src="${imageUrl}" alt="Albero Frizione" class="product-image" />
      <h2>ALBERO FRIZIONE</h2>
      <div class="product-info">
        <div>
          <strong>Codice</strong><br />
          67040151A
        </div>
        <div style="text-align: right;">
          <strong>Prezzo medio ${tipoRicambio === "nuovi" ? "nuovo" : "usato"}</strong><br />
          € ${tipoRicambio === "nuovi" ? "140,00" : "80,00"}
        </div>
      </div>
      <p>
        Albero frizione per Ducati Monster 1200, parte del meccanismo di azionamento della frizione manuale. Include leva della frizione integrata con molla di ritorno. Presenta segni di ${tipoRicambio === "usati" ? "usura, ossidazione e sporco" : "lavorazione CNC e anodizzazione"}.
      </p>
      <button class="btn-ebay">Crea inserzione eBay</button>
    `;

    document.querySelector(".btn-ebay").addEventListener("click", () => {
      alert("Inserzione eBay generata! (funzione in sviluppo)");
    });
  }, 1000);
}

// Fotocamera da input
function scattaFoto(tipoRicambio) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "environment";
  input.style.display = "none";

  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Mostra messaggio di caricamento
      document.getElementById("scheda").innerHTML = "<p>🔍 Riconoscimento in corso...</p>";
      riconosciRicambio(file, tipoRicambio);
    }
  };

  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
}

// Collegamento pulsanti
document.getElementById("btn-nuovi").addEventListener("click", () => scattaFoto("nuovi"));
document.getElementById("btn-usati").addEventListener("click", () => scattaFoto("usati"));
