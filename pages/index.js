import { useState } from 'react';

export default function Home() {
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    const previews = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );
    setImages(files);
    setPreview(previews[0]);
    setResult(null);
  };

  const analyzeImages = async () => {
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

    const res = await fetch('/.netlify/functions/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: base64Images })
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <img
          src="https://img.icons8.com/ios-filled/50/motorcycle.png"
          alt="Logo"
          style={styles.logo}
        />
        <h1 style={styles.title}>MotoScanPro</h1>
      </div>

      <div style={styles.buttonContainer}>
        <button
          style={styles.orangeButton}
          onClick={() => {
            setSelectedType('RICAMBI NUOVI');
            document.getElementById('fileInput').click();
          }}
        >
          RICAMBI NUOVI
        </button>
        <button
          style={styles.orangeButton}
          onClick={() => {
            setSelectedType('RICAMBI USATI');
            document.getElementById('fileInput').click();
          }}
        >
          RICAMBI USATI
        </button>
      </div>

      <input
        type="file"
        id="fileInput"
        accept="image/*"
        multiple
        onChange={handleUpload}
        style={{ display: 'none' }}
      />

      {preview && (
        <img src={preview} alt="Anteprima" style={styles.previewImage} />
      )}

      {images.length > 0 && (
        <div style={styles.thumbnails}>
          {images.map((img, index) => (
            <div key={index} style={styles.thumbBox}>
              <img
                src={URL.createObjectURL(img)}
                alt="miniatura"
                style={styles.thumbnail}
                onClick={() =>
                  setPreview(URL.createObjectURL(images[index]))
                }
              />
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <button
          onClick={analyzeImages}
          disabled={loading}
          style={styles.uploadButton}
        >
          {loading ? 'Analisi in corso...' : '✅ Conferma foto e Analizza con AI'}
        </button>
      )}

      {result && (
        <div style={styles.result}>
          <strong>Tipo:</strong> {selectedType}<br />
          <strong>Foto caricate:</strong> {images.length}<br /><br />
          <strong>Analisi AI:</strong><br />
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
    maxWidth: 420,
    margin: 'auto',
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  logo: {
    width: 40,
    verticalAlign: 'middle'
  },
  title: {
    fontSize: 26,
    margin: 0
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20
  },
  orangeButton: {
    flex: 1,
    backgroundColor: '#ff6600',
    color: '#fff',
    padding: '12px 20px',
    border: 'none',
    borderRadius: 14,
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  previewImage: {
    width: '100%',
    marginTop: 20,
    borderRadius: 12
  },
  thumbnails: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10
  },
  thumbBox: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden'
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    cursor: 'pointer'
  },
  uploadButton: {
    backgroundColor: '#0070f3',
    color: '#fff',
    padding: '10px 24px',
    border: 'none',
    borderRadius: 10,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 20
  },
  publishButton: {
    backgroundColor: '#28a745',
    color: '#fff',
    padding: '10px 24px',
    border: 'none',
    borderRadius: 10,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 20
  },
  result: {
    textAlign: 'left',
    backgroundColor: '#eef5ff',
    border: '1px solid #aac',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    fontSize: 14
  }
};
