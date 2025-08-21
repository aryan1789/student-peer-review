import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "./Navbar";

export default function SubmitProject({ onProjectSubmitted }) {
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
        <br></br>
        <br></br>
        <div className="submit-container glass-container">
            <h2>Submit a New Project</h2>
            <form onSubmit={handleSubmit} className="submit-form glass-form">
                <input 
                    type="text" 
                    placeholder="Project Title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                />
                <textarea 
                    placeholder="Project Description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required 
                    rows="4"
                />
                
                <div className="tag-selection">
                    <label>Select relevant tags:</label>
                    <div className="tag-options">
                        {predefinedTags.map((tag) => (
                            <label key={tag} className="tag-option">
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
                                {tag}
                            </label>
                        ))}
                    </div>
                </div>

                <input 
                    type="url" 
                    placeholder="Project Link (optional)" 
                    value={projectLink} 
                    onChange={(e) => setProjectLink(e.target.value)} 
                />
                <input 
                    type="url" 
                    placeholder="Video Walkthrough Link (optional)" 
                    value={videoLink} 
                    onChange={(e) => setVideoLink(e.target.value)} 
                />
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Project'}
                </button>
            </form>
            
            {error && <p className="error-msg">{error}</p>}
            {success && <p className="success-msg">{success}</p>}
        </div>
        </>
    )
}