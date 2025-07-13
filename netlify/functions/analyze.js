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

    // Usa solo la prima immagine per ora
    const firstImage = images[0];

    const response = await fetch('https://api-inference.huggingface.co/models/google/vit-base-patch16-224', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer TUO_TOKEN_HUGGINGFACE', // 🔁 Inserisci il tuo token reale
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          image: firstImage,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({
          errorType: 'HuggingFaceError',
          errorMessage: error,
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
      body: JSON.stringify({
        errorType: 'Error',
        errorMessage: error.message || 'Errore interno',
      }),
    };
  }
};
