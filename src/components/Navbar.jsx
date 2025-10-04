import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../utils/supabaseClient'
import { setUser } from '../store/slices/authSlice'

export default function Navbar() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth.user)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    console.log('Logging out user:', user?.email)
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error)
    } else {
      console.log('Logout successful')
    }
    dispatch(setUser(null))
    setDropdownOpen(false)
    navigate('/') // redirect to home after logout
  }

  const handleProtectedNavigation = (path) => {
    if (!user) {
      navigate('/login')
    } else {
      navigate(path)
    }
  }

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    return user?.email || 'User'
  }

  const getUserInitials = () => {
    const displayName = getUserDisplayName()
    return displayName.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2)
  }

  const getUserAvatarUrl = () => {
    return user?.user_metadata?.avatar_url
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="nav-left">
          <Link to="/" className="nav-brand">
            <div className="brand-logo">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <span className="brand-text">CodeReview</span>
          </Link>
          
          <div className="nav-links">
            <Link to="/home" className="nav-link">Home</Link>
            <button 
              className="nav-link nav-button" 
              onClick={() => handleProtectedNavigation('/dashboard')}
            >
              Dashboard
            </button>
            <button 
              className="nav-link nav-button" 
              onClick={() => handleProtectedNavigation('/submit')}
            >
              Submit Project
            </button>
          </div>
        </div>
        
        <div className="nav-right">
        {user ? (
          <div className="user-dropdown-container" ref={dropdownRef}>
            <button 
              className="user-avatar-button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {getUserAvatarUrl() ? (
                <img 
                  src={getUserAvatarUrl()} 
                  alt={getUserDisplayName()}
                  className="user-avatar-image"
                />
              ) : (
                <div className="user-avatar-initials">
                  {getUserInitials()}
                </div>
              )}
            </button>
            
            {dropdownOpen && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-user-info">
                    <strong>{getUserDisplayName()}</strong>
                    <span className="user-email">{user.email}</span>
                  </div>
                </div>
                <hr className="dropdown-divider" />
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/dashboard')
                    setDropdownOpen(false)
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                  Dashboard
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/profile')
                    setDropdownOpen(false)
                  }}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                  </svg>
                  Profile
                </button>
                <hr className="dropdown-divider" />
                <button 
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                    <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                  </svg>
                  Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-primary">
              Sign In
            </Link>
          </div>
        )}
        </div>
      </div>
    </nav>
  )
}
