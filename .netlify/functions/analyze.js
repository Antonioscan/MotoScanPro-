const fetch = require("node-fetch");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const body = Buffer.from(event.body, "base64");
  const hfToken = process.env.HUGGINGFACE_TOKEN;

  const response = await fetch("https://api-inference.huggingface.co/models/google/vit-base-patch16-224", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfToken}`,
      "Content-Type": "image/jpeg",
    },
    body: body,
  });

  const result = await response.json();
  const label = result[0]?.label || "Componente sconosciuto";

  return {
    statusCode: 200,
    body: JSON.stringify({ label }),
  };
};
