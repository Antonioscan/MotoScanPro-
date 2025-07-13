import fetch from 'node-fetch';

export default async (req, res) => {
  try {
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => (data += chunk));
      req.on('end', () => resolve(JSON.parse(data)));
      req.on('error', err => reject(err));
    });

    const imageBase64 = body.imageBase64;

    const response = await fetch('https://api-inference.huggingface.co/models/google/vit-base-patch16-224', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          image: imageBase64,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }

    const result = await response.json();

    res.status(200).json({
      description: `Oggetto rilevato: ${result?.[0]?.label || 'Nessun oggetto identificato'}`,
    });

  } catch (error) {
    res.status(500).json({
      errorType: error.name,
      errorMessage: error.message,
      trace: error.stack?.split('\n') || [],
    });
  }
};
