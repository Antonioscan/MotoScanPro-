import fetch from 'node-fetch';

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    const { image } = body;

    const response = await fetch('https://api-inference.huggingface.co/models/google/vit-base-patch16-224', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: image,
      }),
    });

    if (!response.ok) {
      throw new Error(`Errore Hugging Face: ${response.statusText}`);
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
        errorType: error.name,
        errorMessage: error.message,
        trace: error.stack.split('\n'),
      }),
    };
  }
}
