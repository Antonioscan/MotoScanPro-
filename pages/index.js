import { useState } from 'react';

export default function Home() {
  const [images, setImages] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e) => {
    const selected = Array.from(e.target.files).slice(0, 6 - images.length);
    setImages((prev) => [...prev, ...selected]);
    setResult(null);
  };

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
      setResult(data);
    } catch (err) {
      console.error('Errore analisi:', err);
      setResult({ error: 'Errore durante l\'analisi' });
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
        <button style={styles.orangeButton} onClick={openCamera}>
          RICAMBI NUOVI
        </button>
        <button style={styles.orangeButton} onClick={openCamera}>
          RICAMBI USATI
        </button>
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
          <h3>Anteprima foto:</h3>
          <div style={styles.imageGrid}>
            {images.map((img, i) => (
              <img
                key={i}
                src={URL.createObjectURL(img)}
                alt={`preview-${i}`}
                style={styles.image}
              />
            ))}
          </div>
          {images.length < 6 && (
            <button style={styles.addButton} onClick={openCamera}>
              Aggiungi altre foto
            </button>
          )}
        </div>
      )}

      <button
        onClick={analyzeImages}
        disabled={images.length === 0 || loading}
        style={styles.uploadButton}
      >
        {loading ? 'Analisi in corso...' : 'Analizza con AI'}
      </button>

      {result && (
        <div style={styles.result}>
          <h3>Risultato AI:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <button style={styles.publishButton}>Crea inserzione eBay</button>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: 20,
    maxWidth: 480,
    margin: 'auto',
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  title: {
    fontSize: 26,
    marginBottom: 20,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  orangeButton: {
    backgroundColor: '#ff7f00',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: 10,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  uploadButton: {
    backgroundColor: '#0070f3',
    color: '#fff',
    padding: '10px 24px',
    border: 'none',
    borderRadius: 8,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#ffc107',
    color: '#000',
    padding: '8px 16px',
    border: 'none',
    borderRadius: 8,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 10,
  },
  result: {
    textAlign: 'left',
    marginTop: 20,
    background: '#f1f1f1',
    padding: 10,
    borderRadius: 8,
  },
  publishButton: {
    backgroundColor: '#28a745',
    color: '#fff',
    padding: '10px 24px',
    border: 'none',
    borderRadius: 8,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 20,
  },
  preview: {
    marginTop: 20,
  },
  imageGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  image: {
    width: 80,
    height: 80,
    objectFit: 'cover',
    borderRadius: 8,
  },
};
