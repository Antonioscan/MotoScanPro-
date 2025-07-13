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

    // Usa direttamente il base64 con prefisso data:image/... (OpenAI lo accetta così)
    const base64Image = images[0];

    // Verifica presenza token OpenAI
    const openaiToken = process.env.OPENAI_API_KEY;
    if (!openaiToken) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Variabile ambiente OPENAI_API_KEY mancante' }),
      };
    }

    // Chiamata API OpenAI Vision
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analizza tecnicamente il componente moto mostrato nella foto per creare una descrizione da usare in un’inserzione online.',
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
        max_tokens: 300,
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
