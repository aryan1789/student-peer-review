import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { supabase } from '../utils/supabaseClient'
import { setUser } from '../store/slices/authSlice'
import Navbar from '../components/Navbar'

export default function LandingPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth.user)

  useEffect(() => {
    // Check if user is authenticated and update Redux
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setUser(session?.user ?? null))
    })

    // Listen for auth changes and update Redux
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      dispatch(setUser(session?.user ?? null))
    })

    return () => subscription.unsubscribe()
  }, [dispatch])

  // If user is logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/home')
    }
  }, [user, navigate])

  return (
    <div className="landing-container">
      <Navbar />
      
      <div className="landing-content">
        <div className="hero-section">
          <h1>Student Peer Review Platform</h1>
          <p>Share your code, get feedback, and grow as a developer</p>
        </div>

        <div className="features-section">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Share Your Code</h3>
            <p>Upload your projects with descriptions and tech stacks</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Get Peer Reviews</h3>
            <p>Receive constructive feedback from fellow developers</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Level Up</h3>
            <p>Improve your skills and build better applications</p>
          </div>
        </div>

        <div className="featured-section">
          <h2>Featured Projects</h2>
          <p>Check out what the community is building.</p>
          
          <div className="login-prompt">
            <button onClick={() => navigate('/login')} className="login-cta">
              Login to see projects and join the community
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}