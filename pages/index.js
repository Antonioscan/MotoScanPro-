import { useState, useRef } from 'react';

export default function Home() {
  const [images, setImages] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    setImages(files);
    setConfirmed(false);
    setResult(null);
  };

  const confirmImages = () => {
    setConfirmed(true);
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

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>MotoScanPro</h1>

      <div style={styles.buttonContainer}>
        <button style={styles.orangeButton} onClick={openCamera}>RICAMBI NUOVI</button>
        <button style={styles.orangeButton} onClick={openCamera}>RICAMBI USATI</button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleUpload}
        style={{ display: 'none' }}
      />

      {images.length > 0 && (
        <>
          <div style={styles.preview}>
            {images.map((img, i) => (
              <img
                key={i}
                src={URL.createObjectURL(img)}
                alt={`preview-${i}`}
                style={styles.thumbnail}
              />
            ))}
          </div>
          <button onClick={confirmImages} style={styles.confirmButton}>
            Conferma foto
          </button>
        </>
      )}

      <button
        onClick={analyzeImages}
        disabled={!confirmed || loading}
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
    backgroundColor: '#ff7f00',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: 10,
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  preview: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    margin: '20px 0'
  },
  thumbnail: {
    width: 80,
    height: 80,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid #ccc'
  },
  confirmButton: {
    backgroundColor: '#ffaa00',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    marginBottom: 20
  },
  uploadButton: {
    backgroundColor: '#0070f3',
    color: '#fff',
    padding: '10px 24px',
    border: 'none',
    borderRadius: 8,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: 20
  },
  result: {
    textAlign: 'left',
    marginTop: 20,
    background: '#f1f1f1',
    padding: 10,
    borderRadius: 8
  },
  publishButton: {
    backgroundColor: '#28a745',
    color: '#fff',
    padding: '10px 24px',
    border: 'none',
    borderRadius: 8,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 20
  }
};
