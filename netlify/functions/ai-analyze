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

    const base64Image = images[0];

    const openaiToken = process.env.OPENAI_API_KEY;
    if (!openaiToken) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Variabile ambiente OPENAI_API_KEY mancante' }),
      };
    }

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
                text: 'Descrivi in modo dettagliato e oggettivo l’oggetto mostrato nella foto. Spiega cos’è, a cosa potrebbe servire, e come potrebbe essere usato. Usa un linguaggio semplice adatto per una descrizione online.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image,
                },
              },
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
        error: 'Errore interno durante l\'analisi',
        details: err.message,
      }),
    };
  }
};
