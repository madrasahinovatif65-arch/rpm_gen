import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// HTTPS enforcement for production (SSO security requirement)
if (import.meta.env.PROD && typeof window !== 'undefined' && window.location.protocol !== 'https:') {
  console.warn('⚠️ SSO requires HTTPS. Redirecting to secure connection...');
  window.location.href = window.location.href.replace('http:', 'https:');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
