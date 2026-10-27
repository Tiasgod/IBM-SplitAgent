import { registerSW } from "virtual:pwa-register";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'   
import './styles/global.css' 
import './index.css'
import App from './App.tsx'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New version available. Reload?")) updateSW(true);
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
