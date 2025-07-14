import { useState } from 'react';
import Image from 'next/image';
import styles from '../styles/Home.module.css';

/* se hai il logo in /public/logo.png puoi importarlo così
   altrimenti commenta la riga e lascia solo il testo */
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
        images.map(
          (file) =>
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
    <div className={styles.container}>
      <header className={styles.header}>
        {/* Se non vuoi il logo togli il componente Image */}
        <Image src={logo} alt="MotoScanPro" width={48} height={48} priority />
        <h1>MotoScanPro</h1>
      </header>

      <div className={styles.buttonGroup}>
        <button className={styles.cta} onClick={openCamera}>RICAMBI NUOVI</button>
        <button className={styles.cta} onClick={openCamera}>RICAMBI USATI</button>
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
        <section className={styles.preview}>
          <img
            className={styles.mainImage}
            src={URL.createObjectURL(images[selectedIndex])}
            alt="anteprima"
          />

          <div className={styles.thumbGrid}>
            {images.map((img, i) => (
              <img
                key={i}
                src={URL.createObjectURL(img)}
                alt={`mini-${i}`}
                className={`${styles.thumbnail} ${i === selectedIndex ? styles.activeThumb : ''}`}
                onClick={() => setSelectedIndex(i)}
              />
            ))}
          </div>

          {images.length < 6 && (
            <button className={styles.addMore} onClick={openCamera}>
              + Aggiungi foto
            </button>
          )}
        </section>
      )}

      <button
        className={styles.cta}
        onClick={analyzeImages}
        disabled={images.length === 0 || loading}
      >
        {loading ? 'Analisi in corso…' : 'Analizza con AI'}
      </button>

      {result && (
        <section className={styles.resultBox}>
          <h3>Risultato AI:</h3>
          {result.descrizione ? (
            <>
              <p>{result.descrizione}</p>
              <button
                className={styles.copyBtn}
                onClick={() => navigator.clipboard.writeText(result.descrizione)}
              >
                Copia descrizione
              </button>
            </>
          ) : (
            <pre>{JSON.stringify(result, null, 2)}</pre>
          )}
        </section>
      )}

      <button className={styles.ebayBtn}>Crea inserzione eBay</button>
    </div>
  );
}
