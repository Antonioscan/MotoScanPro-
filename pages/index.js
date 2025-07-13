import { useState, useRef } from 'react';

export default function Home() {
  const [images, setImages] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const inputRef = useRef(null);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    setImages(prev => [...prev, ...files]);
    setResult(null);
  };

  const analyzeImages = async () => {
    setLoading(true);
    setResult(null);

    const base64Images = await Promise.all(
      images.map(file =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      )
    );

    const res = await fetch('/.netlify/functions/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: base64Images })
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const triggerCamera = (type) => {
    setSelectedType(type);
    inputRef.current.click();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>MotoScanPro</h1>

      <div style={styles.buttonContainer}>
        <button style={styles.orangeButton} onClick={() => triggerCamera('RICAMBI NUOVI')}>RICAMBI NUOVI</button>
        <button style={styles.orangeButton} onClick={() => triggerCamera('RICAMBI USATI')}>RICAMBI USATI</button>
      </div>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        ref={inputRef}
        onChange={handleUpload}
        style={{ display: 'none' }}
      />

      {images.length > 0 && (
        <button
          onClick={analyzeImages}
          disabled={loading}
          style={styles.uploadButton}
        >
          {loading ? 'Analisi in corso...' : 'Analizza con AI'}
        </button>
      )}

      {result && (
        <div style={styles.result}>
          <h3>Risultato AI:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {images.length > 0 && (
        <button style={styles.publishButton}>Crea inserzione eBay</button>
      )}
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
    textAlign: 'center'
  },
  title: {
    fontSize: 26,
    marginBottom: 20
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  orangeButton: {
    backgroundColor: '#ff6600',
    color: '#fff',
    padding: '12px 24px',
    border: 'none',
    borderRadius: 12,
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  uploadButton: {
    backgroundColor: '#0070f3',
    color: '#fff',
    padding: '12px 24px',
    border: 'none',
    borderRadius: 10,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 20
  },
  result: {
    textAlign: 'left',
    marginTop: 20,
    background: '#eef5ff',
    padding: 10,
    borderRadius: 8
  },
  publishButton: {
    backgroundColor: '#28a745',
    color: '#fff',
    padding: '12px 24px',
    border: 'none',
    borderRadius: 10,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 20
  }
};
