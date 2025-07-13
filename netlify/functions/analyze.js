import fetch from 'node-fetch';

export const handler = async (event) => {
  try {
    const { images } = JSON.parse(event.body || '{}');

    if (!images || !Array.isArray(images) || images.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Nessuna immagine fornita' }),
      };
    }

    // Limita a massimo 2 immagini
    const selectedImages = images.slice(0, 2);

    // Rimuove il prefisso base64 se presente (OpenAI lo richiede senza header in alcuni casi)
    const cleanBase64 = (dataUrl) =>
      dataUrl.replace(/^data:image\/\w+;base64,/, '');

    // Genera il contenuto con le immagini
    const imageContent = selectedImages.map((img) => ({
      type: 'image_url',
      image_url: {
        url: `data:image/jpeg;base64,${cleanBase64(img)}`
      }
    }));

    const openaiToken = process.env.OPENAI_API_KEY;
    if (!openaiToken) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Variabile ambiente OPENAI_API_KEY mancante' }),
      };
    }

    // Chiamata all’API OpenAI GPT-4o con visione
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Descrivi in italiano, in modo utile per una vendita online, l’oggetto mostrato nelle immagini. Includi materiali, utilizzo e stato se visibile.',
              },
              ...imageContent
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (data?.choices?.[0]?.message?.content) {
      return {
        statusCode: 200,
        body: JSON.stringify({ descrizione: data.choices[0].message.content }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Risposta non valida da OpenAI',
          details: data,
        }),
      };
    }
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
