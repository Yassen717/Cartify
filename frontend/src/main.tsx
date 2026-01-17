import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Import Button CSS globally to ensure consistent icon rendering
import './components/ui/Button.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
