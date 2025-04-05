
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Meta tag para optimizar la visualización en dispositivos móviles
const meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
document.getElementsByTagName('head')[0].appendChild(meta);

// Prevenir el doble tap para zoom en iOS
document.addEventListener('touchend', (e) => {
  if (e.target instanceof HTMLElement) {
    const now = Date.now();
    const lastTouch = e.target.dataset.lastTouch ? parseInt(e.target.dataset.lastTouch) : 0;
    
    if (now - lastTouch < 300) {
      e.preventDefault();
    }
    
    e.target.dataset.lastTouch = now.toString();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
