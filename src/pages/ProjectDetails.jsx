import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import Navbar from '../components/Navbar'
import Comments from '../components/Comments'

export default function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showComments, setShowComments] = useState(false)
  const commentsRef = useRef(null)

  useEffect(() => {
    async function fetchProject() {
      console.log('Fetching project with ID:', id)
      try {
        // First try simple query without joins
        const { data: simpleData, error: simpleError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single()

        console.log('Simple project query result:', { simpleData, simpleError })

        if (simpleError) {
          console.error('Simple project fetch error:', simpleError)
          setError('Project not found')
          return
        }

        // If simple query works, try with profiles
        try {
          const { data, error } = await supabase
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
            .eq('id', id)
            .single()

          console.log('Project with profiles query result:', { data, error })

          if (error) {
            console.warn('Could not fetch with profiles, using simple data:', error)
            setProject(simpleData)
          } else {
            console.log('Project found with profiles:', data)
            setProject(data)
          }
        } catch (profileErr) {
          console.warn('Profiles join failed, using simple project data:', profileErr)
          setProject(simpleData)
        }
      } catch (err) {
        console.error('Project fetch exception:', err)
        setError('Failed to load project')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProject()
    }
  }, [id])

  useEffect(() => {
    // Check if comments should be shown based on URL parameter
    const commentsParam = searchParams.get('comments')
    if (commentsParam === 'true') {
      setShowComments(true)
    }
  }, [searchParams])

  // Function to toggle comments with auto-scroll
  const toggleComments = () => {
    const newShowComments = !showComments
    setShowComments(newShowComments)
    
    if (newShowComments && commentsRef.current) {
      // Small delay to allow the comments section to render
      setTimeout(() => {
        commentsRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest' 
        })
      }, 100)
    }
  }

  if (loading) {
    return <div className="container"><p>Loading...</p></div>
  }

  if (error) {
    return (
      <>
        <Navbar/>
        <div className="container">
          <button onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>
            ← Back to Projects
          </button>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'red', fontSize: '1.2rem' }}>{error}</p>
            <p>Project ID: {id}</p>
            <p>Please check the console for more details.</p>
            <button onClick={() => navigate('/')}>Back to Projects</button>
          </div>
        </div>
      </>
    )
  }

  if (!project) {
    return (
      <div className="container">
        <p>Project not found</p>
        <button onClick={() => navigate('/')}>Back to Projects</button>
      </div>
    )
  }

  return (
    <>
      <Navbar/>
      <div className="project-details-container">
        <div className="project-details-content">
          <button 
            onClick={() => navigate('/home')} 
            className="back-button"
          >
            ← Back to Projects
          </button>
          
          <div className="project-details-card">
            {/* Header with user info */}
            <div className="project-header">
              <div className="user-info-detailed">
                <img 
                  src={project.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.profiles?.full_name || project.profiles?.email || 'User')}&background=007acc&color=fff`}
                  alt={project.profiles?.full_name || 'User'}
                  className="user-avatar-large"
                />
                <div className="user-details">
                  <h3 className="user-name">{project.profiles?.full_name || project.profiles?.email || 'Anonymous User'}</h3>
                  <p className="project-date">
                    Published on {project.created_at && new Date(project.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Project image */}
            {project.image && (
              <div className="project-image-container">
                <img 
                  src={project.image}
                  alt={project.title}
                  className="project-image-large"
                />
              </div>
            )}
            
            {/* Project title */}
            <h1 className="project-title-large">{project.title}</h1>
            
            {/* Tags */}
            {project.tags?.length > 0 && (
              <div className="project-tags-detailed">
                {project.tags.map((tag, index) => (
                  <span key={index} className="tag-detailed">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="project-description-detailed">
              <h3>About this project</h3>
              <p>{project.description}</p>
            </div>

            {/* Links section */}
            {(project.project_link || project.video_link) && (
              <div className="project-links-section">
                <h3>Project Links</h3>
                <div className="project-links">
                  {project.project_link && (
                    <a 
                      href={project.project_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="project-link-button"
                    >
                      🔗 View Project
                    </a>
                  )}
                  
                  {project.video_link && (
                    <a 
                      href={project.video_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="project-link-button video-link"
                    >
                      🎥 Watch Demo
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Comments section */}
            <div className="comments-section-detailed" ref={commentsRef}>
              <button 
                onClick={toggleComments}
                className="comments-toggle-button"
              >
                {showComments ? '💬 Hide Comments' : '💬 Show Comments'}
              </button>
              
              {showComments && (
                <div className="comments-container">
                  <Comments 
                    projectId={project.id}
                    isVisible={showComments}
                    onClose={() => setShowComments(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}