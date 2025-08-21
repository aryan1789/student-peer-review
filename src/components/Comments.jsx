import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { supabase } from '../utils/supabaseClient'
import { addComment, setComments } from '../store/slices/projectsSlice'

export default function Comments({ projectId, isVisible, onClose }) {
  const dispatch = useDispatch()
  const comments = useSelector(state => state.projects.comments[projectId] || [])
  const user = useSelector(state => state.auth.user)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchingComments, setFetchingComments] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isVisible && projectId) {
      setError(null)
      fetchComments()
    }
  }, [isVisible, projectId])

  const fetchComments = async () => {
    console.log('Fetching comments for project ID:', projectId)
    setFetchingComments(true)
    setError(null)
    try {
      // First try simple query without profiles join
      const { data: simpleData, error: simpleError } = await supabase
        .from('comments')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      console.log('Simple comments query result:', { simpleData, simpleError })

      if (simpleError) {
        console.error('Simple comments fetch error:', simpleError)
        if (simpleError.code === '42P01') {
          console.log('Comments table does not exist. Need to run database migration.')
          setError('Comments table not found. Please check database setup.')
          return
        }
        throw simpleError
      }

      // If simple query works, try with profiles
      let finalData = simpleData
      if (simpleData && simpleData.length > 0) {
        try {
          const { data: dataWithProfiles, error: profilesError } = await supabase
            .from('comments')
            .select(`
              *,
              profiles:user_id (
                id,
                email,
                full_name,
                avatar_url
              )
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: true })

          console.log('Comments with profiles query result:', { dataWithProfiles, profilesError })

          if (profilesError) {
            console.warn('Could not fetch profiles for comments, using simple data:', profilesError)
            // Use simple data without profiles
          } else {
            finalData = dataWithProfiles
          }
        } catch (profileErr) {
          console.warn('Profiles join failed for comments, using simple data:', profileErr)
        }
      }

      console.log('Final comments data:', finalData)

      console.log('Final comments data:', finalData)

      // Organize comments into threads
      const commentsMap = {}
      const rootComments = []

      finalData.forEach(comment => {
        commentsMap[comment.id] = { ...comment, replies: [] }
      })

      finalData.forEach(comment => {
        if (comment.parent_comment_id) {
          const parent = commentsMap[comment.parent_comment_id]
          if (parent) {
            parent.replies.push(commentsMap[comment.id])
          }
        } else {
          rootComments.push(commentsMap[comment.id])
        }
      })

      dispatch(setComments({ [projectId]: rootComments }))
    } catch (error) {
      console.error('Error fetching comments:', error)
      setError(`Failed to load comments: ${error.message}`)
    } finally {
      setFetchingComments(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    console.log('Submitting comment:', { newComment, user: user.id, projectId, replyTo })
    setLoading(true)
    try {
      const commentData = {
        content: newComment.trim(),
        user_id: user.id,
        project_id: projectId,
        parent_comment_id: replyTo?.id || null
      }

      console.log('Comment data to insert:', commentData)

      // Try simple insert first
      const { data: simpleData, error: simpleError } = await supabase
        .from('comments')
        .insert([commentData])
        .select('*')
        .single()

      console.log('Simple comment insert result:', { simpleData, simpleError })

      if (simpleError) {
        console.error('Simple comment insert error:', simpleError)
        if (simpleError.code === '42P01') {
          alert('Comments table does not exist. Please run the database migration first.')
          return
        }
        throw simpleError
      }

      // Try to get the comment with profile data
      let finalCommentData = simpleData
      try {
        const { data: dataWithProfile, error: profileError } = await supabase
          .from('comments')
          .select(`
            *,
            profiles:user_id (
              id,
              email,
              full_name,
              avatar_url
            )
          `)
          .eq('id', simpleData.id)
          .single()

        if (profileError) {
          console.warn('Could not fetch profile for new comment:', profileError)
        } else {
          finalCommentData = dataWithProfile
        }
      } catch (profileErr) {
        console.warn('Profile fetch failed for new comment:', profileErr)
      }

      const newCommentWithProfile = {
        ...finalCommentData,
        replies: []
      }

      console.log('Final new comment data:', newCommentWithProfile)

      dispatch(addComment({ 
        projectId, 
        comment: newCommentWithProfile,
        parentId: replyTo?.id || null
      }))

      setNewComment('')
      setReplyTo(null)
      fetchComments() // Refresh to get proper threading
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const CommentItem = ({ comment, depth = 0 }) => (
    <div className={`comment-item ${depth > 0 ? 'comment-reply' : ''}`} style={{ marginLeft: depth * 20 }}>
      <div className="comment-header">
        <div className="comment-avatar">
          <img 
            src={comment.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.profiles?.full_name || comment.profiles?.email || 'User')}&background=667eea&color=fff`}
            alt={comment.profiles?.full_name || 'User'}
          />
        </div>
        <div className="comment-meta">
          <span className="comment-author">{comment.profiles?.full_name || comment.profiles?.email || 'Anonymous'}</span>
          <span className="comment-time">
            {new Date(comment.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
      <div className="comment-content">
        <p>{comment.content}</p>
      </div>
      <div className="comment-actions">
        <button 
          className="reply-btn"
          onClick={() => setReplyTo(comment)}
        >
          Reply
        </button>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )

  if (!isVisible) return null

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h3>Comments ({comments.length})</h3>
        <button className="close-comments" onClick={onClose}>×</button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fee', color: '#c33', borderRadius: '4px', margin: '1rem 0' }}>
          {error}
          <button onClick={fetchComments} style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', background: '#c33', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      )}

      <div className="comments-list">
        {fetchingComments ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>

      {!user ? (
        <div style={{ padding: '1rem', background: '#fff3cd', borderRadius: '4px', textAlign: 'center' }}>
          Please log in to add comments.
        </div>
      ) : (
        <form onSubmit={handleSubmitComment} className="comment-form">
          {replyTo && (
            <div className="reply-indicator">
              <span>Replying to {replyTo.profiles?.full_name || replyTo.profiles?.email}</span>
              <button type="button" onClick={() => setReplyTo(null)}>×</button>
            </div>
          )}
          <div className="comment-input-container">
            <div className="comment-avatar">
              <img 
                src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || user?.email || 'User')}&background=667eea&color=fff`}
                alt="Your avatar"
              />
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyTo ? `Reply to ${replyTo.profiles?.full_name || 'comment'}...` : "Write a comment..."}
              rows={3}
              className="comment-textarea"
            />
          </div>
          <div className="comment-form-actions">
            <button 
              type="submit" 
              disabled={!newComment.trim() || loading}
              className="submit-comment-btn"
            >
              {loading ? 'Posting...' : replyTo ? 'Reply' : 'Comment'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
