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

    // Pulizia del prefisso base64
    const base64Image = images[0].replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Image, 'base64');

    const response = await fetch(
      'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.hf_token}`,
          'Content-Type': 'image/jpeg',
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
      body: JSON.stringify({
        error: "Errore durante l'analisi",
        details: err.message,
      }),
    };
  }
};
