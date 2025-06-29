import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'

export default function Navbar() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/') // redirect to home after logout
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/Submit" className="nav-link">Submit Project</Link>
      </div>
      <button className="logout-button" onClick={handleLogout}>Log Out</button>
    </nav>
  )
}
