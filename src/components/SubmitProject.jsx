import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function SubmitProject({ onProjectSubmitted }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState([])
    const [projectLink, setProjectLink] = useState('')
    const [videoLink, setVideoLink] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log("Submitting project...s")
        setError('')
        //setLoading(true)

        const user = (await supabase.auth.getUser()).data.user
        if (!user) {
            setError('Not authenticated.')
            return
        }

        const { error: insertError } = await supabase.from('projects').insert([
            {
                title,
                description,
                tags: tags,
                project_link: projectLink,
                video_link: videoLink,
                user_id: user.id
            }
        ])

        if (insertError) {
            setError(insertError.message)
        } else {
            setSuccess('Project submitted successfully!')
            onProjectSubmitted?.()
            setTitle('')
            setDescription('')
            setTags([])
            setProjectLink('')
            setVideoLink('')
        }
    }
    const predefinedTags = ['React', 'Vue', 'JavaScript', 'Python', 'API', 'ML']

    return (
        <div className="submit-container">
            <h2>Submit a New Project</h2>
            <form onSubmit={handleSubmit} className="submit-form">
                <input type="text" placeholder="Project Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <textarea placeholder="Short Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
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

                <input type="url" placeholder="Project Link (optional)" value={projectLink} onChange={(e) => setProjectLink(e.target.value)} />
                <input type="url" placeholder="Video Walkthrough Link (optional)" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} />
                <button type="submit">Submit Project</button>
            </form>
            {error && <p className="error-msg">{error}</p>}
            {success && <p className="success-msg">{success}</p>}
        </div>
    )
}