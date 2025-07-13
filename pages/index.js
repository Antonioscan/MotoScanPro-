import { useState } from 'react';
import styles from '../styles/style.module.css';

export default function Home() {
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [description, setDescription] = useState('');

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
    setDescription("⏳ Analisi in corso...");
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
    }
  };

  return (
    <div className={styles.container}>
      <h1><img src="/motorcycle.png" className={styles.logo} /> MotoScanPro</h1>
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
      <p>{description}</p>
    </div>
  );
}
