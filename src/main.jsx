import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import LandingPage from './pages/LandingPage'
import ProjectDetails from './pages/ProjectDetails'
import SubmitProject from './components/SubmitProject'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<App />} />
          <Route path="/profile" element={<Dashboard />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/submit" element={<SubmitProject />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
