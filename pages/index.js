import { useState } from 'react';
import Image from 'next/image';
import logo from '../public/logo.png';

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
        images.map((file) =>
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
      } else {
        setResult({ descrizione: data.descrizione });
      }
    } catch (err) {
      setResult({ error: "Errore durante l'analisi", details: err.message });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCamera = () => document.getElementById('fileInput').click();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Image src={logo} alt="MotoScanPro Logo" width={60} height={60} priority />
        <h1 style={styles.title}>MotoScanPro</h1>
        <p style={styles.subtitle}>Analisi intelligente dei ricambi moto</p>
      </header>

      <div style={styles.buttonGroup}>
        <button style={styles.orangeButton} onClick={openCamera}>📸 RICAMBI NUOVI</button>
        <button style={styles.orangeButton} onClick={openCamera}>📷 RICAMBI USATI</button>
      </div>

      <input
        id="fileInput"
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleUpload}
        hidden
      />

      {images.length > 0 && (
        <div style={styles.preview}>
          <img
            src={URL.createObjectURL(images[selectedIndex])}
            alt="anteprima"
            style={styles.mainImage}
          />

          <div style={styles.thumbGrid}>
            {images.map((img, i) => (
              <img
                key={i}
                src={URL.createObjectURL(img)}
                alt={`mini-${i}`}
                style={{
                  ...styles.thumbnail,
                  border: i === selectedIndex ? '3px solid #ff5c00' : '2px solid #555',
                }}
                onClick={() => setSelectedIndex(i)}
              />
            ))}
          </div>

          {images.length < 6 && (
            <button style={styles.addButton} onClick={openCamera}>
              + Aggiungi foto
            </button>
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
        <div style={styles.resultBox}>
          <h3>Risultato AI:</h3>
          {result.descrizione ? (
            <>
              <p>{result.descrizione}</p>
              <button
                style={styles.copyButton}
                onClick={() => navigator.clipboard.writeText(result.descrizione)}
              >
                Copia descrizione
              </button>
            </>
          ) : (
            <pre>{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      )}

      <button style={styles.ebayButton}>📦 Crea inserzione eBay</button>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    background: '#f9f9f9',
    padding: 24,
    maxWidth: 500,
    margin: 'auto',
    borderRadius: 16,
    textAlign: 'center',
    minHeight: '100vh',
    color: '#222',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    margin: '12px 0 6px',
    color: '#ff5c00',
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  orangeButton: {
    backgroundColor: '#ff5c00',
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
    marginTop: 12,
  },
  preview: {
    marginBottom: 24,
  },
  mainImage: {
    width: '100%',
    maxHeight: 300,
    objectFit: 'contain',
    borderRadius: 12,
    border: '2px solid #ccc',
    marginBottom: 10,
  },
  thumbGrid: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  thumbnail: {
    width: 60,
    height: 60,
    objectFit: 'cover',
    borderRadius: 8,
    cursor: 'pointer',
  },
  resultBox: {
    background: '#fff',
    padding: 16,
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'left',
    marginTop: 20,
  },
  copyButton: {
    backgroundColor: '#333',
    color: '#fff',
    padding: '10px 16px',
    border: 'none',
    borderRadius: 8,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 10,
  },
  ebayButton: {
    backgroundColor: '#0073e6',
    color: '#fff',
    padding: '12px 20px',
    border: 'none',
    borderRadius: 12,
    fontWeight: 'bold',
    fontSize: 16,
    cursor: 'pointer',
    marginTop: 24,
  },
};
