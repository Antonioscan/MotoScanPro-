// pages/_app.js
import '../styles/globals.css';
import '../styles/Home.module.css'; // se serve altrove
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
