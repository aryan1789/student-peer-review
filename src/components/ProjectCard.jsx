import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { toggleLike, setLikes } from '../store/slices/projectsSlice'

export default function ProjectCard({ project, onClick }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(state => state.auth.user)
  const likes = useSelector(state => state.projects.likes[project.id] || { count: 0, userLiked: false })
  const [likesCount, setLikesCount] = useState(0)
  const [userLiked, setUserLiked] = useState(false)
  const [commentsCount, setCommentsCount] = useState(0)

  // Debug logging to see what user data we have
  console.log('ProjectCard received project:', {
    title: project.title,
    user_id: project.user_id,
    profiles: project.profiles,
    hasProfiles: !!project.profiles
  })

  useEffect(() => {
    fetchLikesAndComments()
  }, [project.id, user])

  const fetchLikesAndComments = async () => {
    try {
      // Check if likes table exists, if not skip likes functionality for now
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('user_id')
        .eq('project_id', project.id)

      if (likesError && likesError.code === '42P01') {
        // Table doesn't exist, skip likes functionality
        console.log('Likes table not found, skipping likes functionality')
        setLikesCount(0)
        setUserLiked(false)
      } else if (likesError) {
        throw likesError
      } else {
        const totalLikes = likesData?.length || 0
        const userHasLiked = user ? likesData?.some(like => like.user_id === user.id) : false

        setLikesCount(totalLikes)
        setUserLiked(userHasLiked)
      }

      // Check if comments table exists
      const { count: commentsCountData, error: commentsError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)

      if (commentsError && commentsError.code === '42P01') {
        // Table doesn't exist, skip comments functionality
        console.log('Comments table not found, skipping comments functionality')
        setCommentsCount(0)
      } else if (commentsError) {
        throw commentsError
      } else {
        setCommentsCount(commentsCountData || 0)
      }

    } catch (error) {
      console.error('Error fetching likes and comments:', error)
      // Set defaults if there's an error
      setLikesCount(0)
      setUserLiked(false)
      setCommentsCount(0)
    }
  }

  const handleLike = async (e) => {
    e.stopPropagation()
    if (!user) return

    try {
      if (userLiked) {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('project_id', project.id)
          .eq('user_id', user.id)

        if (error && error.code !== '42P01') throw error

        setLikesCount(prev => prev - 1)
        setUserLiked(false)
      } else {
        // Add like
        const { error } = await supabase
          .from('likes')
          .insert([{
            project_id: project.id,
            user_id: user.id
          }])

        if (error && error.code !== '42P01') throw error

        setLikesCount(prev => prev + 1)
        setUserLiked(true)
      }

      dispatch(toggleLike({ projectId: project.id, userId: user.id }))
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revert the UI change if there was an error
      fetchLikesAndComments()
    }
  }

  const handleComment = (e) => {
    e.stopPropagation()
    console.log('Navigating to project comments, ID:', project.id, 'Project:', project)
    // Navigate to project details page with comments shown
    navigate(`/project/${project.id}?comments=true`)
  }

  const handleCardClick = (e) => {
    // Only trigger onClick if not clicking action buttons
    if (!e.target.closest('.project-actions')) {
      onClick()
    }
  }

  return (
    <div className="project-card home-project-card">
      <div 
        className="project-card-content-wrapper"
        onClick={handleCardClick} 
        style={{ cursor: 'pointer' }}
      >
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
                src={project.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.profiles?.full_name || project.profiles?.email || project.creator_name || project.user_email || 'User')}&background=667eea&color=fff`}
                alt={project.profiles?.full_name || project.creator_name || 'User'}
              />
            </div>
            <div className="user-details">
              <span className="user-name">
                {project.profiles?.full_name || 
                 project.profiles?.email || 
                 project.creator_name || 
                 project.user_email || 
                 'Anonymous User'}
              </span>
              <span className="post-time">
                {project.created_at && new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <h3>{project.title}</h3>
          <p>{project.description.slice(0, 100)}...</p>
          {project.tags?.length > 0 && (
            <div className="project-tags">
              {project.tags.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          )}

          <div className="project-actions">
            <button 
              className={`action-btn like-btn ${userLiked ? 'liked' : ''}`}
              onClick={handleLike}
              title={userLiked ? 'Unlike' : 'Like'}
            >
              <svg width="24" height="24" fill={userLiked ? '#ff3040' : 'currentColor'} viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {likesCount > 0 && <span>{likesCount}</span>}
            </button>

            <button 
              className={`action-btn comment-btn`}
              onClick={handleComment}
              title="Comments"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {commentsCount > 0 && <span>{commentsCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
