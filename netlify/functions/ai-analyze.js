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

    const response = await fetch('https://api-inference.huggingface.co/models/google/vit-base-patch16-224', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          image: images[0],
        },
      }),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify(result),
      };
    } else {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: 'Errore API Hugging Face',
          details: result,
        }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Errore durante l'analisi",
        message: error.message,
      }),
    };
  }
};
