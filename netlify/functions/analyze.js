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

    // Usa la prima immagine
    const imageBase64 = images[0];
    const imageBuffer = Buffer.from(imageBase64, 'base64');

    const response = await fetch('https://api-inference.huggingface.co/models/google/vit-base-patch16-224', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`, // ✅ Sicuro: token da variabile ambiente
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({
          errorType: 'HuggingFaceError',
          errorMessage: errorText,
        }),
      };
    }

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Errore durante l'analisi", message: error.message }),
    };
  }
};
