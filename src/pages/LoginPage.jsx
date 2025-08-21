import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { supabase } from '../utils/supabaseClient'
import { setUser } from '../store/slices/authSlice'
import Navbar from '../components/Navbar'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate('/')
      }
    }
    checkUser()
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }

    let result
    if (isLogin) {
      result = await supabase.auth.signInWithPassword({ email, password })
    } else {
      result = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            email: email
          }
        }
      })
    }

    const { error, data } = result
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      console.log('Authentication successful:', data)
      dispatch(setUser(data.user))
      navigate('/')
    }
  }

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <div className="auth-container">
          <h2>{isLogin ? 'Log In' : 'Sign Up'}</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                marginBottom: '1rem', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                marginBottom: '1rem', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            />
            {!isLogin && (
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  marginBottom: '1rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px' 
                }}
              />
            )}
            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          {error && (
            <p style={{ 
              color: '#dc3545', 
              marginTop: '1rem', 
              padding: '0.5rem', 
              background: '#f8d7da', 
              border: '1px solid #f5c6cb', 
              borderRadius: '4px' 
            }}>
              {error}
            </p>
          )}

          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: '1px solid #6c757d',
                color: '#6c757d',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
