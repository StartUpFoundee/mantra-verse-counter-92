
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Main.tsx: Starting application...");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Main.tsx: Root element not found!");
} else {
  console.log("Main.tsx: Root element found, rendering App...");
  createRoot(rootElement).render(<App />);
}
