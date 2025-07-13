import { useState, useRef } from 'react';

export default function Home() {
  const [images, setImages] = useState([]);
  const [mainPreview, setMainPreview] = useState(null);
  const [aiDescription, setAiDescription] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const fileInputRef = useRef();

  const handleUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 6 - images.length);
    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((newImages) => {
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      if (!mainPreview) setMainPreview(newImages[0]);
    });
  };

  const handleCapture = (type) => {
    setSelectedType(type);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const removeImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
    if (updated.length === 0) {
      setMainPreview(null);
      setAiDescription('');
      setSelectedType('');
    } else if (mainPreview === images[index]) {
      setMainPreview(updated[0]);
    }
  };

  const confirmPhotos = () => {
    const desc = `
      📦 <strong>Tipo:</strong> ${selectedType}<br>
      🖼️ <strong>Foto caricate:</strong> ${images.length}<br><br>
      🤖 <strong>Analisi AI:</strong><br>
      Parte identificata come possibile componente frizione o trasmissione.<br>
      Presenza di graffi, ossidazione superficiale e residui di utilizzo.<br>
      Suggerita verifica compatibilità con modello Ducati Monster.
    `;
    setAiDescription(desc);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>MotoScanPro</h1>

      <button style={styles.orangeButton} onClick={() => handleCapture('RICAMBI NUOVI')}>RICAMBI NUOVI</button>
      <button style={styles.orangeButton} onClick={() => handleCapture('RICAMBI USATI')}>RICAMBI USATI</button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        multiple
        onChange={handleUpload}
      />

      {mainPreview && (
        <img src={mainPreview} alt="Anteprima" style={styles.mainPreview} />
      )}

      <div style={styles.miniatures}>
        {images.map((src, index) => (
          <div key={index} style={styles.miniatureWrapper}>
            <img
              src={src}
              style={styles.miniature}
              onClick={() => setMainPreview(src)}
            />
            <button onClick={() => removeImage(index)} style={styles.deleteBtn}>✕</button>
          </div>
        ))}
      </div>

      {images.length > 0 && images.length < 6 && (
        <button style={styles.addMoreBtn} onClick={() => fileInputRef.current.click()}>
          ➕ Aggiungi altre foto
        </button>
      )}

      {images.length > 0 && (
        <button style={styles.confirmBtn} onClick={confirmPhotos}>✅ Conferma foto</button>
      )}

      {aiDescription && (
        <div style={styles.aiBox} dangerouslySetInnerHTML={{ __html: aiDescription }} />
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
  title: { fontSize: 26, marginBottom: 20 },
  orangeButton: {
    backgroundColor: '#ff6600',
    color: '#fff',
    padding: '14px',
    marginBottom: 10,
    border: 'none',
    width: '100%',
    borderRadius: 14,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: 18
  },
  mainPreview: {
    width: '100%',
    borderRadius: 10,
    marginTop: 20
  },
  miniatures: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 15
  },
  miniatureWrapper: { position: 'relative' },
  miniature: {
    width: 80,
    height: 80,
    objectFit: 'cover',
    borderRadius: 8,
    cursor: 'pointer'
  },
  deleteBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'red',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: 24,
    height: 24,
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  addMoreBtn: {
    backgroundColor: '#555',
    color: '#fff',
    padding: '10px',
    border: 'none',
    marginTop: 10,
    borderRadius: 10,
    cursor: 'pointer'
  },
  confirmBtn: {
    backgroundColor: '#28a745',
    color: '#fff',
    padding: '12px',
    border: 'none',
    marginTop: 15,
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  aiBox: {
    background: '#eef5ff',
    border: '1px solid #aac',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    textAlign: 'left',
    fontSize: 14
  }
};
