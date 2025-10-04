import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { supabase } from "../utils/supabaseClient";
import Navbar from "./Navbar";

export default function SubmitProject({ onProjectSubmitted }) {
    const navigate = useNavigate()
    const user = useSelector(state => state.auth.user)
    
    // Redirect to login if not authenticated
    useEffect(() => {
        if (!user) {
            navigate('/login')
        }
    }, [user, navigate])
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState([])
    const [projectLink, setProjectLink] = useState('')
    const [videoLink, setVideoLink] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            
            if (userError || !user) {
                setError('Not authenticated. Please log in.')
                setLoading(false)
                return
            }

            const { error: insertError } = await supabase.from('projects').insert([
                {
                    title,
                    description,
                    tags: tags,
                    project_link: projectLink || null,
                    video_link: videoLink || null,
                    user_id: user.id
                }
            ])

            if (insertError) {
                setError(insertError.message)
            } else {
                setSuccess('Project submitted successfully!')
                // Reset form
                setTitle('')
                setDescription('')
                setTags([])
                setProjectLink('')
                setVideoLink('')
                // Call the callback to refresh projects
                if (onProjectSubmitted) {
                    onProjectSubmitted()
                }
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const predefinedTags = ['React', 'Vue', 'JavaScript', 'Python', 'API', 'ML', 'Node.js', 'CSS', 'HTML', 'Database']

    return (
        <>
        <Navbar/>
        <div className="main-content">
            <div className="page-header">
                <h1>Submit Your Project</h1>
                <p>Share your work with the community and get valuable feedback</p>
            </div>
            <div className="form-container">
                <form onSubmit={handleSubmit} className="submit-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="title">Project Title *</label>
                            <input 
                                id="title"
                                type="text" 
                                placeholder="My Awesome Project" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="description">Project Description *</label>
                            <textarea 
                                id="description"
                                placeholder="Tell us about your project. What does it do? What technologies did you use? What challenges did you face?"
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                required 
                                rows="5"
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Technology Tags</label>
                            <p className="field-description">Select the technologies used in your project</p>
                            <div className="tag-selection">
                                {predefinedTags.map((tag) => (
                                    <label key={tag} className="tag-checkbox">
                                        <input
                                            type="checkbox"
                                            value={tag}
                                            checked={tags.includes(tag)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setTags([...tags, tag])
                                                } else {
                                                    setTags(tags.filter((t) => t !== tag))
                                                }
                                            }}
                                        />
                                        <span className="tag-label">{tag}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="projectLink">🔗 Project Link</label>
                            <input 
                                id="projectLink"
                                type="url" 
                                placeholder="https://github.com/username/project" 
                                value={projectLink} 
                                onChange={(e) => setProjectLink(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="videoLink">🎥 Video Demo</label>
                            <input 
                                id="videoLink"
                                type="url" 
                                placeholder="https://youtube.com/watch?v=..." 
                                value={videoLink} 
                                onChange={(e) => setVideoLink(e.target.value)} 
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Project'}
                    </button>
                </form>
                
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
            </div>
        </div>
        </>
    )
}