import { useEffect, useState } from 'react'
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
    <div className="container">
      <button onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>
        ← Back to Projects
      </button>
      
      <div className="card-container">
        <div className="user-info" style={{ marginBottom: '1rem' }}>
          <div className="user-avatar">
            <img 
              src={project.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.profiles?.full_name || project.profiles?.email || 'User')}&background=667eea&color=fff`}
              alt={project.profiles?.full_name || 'User'}
              style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '1rem' }}
            />
          </div>
          <div>
            <strong>{project.profiles?.full_name || project.profiles?.email || 'Anonymous User'}</strong>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              {project.created_at && new Date(project.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {project.image && (
          <div style={{ marginBottom: '1rem' }}>
            <img 
              src={project.image}
              alt={project.title}
              style={{ width: '100%', maxWidth: '600px', borderRadius: '8px' }}
            />
          </div>
        )}
        
        <h1>{project.title}</h1>
        <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>{project.description}</p>
        
        {project.tags?.length > 0 && (
          <div className="project-tags" style={{ margin: '1rem 0' }}>
            {project.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          {project.project_link && (
            <p>
              <strong>🔗 Project Link:</strong>{' '}
              <a href={project.project_link} target="_blank" rel="noopener noreferrer">
                {project.project_link}
              </a>
            </p>
          )}
          
          {project.video_link && (
            <p>
              <strong>🎥 Video Walkthrough:</strong>{' '}
              <a href={project.video_link} target="_blank" rel="noopener noreferrer">
                {project.video_link}
              </a>
            </p>
          )}
        </div>

        <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
          <button 
            onClick={() => setShowComments(!showComments)}
            style={{ 
              background: showComments ? '#667eea' : 'transparent',
              color: showComments ? 'white' : '#667eea',
              border: '2px solid #667eea',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {showComments ? 'Hide Comments' : 'Show Comments'}
          </button>
        </div>
        
        {showComments && (
          <div style={{ marginTop: '1rem' }}>
            <Comments 
              projectId={project.id}
              isVisible={showComments}
              onClose={() => setShowComments(false)}
            />
          </div>
        )}
      </div>
    </div>
    </>
  )
}