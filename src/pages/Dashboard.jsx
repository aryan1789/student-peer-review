import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export default function Dashboard() {
  const user = useSelector(state => state.auth.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.user_metadata?.full_name || user.email}!</p>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Your Profile</h2>
          <div className="profile-info">
            <img 
              src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || user.email)}&background=667eea&color=fff`}
              alt="Your avatar"
              className="profile-avatar"
            />
            <div>
              <p><strong>Name:</strong> {user.user_metadata?.full_name || 'Not set'}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="action-card" onClick={() => window.location.href = '/submit'}>
              <h3>Submit New Project</h3>
              <p>Share your latest work with the community</p>
            </button>
            <button className="action-card" onClick={() => window.location.href = '/'}>
              <h3>Browse Projects</h3>
              <p>Discover and review peer projects</p>
            </button>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Recent Activity</h2>
          <div className="activity-placeholder">
            <p>Activity tracking will be available soon!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
