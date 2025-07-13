import fetch from 'node-fetch';

export const handler = async (event) => {
  try {
    const { images } = JSON.parse(event.body);

    if (!images || images.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Nessuna immagine fornita' }),
      };
    }

    // Decodifica l'immagine base64 in buffer
    const firstImageBase64 = images[0];
    const imageBuffer = Buffer.from(firstImageBase64, 'base64');

    // Invia l'immagine come blob binario al modello HF
    const response = await fetch(
      'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'image/jpeg', // o 'image/png' se necessario
        },
        body: imageBuffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: errorText }),
      };
    }

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Errore durante l'analisi", details: err.message }),
    };
  }
};
