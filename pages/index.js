import { useState, useRef } from 'react';

export default function Home() {
  const [images, setImages] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef();

  const openCamera = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleUpload = async (e) => {
    const newFiles = Array.from(e.target.files).slice(0, 6 - images.length);
    const updatedImages = [...images, ...newFiles].slice(0, 6);
    setImages(updatedImages);
    setConfirmed(false);
    setResult(null);
  };

  const confirmPhotos = () => {
    setConfirmed(true);
    analyzeImages();
  };

  const analyzeImages = async () => {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`image_${index}`, image);
    });

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Errore durante l\'analisi:', err);
    }
  };

  return (
    <div style={styles.container}>
      <h1>MotoScanPro</h1>
      <img src="/logo.png" alt="Logo" style={{ width: 64, marginBottom: 20 }} />

      {!confirmed && (
        <>
          <button onClick={openCamera} style={styles.button}>
            RICAMBI NUOVI
          </button>
          <button onClick={openCamera} style={styles.button}>
            RICAMBI USATI
          </button>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={inputRef}
            onChange={handleUpload}
            style={{ display: 'none' }}
            multiple
          />
        </>
      )}

      {images.length > 0 && (
        <>
          <div style={styles.preview}>
            {images.map((img, idx) => (
              <img
                key={idx}
                src={URL.createObjectURL(img)}
                alt={`preview-${idx}`}
                style={styles.image}
              />
            ))}
          </div>

          {images.length < 6 && (
            <button onClick={openCamera} style={styles.addButton}>
              Aggiungi un'altra foto
            </button>
          )}

          {!confirmed && (
            <button onClick={confirmPhotos} style={styles.confirmButton}>
              Conferma foto
            </button>
          )}
        </>
      )}

      {confirmed && result && (
        <div style={styles.resultBox}>
          <h3>Descrizione AI:</h3>
          <pre style={styles.result}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: 20,
    textAlign: 'center',
    background: '#f4f4f4',
    minHeight: '100vh',
  },
  button: {
    backgroundColor: '#007BFF',
    color: '#fff',
    padding: '12px 24px',
    margin: '10px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#ffcc00',
    color: '#000',
    padding: '8px 18px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    marginTop: 10,
  },
  confirmButton: {
    backgroundColor: '#28a745',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    marginTop: 20,
  },
  preview: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  image: {
    width: 100,
    height: 100,
    objectFit: 'cover',
    borderRadius: 8,
  },
  resultBox: {
    marginTop: 30,
    background: '#fff',
    padding: 20,
    borderRadius: 10,
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  result: {
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
};
