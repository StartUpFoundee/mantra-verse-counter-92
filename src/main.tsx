
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Main.tsx: Starting application...");

// Initialize bulletproof device identification system
const initializeDeviceIdentification = async () => {
  try {
    console.log("Main.tsx: Initializing bulletproof device identification...");
    
    // Import and initialize the device identification system
    const { DeviceIdentificationSystem } = await import('./utils/deviceIdentification');
    const deviceSystem = DeviceIdentificationSystem.getInstance();
    
    // Initialize the system
    const deviceId = await deviceSystem.initialize();
    console.log("Main.tsx: Device identification initialized successfully:", deviceId);
    
    // Register service worker for Layer 3 persistence
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/device-sw.js');
        console.log('Main.tsx: Device service worker registered:', registration);
        
        // Send device ID to service worker
        if (registration.active) {
          const channel = new MessageChannel();
          registration.active.postMessage({
            type: 'STORE_DEVICE_ID',
            deviceId: deviceId
          }, [channel.port2]);
        }
      } catch (swError) {
        console.warn('Main.tsx: Service worker registration failed:', swError);
      }
    }
    
    // Validate device integrity
    const isValid = await deviceSystem.validateIntegrity();
    console.log("Main.tsx: Device integrity validation:", isValid);
    
    // Log storage health
    const healthStatus = deviceSystem.getStorageHealth();
    console.log("Main.tsx: Storage health status:", healthStatus);
    
  } catch (error) {
    console.error("Main.tsx: Device identification initialization failed:", error);
    // Continue with app loading even if device identification fails
  }
};

// Initialize device identification before rendering app
initializeDeviceIdentification().then(() => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Main.tsx: Root element not found!");
  } else {
    console.log("Main.tsx: Root element found, rendering App...");
    createRoot(rootElement).render(<App />);
  }
}).catch((error) => {
  console.error("Main.tsx: Critical initialization error:", error);
  // Fallback: render app anyway
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(<App />);
  }
});
