
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Main.tsx: Starting application...");

// Initialize device identification on app start
const initializeDeviceIdentity = () => {
  if (!localStorage.getItem('device_id')) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    const canvasFingerprint = canvas.toDataURL().slice(-10);
    
    const screenInfo = `${screen.width}x${screen.height}x${screen.colorDepth}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language || 'en';
    const platform = navigator.platform || 'unknown';
    
    const deviceString = `${screenInfo}_${timezone}_${language}_${platform}_${canvasFingerprint}`;
    
    let hash = 0;
    for (let i = 0; i < deviceString.length; i++) {
      const char = deviceString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const deviceId = `device_${Math.abs(hash).toString(36).slice(0, 8)}_${Date.now().toString(36)}`;
    localStorage.setItem('device_id', deviceId);
    console.log("Main.tsx: Device identity initialized:", deviceId);
  } else {
    console.log("Main.tsx: Device identity found:", localStorage.getItem('device_id'));
  }
};

initializeDeviceIdentity();

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Main.tsx: Root element not found!");
} else {
  console.log("Main.tsx: Root element found, rendering App...");
  createRoot(rootElement).render(<App />);
}
