const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const { imageBase64 } = JSON.parse(event.body);

    if (!imageBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Image not provided" }),
      };
    }

    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/beit-base-patch16-224', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          image: imageBase64,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: err }),
      };
    }

    const result = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ result }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
