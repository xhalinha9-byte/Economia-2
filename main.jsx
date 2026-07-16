import React from 'react'
import ReactDOM from 'react-dom/client'
import EconomiaApp from './EconomiaApp.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <EconomiaApp />
  </React.StrictMode>,
);
  if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
