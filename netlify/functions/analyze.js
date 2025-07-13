const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const { images } = JSON.parse(event.body);

    const responses = await Promise.all(
      images.map((base64Image) =>
        fetch("https://api-inference.huggingface.co/models/google/vit-base-patch16-224", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: {
              image: base64Image,
            },
          }),
        }).then((res) => res.json())
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ results: responses }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        errorType: err.name || "Error",
        errorMessage: err.message || "An unknown error has occurred",
        trace: err.stack ? err.stack.split("\n") : [],
      }),
    };
  }
};
