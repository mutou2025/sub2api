import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log("main.tsx: Starting render")
const container = document.getElementById('root')
if (!container) {
  console.error("main.tsx: Root container not found!")
} else {
  console.log("main.tsx: Root container found")
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
