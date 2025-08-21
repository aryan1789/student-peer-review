import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './utils/supabaseClient'
import Auth from './components/Auth'
import SubmitProject from './components/SubmitProject'
import Navbar from './components/Navbar'

function App() {
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])

  // Function to fetch projects - defined here so it can be called from multiple places
  const fetchProjects = async () => {
    console.log('Dashboard: Fetching projects...')
    
    // Strategy 1: Try to fetch with profiles join
    try {
      const { data: projectsWithProfiles, error: profilesError } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:user_id (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
      
      if (!profilesError && projectsWithProfiles) {
        console.log('Dashboard: Successfully fetched projects with profiles', projectsWithProfiles)
        setProjects(projectsWithProfiles)
        return
      } else {
        console.log('Dashboard: Profiles join failed:', profilesError)
      }
    } catch (err) {
      console.log('Dashboard: Profiles join error:', err)
    }

    // Strategy 2: Fetch basic projects and try to add user info manually
    try {
      const { data: basicProjects, error: basicError } = await supabase
        .from('projects')
        .select('*')
      
      if (basicError) {
        console.error('Dashboard: Error fetching basic projects:', basicError)
        return
      }

      console.log('Dashboard: Fetched basic projects:', basicProjects)

      // Try to enhance with user info from profiles table
      const enhancedProjects = await Promise.all(
        basicProjects.map(async (project) => {
          // If we have user_id, try to get user info
          if (project.user_id) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', project.user_id)
                .single()
              
              if (profile) {
                return { ...project, profiles: profile }
              }
            } catch (profileErr) {
              console.log('Dashboard: Profile lookup failed for user:', project.user_id)
            }
          }
          return project
        })
      )

      console.log('Dashboard: Enhanced projects:', enhancedProjects)
      setProjects(enhancedProjects)
    } catch (err) {
      console.error('Dashboard: Failed to fetch projects:', err)
      setProjects([])
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    fetchProjects()
  }, [user])

  // Debug logging to see user ID comparison
  useEffect(() => {
    if (user && projects.length > 0) {
      console.log('Dashboard Debug:', {
        currentUserId: user.id,
        currentUserIdType: typeof user.id,
        userProjectsCount: projects.filter(p => String(p.user_id) === String(user.id)).length,
        projects: projects.map(p => ({
          title: p.title,
          user_id: p.user_id,
          user_id_type: typeof p.user_id,
          matchesExact: p.user_id === user.id,
          matchesString: String(p.user_id) === String(user.id)
        }))
      })
    }
  }, [user, projects])

  if (!user) {
    return <Auth onAuth={setUser} />
  }

  return (
    <>
    <Navbar/>
    <div className="container" style={{ paddingTop: '100px' }}>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="welcome-message">Welcome back, {user.email}!</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{projects.filter(p => String(p.user_id) === String(user.id)).length}</h3>
          <p>Your Projects</p>
        </div>
        <div className="stat-card">
          <h3>{projects.length}</h3>
          <p>Total Projects</p>
        </div>
        <div className="stat-card">
          <h3>{projects.filter(p => String(p.user_id) !== String(user.id)).length}</h3>
          <p>Others' Projects</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Your Submitted Projects</h2>
        {projects.filter(p => String(p.user_id) === String(user.id)).length === 0 ? (
          <div className="empty-state">
            <p>You haven't submitted any projects yet.</p>
            <p>Submit your first project to get started!</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.filter(p => String(p.user_id) === String(user.id)).map((project) => (
              <div key={project.id} className="project-card dashboard-project-card">
                <div className="project-card-image">
                  <img 
                    src={project.image || 'https://www.bigfootdigital.co.uk/wp-content/uploads/2020/07/image-optimisation-scaled.jpg'} 
                    alt={project.title}
                  />
                </div>
                <div className="project-card-content">
                  <div className="user-info">
                    <div className="user-avatar">
                      <img 
                        src={project.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.profiles?.full_name || project.profiles?.email || 'User')}&background=667eea&color=fff`}
                        alt={project.profiles?.full_name || 'User'}
                      />
                    </div>
                    <div className="user-details">
                      <span className="user-name">{project.profiles?.full_name || project.profiles?.email || 'Anonymous User'}</span>
                      <span className="post-time">
                        {project.created_at && new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-header">
                    <h3>{project.title}</h3>
                  </div>
                  <p className="project-description">{project.description}</p>
                  
                  {project.tags?.length > 0 && (
                    <div className="project-tags">
                      {project.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="project-links">
                    {project.project_link && (
                      <a href={project.project_link} target="_blank" rel="noopener noreferrer" className="project-link">
                        🔗 View Project
                      </a>
                    )}
                    
                    {project.video_link && (
                      <a href={project.video_link} target="_blank" rel="noopener noreferrer" className="project-link">
                        🎥 Watch Video
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default App