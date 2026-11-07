import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import YatnizeSystem from './components/YatnizeNavbar.jsx'
import KnowledgeHero from './components/KnowledgeHero.jsx'
import Certificate from './components/hero/certifcate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
<App/>
  </StrictMode>,
)
