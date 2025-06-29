import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import Navbar from '../components/Navbar'

export default function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProject() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          setError('Project not found')
        } else {
          setProject(data)
        }
      } catch (err) {
        setError('Failed to load project')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProject()
    }
  }, [id])

  if (loading) {
    return <div className="container"><p>Loading...</p></div>
  }

  if (error) {
    return (
      <div className="container">
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/')}>Back to Projects</button>
      </div>
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
        <h1>{project.title}</h1>
        <p>{project.description}</p>
        
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

        {project.created_at && (
          <p style={{ marginTop: '2rem', color: '#666', fontSize: '0.9rem' }}>
            Submitted on {new Date(project.created_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
    </>
  )
}