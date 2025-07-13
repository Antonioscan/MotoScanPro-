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
        images.map(
          (file) =>
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
      console.error('Errore AI:', err);
      setResult({ error: "Errore durante l'analisi", details: err.message });
    } finally {
      setLoading(false);
    }
  };

  const openCamera = () => {
    document.getElementById('fileInput').click();
  };

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
          {/* Immagine principale selezionata */}
          <img
            src={URL.createObjectURL(images[selectedIndex])}
            alt="immagine-principale"
            style={styles.mainImage}
          />

          {/* Miniature cliccabili */}
          <div style={styles.miniGrid}>
            {images.map((img, i) => (
              <img
                key={i}
                src={URL.createObjectURL(img)}
                alt={`mini-${i}`}
                style={{
                  ...styles.thumbnail,
                  border: i === selectedIndex ? '3px solid #ff4500' : '2px solid #333',
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
    fontFamily: 'Arial, sans-serif',
    padding: 20,
    maxWidth: 500,
    margin: 'auto',
    background: '#121212',
    borderRadius: 16,
    textAlign: 'center',
    color: '#fff',
    minHeight: '100vh',
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#ff4500',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  orangeButton: {
    backgroundColor: '#ff4500',
    color: '#fff',
    padding: '12px 20px',
    border: 'none',
    borderRadius: 12,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#ffa500',
    color: '#000',
    padding: '8px 16px',
    border: 'none',
    borderRadius: 8,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 10,
  },
  result: {
    background: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    textAlign: 'left',
  },
  ebayButton: {
    backgroundColor: '#0066ff',
    color: '#fff',
    padding: '12px 20px',
    border: 'none',
    borderRadius: 12,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 20,
    fontSize: 16,
  },
  copyButton: {
    backgroundColor: '#333',
    color: '#fff',
    padding: '10px 16px',
    border: 'none',
    borderRadius: 10,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 10,
  },
  preview: {
    marginTop: 20,
  },
  mainImage: {
    width: '100%',
    maxHeight: 320,
    objectFit: 'contain',
    borderRadius: 12,
    border: '2px solid #444',
    marginBottom: 10,
  },
  miniGrid: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  thumbnail: {
    width: 60,
    height: 60,
    objectFit: 'cover',
    borderRadius: 8,
    cursor: 'pointer',
  },
};
