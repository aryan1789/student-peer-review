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
    const { data, error } = await supabase.from('projects').select('*')
    if (error) {
      console.error('Error fetching projects:', error)
    } else {
      setProjects(data || [])
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

  if (!user) {
    return <Auth onAuth={setUser} />
  }

  return (
    <>
    <Navbar/>
    <div className="container">
      <h1>Student Peer Review Platform</h1>
      <p>Welcome, {user.email}!</p>

      {/* <div className="card-container">
        <SubmitProject onProjectSubmitted={fetchProjects} />
      </div> */}

      <button onClick={() => supabase.auth.signOut()}>Log Out</button>

      <h2>Submitted Projects</h2>

      {projects.length === 0 ? (
        <p>No projects submitted yet.</p>
      ) : (
        <div className="card-container">
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card" >
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                {project.tags?.length > 0 && (
                  <div className="project-tags">
                    {project.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {project.project_link && (
                  <p>
                    🔗{' '}
                    <a href={project.project_link} target="_blank" rel="noopener noreferrer">
                      View Project
                    </a>
                  </p>
                )}
                {project.video_link && (
                  <p>
                    🎥{' '}
                    <a href={project.video_link} target="_blank" rel="noopener noreferrer">
                      Watch Video
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default App