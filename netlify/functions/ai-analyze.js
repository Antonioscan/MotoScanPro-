const fetch = require('node-fetch');

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const imageBase64 = body.image;

  const response = await fetch("https://api-inference.huggingface.co/models/google/vit-base-patch16-224", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: {
        image: imageBase64
      }
    })
  });

  const result = await response.json();
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
};
