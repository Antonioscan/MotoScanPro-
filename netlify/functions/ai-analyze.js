const analyzeImages = async () => {
  if (images.length === 0) return;

  setLoading(true);
  setResult(null);

  const base64Images = await Promise.all(
    images.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    )
  );

  try {
    const res = await fetch('/.netlify/functions/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: base64Images }),
    });

    const data = await res.json();

    if (data.error) {
      setResult({ error: data.error });
      return;
    }

    const englishText = data[0]?.generated_text || 'Descrizione non trovata';

    // Traduzione con LibreTranslate
    const translateRes = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: englishText,
        source: 'en',
        target: 'it',
        format: 'text',
      }),
    });

    const translated = await translateRes.json();
    const italianText = translated.translatedText;

    setResult({ descrizione: italianText });

  } catch (err) {
    console.error('Errore AI:', err);
    setResult({ error: "Errore durante l'analisi" });
  } finally {
    setLoading(false);
  }
};
