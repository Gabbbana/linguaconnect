import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import PrototypeApp from './prototype/PrototypeApp';
const demo = import.meta.env.VITE_DEMO_MODE === 'true' || new URLSearchParams(window.location.search).get('demo') === '1';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {demo ? <PrototypeApp /> : <App />}
  </React.StrictMode>,
);

