import { useState } from 'react';

export default function Home() {
  const [images, setImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e) => {
    const selected = Array.from(e.target.files).slice(0, 6 - images.length);
    setImages((prev) => [...prev, ...selected]);
    setSelectedIndex(0);
    setResult(null);
  };

  const analyzeImages = async () => {
    if (images.length === 0) return;
    setLoading(true);
    setResult(null);
    try {
      const base64Images = await Promise.all(
        images.map(file =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
        )
      );

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: base64Images }),
      });

      const data = await res.json();
      if (data.error) {
        setResult({ error: data.error, details: data.details });
        return;
      }

      setResult({ descrizione: data.descrizione });
    } catch (err) {
      setResult({ error: "Errore durante l'analisi", details: err.message });
    } finally {
      setLoading(false);
    }
  };

  const openCamera = () => document.getElementById('fileInput').click();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>MotoScanPro</h1>

      <div style={styles.buttonContainer}>
        <button style={styles.orangeButton} onClick={openCamera}>RICAMBI NUOVI</button>
        <button style={styles.orangeButton} onClick={openCamera}>RICAMBI USATI</button>
      </div>

      <input
        id="fileInput"
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleUpload}
        style={{ display: 'none' }}
      />

      {images.length > 0 && (
        <div style={styles.preview}>
          <img
            src={URL.createObjectURL(images[selectedIndex])}
            alt="immagine-principale"
            style={styles.mainImage}
          />
          <div style={styles.miniGrid}>
            {images.map((img, i) => (
              <img
                key={i}
                src={URL.createObjectURL(img)}
                alt={`mini-${i}`}
                style={{
                  ...styles.thumbnail,
                  border: i === selectedIndex ? '3px solid #ff4500' : '2px solid #222',
                }}
                onClick={() => setSelectedIndex(i)}
              />
            ))}
          </div>

          {images.length < 6 && (
            <button style={styles.addButton} onClick={openCamera}>Aggiungi altre foto</button>
          )}
        </div>
      )}

      <button
        onClick={analyzeImages}
        disabled={images.length === 0 || loading}
        style={styles.orangeButton}
      >
        {loading ? 'Analisi in corso...' : 'Analizza con AI'}
      </button>

      {result && (
        <div style={styles.result}>
          <h3>Risultato AI:</h3>
          {result.descrizione ? (
            <>
              <p>{result.descrizione}</p>
              <button
                style={styles.copyButton}
                onClick={() => navigator.clipboard.writeText(result.descrizione)}
              >
                Copia descrizione per eBay
              </button>
            </>
          ) : (
            <pre>{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      )}

      <button style={styles.ebayButton}>Crea inserzione eBay</button>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Poppins, sans-serif',
    padding: 24,
    maxWidth: 500,
    margin: 'auto',
    background: '#1a1a1a',
    borderRadius: 20,
    textAlign: 'center',
    color: '#eaeaea',
    minHeight: '100vh',
    boxShadow: '0 0 15px rgba(0,0,0,0.4)',
  },
  title: {
    fontSize: 32,
    marginBottom: 24,
    fontWeight: 700,
    color: '#ff4500',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    marginBottom: 24,
  },
  orangeButton: {
    backgroundColor: '#ff4500',
    color: '#fff',
    padding: '14px 24px',
    border: 'none',
    borderRadius: 14,
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: 17,
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(255, 69, 0, 0.4)',
  },
  addButton: {
    backgroundColor: '#ffb347',
    color: '#111',
    padding: '10px 18px',
    border: 'none',
    borderRadius: 10,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 12,
  },
  result: {
    background: '#2a2a2a',
    padding: 18,
    borderRadius: 14,
    marginTop: 28,
    textAlign: 'left',
    color: '#f0f0f0',
  },
  ebayButton: {
    backgroundColor: '#0070f3',
    color: '#fff',
    padding: '14px 24px',
    border: 'none',
    borderRadius: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 28,
    fontSize: 17,
    boxShadow: '0 4px 12px rgba(0, 112, 243, 0.4)',
  },
  copyButton: {
    backgroundColor: '#333',
    color: '#fff',
    padding: '10px 18px',
    border: 'none',
    borderRadius: 12,
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: 12,
  },
  preview: {
    marginTop: 20,
  },
  mainImage: {
    width: '100%',
    maxHeight: 300,
    objectFit: 'contain',
    borderRadius: 14,
    border: '2px solid #555',
    marginBottom: 12,
  },
  miniGrid: {
    display: 'flex',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  thumbnail: {
    width: 60,
    height: 60,
    objectFit: 'cover',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'border 0.2s ease-in-out',
  },
};
