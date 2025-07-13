import fetch from 'node-fetch';

export const handler = async (event) => {
  try {
    // Parsing del corpo JSON
    const { images } = JSON.parse(event.body);

    if (!images || images.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Nessuna immagine fornita' }),
      };
    }

    // Estrazione e conversione della prima immagine base64
    const base64Image = images[0].replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // Verifica se il token è disponibile (per debug, non mostrare in produzione)
    if (!process.env.HF_TOKEN) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Variabile ambiente HF_TOKEN mancante" }),
      };
    }

    // Chiamata API Hugging Face
    const response = await fetch(
      'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'image/jpeg',
        },
        body: imageBuffer,
      }
    );

    // Gestione di errori dalla response
    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: "Errore dalla API Hugging Face",
          details: errorText,
        }),
      };
    }

    // Parsing della risposta
    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };

  } catch (err) {
    // Gestione errore interno
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Errore durante l'analisi",
        details: err.message,
      }),
    };
  }
};
