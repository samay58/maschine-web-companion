import '../styles/globals.css';
import { useEffect } from 'react';
import useStore from '../utils/store';

function MyApp({ Component, pageProps }) {
  // Initialize store on app load
  useEffect(() => {
    useStore.getState().init();
  }, []);
  
  return <Component {...pageProps} />;
}

export default MyApp;