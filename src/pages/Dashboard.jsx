import { useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const user = useSelector(state => state.auth.user)
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalProjects: 0, totalLikes: 0 })
  const [recentProjects, setRecentProjects] = useState([])

  useEffect(() => {
    if (user) {
      fetchUserStats()
      fetchRecentProjects()
    }
  }, [user])

  const fetchUserStats = async () => {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)

      if (!error) {
        setStats(prev => ({ ...prev, totalProjects: projects?.length || 0 }))
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRecentProjects = async () => {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      if (!error) {
        setRecentProjects(projects || [])
      }
    } catch (error) {
      console.error('Error fetching recent projects:', error)
    }
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-modern-container">
        <div className="dashboard-modern-content">
          {/* Welcome Header */}
          <div className="dashboard-welcome-section">
            <div className="welcome-content">
              <div className="welcome-text">
                <h1>Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'Developer'}! 👋</h1>
                <p>Ready to share your latest projects and discover amazing work from the community?</p>
              </div>
              <div className="user-profile-card">
                <img 
                  src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || user.email)}&background=007acc&color=fff`}
                  alt="Your avatar"
                  className="dashboard-avatar"
                />
                <div className="profile-details">
                  <h3>{user.user_metadata?.full_name || 'Developer'}</h3>
                  <p>{user.email}</p>
                  <span className="member-badge">Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="dashboard-stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📂</div>
              <div className="stat-content">
                <h3>{stats.totalProjects}</h3>
                <p>Projects Shared</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h3>{stats.totalLikes}</h3>
                <p>Total Likes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Community</h3>
                <p>Member</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-actions-section">
            <h2>Quick Actions</h2>
            <div className="action-cards-grid">
              <div className="modern-action-card" onClick={() => navigate('/submit')}>
                <div className="action-icon">🚀</div>
                <div className="action-content">
                  <h3>Submit New Project</h3>
                  <p>Share your latest creation with the community and get valuable feedback</p>
                </div>
                <div className="action-arrow">→</div>
              </div>
              <div className="modern-action-card" onClick={() => navigate('/home')}>
                <div className="action-icon">🔍</div>
                <div className="action-content">
                  <h3>Explore Projects</h3>
                  <p>Discover amazing projects from fellow developers and get inspired</p>
                </div>
                <div className="action-arrow">→</div>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="dashboard-recent-section">
            <div className="section-header">
              <h2>Your Recent Projects</h2>
              <button 
                className="view-all-btn"
                onClick={() => navigate('/home')}
              >
                View All →
              </button>
            </div>
            
            {recentProjects.length > 0 ? (
              <div className="recent-projects-grid">
                {recentProjects.map(project => (
                  <div 
                    key={project.id} 
                    className="recent-project-card"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    {project.image && (
                      <div className="project-image-mini">
                        <img src={project.image} alt={project.title} />
                      </div>
                    )}
                    <div className="project-info-mini">
                      <h4>{project.title}</h4>
                      <p>{project.description?.substring(0, 80)}...</p>
                      <div className="project-tags-mini">
                        {project.tags?.slice(0, 2).map((tag, index) => (
                          <span key={index} className="tag-mini">{tag}</span>
                        ))}
                        {project.tags?.length > 2 && <span className="tag-mini">+{project.tags.length - 2}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-projects-placeholder">
                <div className="placeholder-icon">📝</div>
                <h3>No projects yet</h3>
                <p>Start by submitting your first project to the community!</p>
                <button 
                  className="primary-btn"
                  onClick={() => navigate('/submit')}
                >
                  Submit Your First Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
