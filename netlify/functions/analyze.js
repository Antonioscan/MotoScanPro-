import fetch from 'node-fetch';

export const handler = async (event) => {
  try {
    const { images } = JSON.parse(event.body);

    const response = await fetch('https://api-inference.huggingface.co/models/google/vit-base-patch16-224', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer YOUR_HUGGINGFACE_API_TOKEN',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: images.map((img) => ({ image: img })),
      }),
    });

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
        errorMessage: error.message,
        trace: error.stack.split('\n'),
      }),
    };
  }
};
