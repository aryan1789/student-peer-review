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
    <div className={`comment-item-modern ${depth > 0 ? 'comment-reply-modern' : ''}`}>
      <div className="comment-main">
        <img 
          src={comment.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.profiles?.full_name || comment.profiles?.email || 'User')}&background=007acc&color=fff`}
          alt={comment.profiles?.full_name || 'User'}
          className="comment-avatar-display"
        />
        <div className="comment-body">
          <div className="comment-header-info">
            <span className="comment-username">{comment.profiles?.full_name || comment.profiles?.email || 'Anonymous'}</span>
            <span className="comment-timestamp">
              {(() => {
                const now = new Date()
                const commentDate = new Date(comment.created_at)
                const diffInMinutes = Math.floor((now - commentDate) / (1000 * 60))
                
                if (diffInMinutes < 1) return 'now'
                if (diffInMinutes < 60) return `${diffInMinutes}m`
                if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
                if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`
                return commentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              })()}
            </span>
          </div>
          <div className="comment-text">
            {comment.content}
          </div>
          <div className="comment-actions-modern">
            <button 
              className="action-btn reply-action"
              onClick={() => setReplyTo(comment)}
            >
              Reply
            </button>
            <button className="action-btn like-action">
              ♡ Like
            </button>
          </div>
        </div>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies-modern">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )

  if (!isVisible) return null

  return (
    <div className="modern-comments-section">
      <div className="comments-header-modern">
        <h3>💬 Comments</h3>
        <span className="comments-count">{comments.length}</span>
      </div>

      {error && (
        <div className="error-message-modern">
          <span>{error}</span>
          <button onClick={fetchComments} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Comment Input Form - Top like Instagram */}
      {user && (
        <div className="comment-input-modern">
          {replyTo && (
            <div className="reply-indicator-modern">
              <span>Replying to <strong>@{replyTo.profiles?.full_name || replyTo.profiles?.email}</strong></span>
              <button type="button" onClick={() => setReplyTo(null)} className="cancel-reply">×</button>
            </div>
          )}
          <form onSubmit={handleSubmitComment} className="comment-form-modern">
            <div className="comment-input-wrapper">
              <img 
                src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || user?.email || 'User')}&background=007acc&color=fff`}
                alt="Your avatar"
                className="comment-avatar-modern"
              />
              <div className="input-and-button">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyTo ? `Reply to ${replyTo.profiles?.full_name || 'comment'}...` : "Add a comment..."}
                  className="comment-input-field"
                />
                <button 
                  type="submit" 
                  disabled={!newComment.trim() || loading}
                  className="post-comment-btn"
                >
                  {loading ? '...' : 'Post'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {!user && (
        <div className="login-prompt-modern">
          <span>Sign in to join the conversation</span>
        </div>
      )}

      <div className="comments-list-modern">
        {fetchingComments ? (
          <div className="loading-comments">
            <div className="loading-spinner"></div>
            <span>Loading comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="no-comments-modern">
            <div className="no-comments-icon">💭</div>
            <h4>No comments yet</h4>
            <p>Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  )
}
