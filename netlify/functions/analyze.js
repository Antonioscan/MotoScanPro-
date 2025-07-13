const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const { images } = JSON.parse(event.body);

    if (!images || images.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Nessuna immagine ricevuta' }),
      };
    }

    const responses = await Promise.all(
      images.map((img) =>
        fetch('https://api-inference.huggingface.co/models/google/vit-base-patch16-224', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: `data:image/jpeg;base64,${img}`,
          }),
        }).then((res) => res.json())
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, results: responses }),
    };
  } catch (err) {
    console.error('Errore AI:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Errore durante l’elaborazione AI' }),
    };
  }
};
