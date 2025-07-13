import { useState } from 'react';

export default function Home() {
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [aiDescription, setAiDescription] = useState('');

  const handleUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 6);
    const fileReaders = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) => [...prev, { file, src: ev.target.result }]);
        if (preview === '') setPreview(ev.target.result);
      };
      reader.readAsDataURL(file);
      fileReaders.push(reader);
    });
  };

  const removeImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
    if (updated.length === 0) {
      setPreview('');
      setResult(null);
      setAiDescription('');
      setSelectedType('');
    } else if (preview === images[index].src) {
      setPreview(updated[0].src);
    }
  };

  const analyzeImages = async () => {
    setLoading(true);
    const base64Images = await Promise.all(
      images.map(({ file }) =>
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
      body: JSON.stringify({ images: base64Images }),
    });

    const data = await res.json();
    setResult(data);

    const descrizione = `
      🔧 <strong>Tipo:</strong> ${selectedType}<br>
      🖼️ <strong>Foto caricate:</strong> ${images.length}<br><br>
      🤖 <strong>AI:</strong> ${data.description || 'Componente non identificato.'}
    `;
    setAiDescription(descrizione);
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img src="https://img.icons8.com/ios-filled/50/motorcycle.png" alt="Logo" style={styles.logo} />
        <h1 style={styles.title}>MotoScanPro</h1>
      </div>

      {!selectedType && (
        <div style={styles.buttonGroup}>
          <button style={styles.orangeButton} onClick={() => setSelectedType('RICAMBI NUOVI')}>
            RICAMBI NUOVI
          </button>
          <button style={styles.orangeButton} onClick={() => setSelectedType('RICAMBI USATI')}>
            RICAMBI USATI
          </button>
        </div>
      )}

      {selectedType && (
        <>
          <input type="file" accept="image/*" multiple onChange={handleUpload} style={{ margin: '15px 0' }} />

          {preview && <img src={preview} alt="Preview" style={styles.mainPreview} />}

          <div style={styles.miniatures}>
            {images.map((img, idx) => (
              <div key={idx} style={styles.miniWrapper}>
                <img
                  src={img.src}
                  alt={`mini-${idx}`}
                  style={styles.miniature}
                  onClick={() => setPreview(img.src)}
                />
                <button onClick={() => removeImage(idx)} style={styles.deleteBtn}>🗑️</button>
              </div>
            ))}
          </div>

          {images.length > 0 && (
            <>
              <button onClick={analyzeImages} disabled={loading} style={styles.greenBtn}>
                {loading ? 'Analisi in corso...' : '✅ Conferma foto e analizza'}
              </button>
            </>
          )}
        </>
      )}

      {aiDescription && (
        <div style={styles.aiBox} dangerouslySetInnerHTML={{ __html: aiDescription }}></div>
      )}

      {result && (
        <button style={styles.publishBtn}>📤 Crea inserzione eBay</button>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 480,
    margin: 'auto',
    padding: 20,
    fontFamily: 'Arial, sans-serif',
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20
  },
  logo: {
    width: 42
  },
  title: {
    margin: 0,
    fontSize: 26
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  orangeButton: {
    backgroundColor: '#ff6600',
    color: '#fff',
    padding: '12px 16px',
    border: 'none',
    borderRadius: 12,
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  mainPreview: {
    width: '100%',
    borderRadius: 12,
    margin: '20px 0'
  },
  miniatures: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20
  },
  miniWrapper: {
    position: 'relative'
  },
  miniature: {
    width: 80,
    height: 80,
    objectFit: 'cover',
    borderRadius: 10,
    cursor: 'pointer'
  },
  deleteBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#c00',
    border: 'none',
    borderRadius: '50%',
    color: '#fff',
    width: 22,
    height: 22,
    cursor: 'pointer'
  },
  greenBtn: {
    backgroundColor: '#28a745',
    color: '#fff',
    padding: '10px 18px',
    border: 'none',
    borderRadius: 10,
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  aiBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#eef5ff',
    border: '1px solid #aac',
    borderRadius: 12,
    fontSize: 14,
    textAlign: 'left'
  },
  publishBtn: {
    backgroundColor: '#0070f3',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: 10,
    marginTop: 20,
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};
