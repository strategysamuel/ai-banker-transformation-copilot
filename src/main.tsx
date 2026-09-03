import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Intercept and prevent external browser extension noise (such as MetaMask, Web3 wallet injection scripts)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = typeof reason === 'string' ? reason : reason?.message || '';
    if (
      message.includes('MetaMask') ||
      message.includes('ethereum') ||
      message.includes('wallet') ||
      message.includes('chrome-extension://')
    ) {
      console.warn('Filtered third-party browser extension rejection:', message);
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    const message = event.message || '';
    if (
      message.includes('MetaMask') ||
      message.includes('ethereum') ||
      message.includes('wallet') ||
      message.includes('chrome-extension://')
    ) {
      console.warn('Filtered third-party browser extension error:', message);
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
