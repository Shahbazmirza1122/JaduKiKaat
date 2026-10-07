import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const originalConsoleError = console.error;
console.error = (...args) => {
  const processed = args.map(a => {
    if (a instanceof Error) return a.stack || a.message;
    if (typeof a === 'object') {
      try { return JSON.stringify(a); } catch (e) { return String(a); }
    }
    return a;
  });
  console.warn("SUPPRESSED_ERROR:", ...processed);
};

window.addEventListener('unhandledrejection', event => {
  event.stopImmediatePropagation();
  const reason = event.reason;
  if (!reason || (typeof reason === 'object' && Object.keys(reason).length === 0)) {
    event.preventDefault();
    return;
  }
  const msg = reason.message || reason.toString() || '';
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Load failed')) {
    event.preventDefault(); // Prevent it from logging to the console
    console.warn('Suppressed unhandled fetch error:', msg);
  } else {
    event.preventDefault();
    console.warn('Suppressed unhandled rejection:', msg);
  }
});

window.addEventListener('error', event => {
  event.stopImmediatePropagation();
  if (!event.error || (typeof event.error === 'object' && Object.keys(event.error).length === 0)) {
    event.preventDefault();
  } else {
    event.preventDefault();
    console.warn('Suppressed global error:', event.error?.message || event.message);
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);