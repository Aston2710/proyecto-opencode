import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Sin `!`: si el contenedor faltara, se falla con un mensaje legible en vez de
// un error opaco de React en producción.
const contenedor = document.getElementById('root')
if (contenedor === null) {
  throw new Error('No se encontró el elemento #root en index.html.')
}

createRoot(contenedor).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
