import { useState } from 'react';
import styles from '../styles/style.module.css';

export default function Home() {
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result;
      setImages((prev) => [...prev, src]);
      if (!mainImage) setMainImage(src);
    };
    reader.readAsDataURL(file);
  };

  const confirmPhotos = async () => {
    setLoading(true);
    setDescription("⏳ Analisi in corso con AI...");
    const blob = await fetch(mainImage).then(r => r.blob());
    const formData = new FormData();
    formData.append("image", blob);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setDescription(`🔍 Componente rilevato: ${data.label || "Sconosciuto"}`);
    } catch {
      setDescription("❌ Errore durante l'analisi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>MotoScanPro</h1>
      <input type="file" accept="image/*" onChange={handlePhoto} />
      {mainImage && <img src={mainImage} className={styles.mainImage} />}
      {images.length > 0 && (
        <>
          <button onClick={confirmPhotos}>✅ Conferma foto</button>
          <div className={styles.miniatures}>
            {images.map((src, i) => (
              <img key={i} src={src} className={styles.thumbnail} onClick={() => setMainImage(src)} />
            ))}
          </div>
        </>
      )}
      <p>{loading ? "Attendere..." : description}</p>
    </div>
  );
}
