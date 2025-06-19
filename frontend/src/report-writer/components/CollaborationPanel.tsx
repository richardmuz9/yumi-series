import React, { useState, useEffect } from 'react';
import { CollaborationUser, Comment } from '../types/ReportTypes';

interface CollaborationPanelProps {
  collaborators: CollaborationUser[];
  comments: Comment[];
  currentUserId: string;
  onCommentAdd: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  onCommentResolve: (commentId: string) => void;
  onCommentReply: (commentId: string, reply: string) => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  collaborators,
  comments,
  currentUserId,
  onCommentAdd,
  onCommentResolve,
  onCommentReply
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'comments'>('users');
  const [newComment, setNewComment] = useState('');
  const [selectedLine, setSelectedLine] = useState<number>(1);
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    onCommentAdd({
      userId: currentUserId,
      line: selectedLine,
      content: newComment,
      resolved: false
    });

    setNewComment('');
  };

  const handleReply = (commentId: string) => {
    const replyContent = replyInputs[commentId];
    if (!replyContent?.trim()) return;

    onCommentReply(commentId, replyContent);
    setReplyInputs(prev => ({ ...prev, [commentId]: '' }));
  };

  const getOnlineUsers = () => collaborators.filter(user => user.status === 'online');
  const getUnresolvedComments = () => comments.filter(comment => !comment.resolved);

  return (
    <div className="collaboration-panel">
      <div className="collaboration-header">
        <h3>👥 Collaboration</h3>
        <div className="collaboration-tabs">
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users ({getOnlineUsers().length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            Comments ({getUnresolvedComments().length})
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="users-panel">
          <div className="users-list">
            {collaborators.map(user => (
              <div key={user.id} className="user-item">
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-email">{user.email}</div>
                  {user.cursor && (
                    <div className="user-cursor">
                      Line {user.cursor.line}:{user.cursor.column}
                    </div>
                  )}
                </div>
                
                <div className={`user-status ${user.status}`}>
                  <div className="status-indicator"></div>
                  {user.status}
                </div>
              </div>
            ))}

            {collaborators.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">👤</div>
                <p>No collaborators online</p>
              </div>
            )}
          </div>

          <div className="collaboration-actions">
            <button className="invite-btn">
              📧 Invite Collaborators
            </button>
            <button className="share-btn">
              🔗 Share Link
            </button>
          </div>
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="comments-panel">
          <div className="add-comment-section">
            <div className="comment-input-group">
              <input
                type="number"
                min="1"
                value={selectedLine}
                onChange={(e) => setSelectedLine(Number(e.target.value))}
                placeholder="Line"
                className="line-input"
              />
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="comment-textarea"
                rows={3}
              />
            </div>
            <button 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="add-comment-btn"
            >
              💬 Add Comment
            </button>
          </div>

          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <div className="comment-user">
                    {collaborators.find(u => u.id === comment.userId)?.name || 'Unknown User'}
                  </div>
                  <div className="comment-line">Line {comment.line}</div>
                  <div className="comment-time">
                    {new Date(comment.timestamp).toLocaleString()}
                  </div>
                </div>
                
                <div className="comment-content">
                  {comment.content}
                </div>
                
                <div className="comment-actions">
                  {!comment.resolved && (
                    <button 
                      onClick={() => onCommentResolve(comment.id)}
                      className="resolve-btn"
                    >
                      ✅ Resolve
                    </button>
                  )}
                  
                  <div className="reply-section">
                    <input
                      type="text"
                      value={replyInputs[comment.id] || ''}
                      onChange={(e) => setReplyInputs(prev => ({
                        ...prev,
                        [comment.id]: e.target.value
                      }))}
                      placeholder="Reply..."
                      className="reply-input"
                    />
                    <button 
                      onClick={() => handleReply(comment.id)}
                      disabled={!replyInputs[comment.id]?.trim()}
                      className="reply-btn"
                    >
                      Reply
                    </button>
                  </div>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                  <div className="comment-replies">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="reply-item">
                        <div className="reply-header">
                          <span className="reply-user">
                            {collaborators.find(u => u.id === reply.userId)?.name || 'Unknown User'}
                          </span>
                          <span className="reply-time">
                            {new Date(reply.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="reply-content">{reply.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {comments.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <p>No comments yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-time Activity Feed */}
      <div className="activity-feed">
        <h4>Recent Activity</h4>
        <div className="activity-list">
          {/* Activity items would be populated from real-time events */}
          <div className="activity-item">
            <span className="activity-user">John</span>
            <span className="activity-action">edited line 42</span>
            <span className="activity-time">2 min ago</span>
          </div>
          <div className="activity-item">
            <span className="activity-user">Sarah</span>
            <span className="activity-action">added a comment</span>
            <span className="activity-time">5 min ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationPanel; 