import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes,Route } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import ProjectDetails from './pages/ProjectDetails'
import SubmitProject from './components/SubmitProject'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<App />} />
        <Route path="/project/:id" element={<ProjectDetails />} />
        <Route path="/Submit" element={<SubmitProject/>}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
