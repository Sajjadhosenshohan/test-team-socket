// app/documents/[id]/page.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import {
  Users,
  MessageSquare,
  Send,
  Trash2,
  Edit3,
  Save,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { getDocument, getDocumentComments } from '@/app/actions/solicitation';

interface ActiveUser {
  userId: string;
  userName: string;
  joinedAt: string;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  position?: number | null;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    profileImage?: string;
  };
}

interface DocumentData {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  lastEditedBy?: string;
  team: {
    id: string;
    name: string;
    leaderEmail: string;
    members: Array<{
      id: string;
      email: string;
      profileImage?: string;
    }>;
  };
}

export default function DocumentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [content, setContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState<Map<string, boolean>>(new Map());

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get user info from your auth system
  const userId = 'current-user-id'; // Replace with actual user ID
  const userName = 'Current User'; // Replace with actual user name

  // Load document and comments
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      const docResult = await getDocument(docId);
      if (docResult.error) {
        setError(docResult.error);
        setIsLoading(false);
        return;
      }

      setDocument(docResult.data!);
      setContent(docResult.data!.content);

      const commentsResult = await getDocumentComments(docId);
      if (!commentsResult.error) {
        setComments(commentsResult.data!);
      }

      setIsLoading(false);
    };

    loadData();
  }, [docId]);

  // Initialize socket connection
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    
    const newSocket = io(socketUrl, {
      auth: {
        token: 'your-auth-token', // Replace with actual token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      newSocket.emit('join-document', { docId, userId, userName });
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      showNotification('Connection error. Retrying...', true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      showNotification('Disconnected. Reconnecting...', true);
    });

    // Document events
    newSocket.on('document-loaded', ({ content: loadedContent }) => {
      setContent(loadedContent);
    });

    newSocket.on('active-users', ({ users }) => {
      setActiveUsers(users);
    });

    newSocket.on('user-joined', ({ userId: newUserId, userName: newUserName }) => {
      showNotification(`${newUserName} joined`);
      setActiveUsers((prev) => [
        ...prev,
        { userId: newUserId, userName: newUserName, joinedAt: new Date().toISOString() },
      ]);
    });

    newSocket.on('user-left', ({ userId: leftUserId }) => {
      setActiveUsers((prev) => prev.filter((u) => u.userId !== leftUserId));
    });

    newSocket.on('document-updated', ({ content: newContent, userId: editorId }) => {
      if (editorId !== userId) {
        setContent(newContent);
        showNotification('Document updated by teammate');
      }
    });

    newSocket.on('save-success', ({ timestamp }) => {
      setLastSaved(new Date(timestamp));
      setIsSaving(false);
    });

    newSocket.on('user-typing', ({ userId: typingUserId, userName: typingUserName, isTyping: typing }) => {
      setIsTyping((prev) => {
        const next = new Map(prev);
        if (typing) {
          next.set(typingUserId, true);
          setTimeout(() => {
            setIsTyping((current) => {
              const updated = new Map(current);
              updated.delete(typingUserId);
              return updated;
            });
          }, 3000);
        } else {
          next.delete(typingUserId);
        }
        return next;
      });
    });

    // Comment events
    newSocket.on('comment-added', (comment) => {
      setComments((prev) => [comment, ...prev]);
      showNotification('New comment added');
    });

    newSocket.on('comment-deleted', ({ commentId }) => {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    });

    newSocket.on('comment-updated', (updatedComment) => {
      setComments((prev) =>
        prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
      );
    });

    // Error events
    newSocket.on('error', ({ message, code }) => {
      showNotification(message, true);
      if (code === 'ACCESS_DENIED') {
        router.push('/documents');
      }
    });

    return () => {
      newSocket.emit('leave-document', { docId, userId });
      newSocket.disconnect();
    };
  }, [docId, userId, userName, router]);

  const showNotification = useCallback((message: string, isError = false) => {
    if (isError) {
      setError(message);
      setTimeout(() => setError(''), 5000);
    } else {
      setNotification(message);
      setTimeout(() => setNotification(''), 3000);
    }
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Emit typing indicator
    if (socket) {
      socket.emit('typing-start', { docId, userId, userName });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing-stop', { docId, userId });
      }, 1000);
    }

    // Debounce saving
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleSave(newContent);
    }, 1000);
  };

  const handleSave = async (contentToSave: string) => {
    if (!socket) return;

    setIsSaving(true);
    socket.emit('edit-document', {
      docId,
      content: contentToSave,
      userId,
    });
  };

  const handleAddComment = () => {
    if (!socket || !newComment.trim()) return;

    socket.emit('add-comment', {
      docId,
      content: newComment,
      authorId: userId,
      position: null,
    });

    setNewComment('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (!socket) return;

    socket.emit('delete-comment', {
      commentId,
      docId,
      userId,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error && !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/documents')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  const typingUsers = Array.from(isTyping.entries())
    .filter(([id, typing]) => typing && id !== userId)
    .map(([id]) => activeUsers.find(u => u.userId === id)?.userName)
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/documents')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {document?.title || 'Untitled Document'}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  {isSaving ? (
                    <span className="flex items-center">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Saving...
                    </span>
                  ) : lastSaved ? (
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  ) : null}
                  {typingUsers.length > 0 && (
                    <span className="text-blue-600">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {activeUsers.length} online
                </span>
              </div>
              <div className="flex -space-x-2">
                {activeUsers.slice(0, 5).map((user, idx) => (
                  <div
                    key={user.userId}
                    title={user.userName}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                  >
                    {user.userName[0]?.toUpperCase()}
                  </div>
                ))}
                {activeUsers.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-gray-700 text-xs font-medium">
                    +{activeUsers.length - 5}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{notification}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Document Content</h2>
                <p className="text-sm text-gray-500 mt-1">Changes are saved automatically</p>
              </div>
              <div className="p-6">
                <textarea
                  ref={editorRef}
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Start typing your document here... All team members can see your changes in real-time."
                  className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400 font-mono text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Comments Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24 max-h-[calc(100vh-7rem)] flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                    {comments.length}
                  </span>
                </div>
              </div>

              {/* Add Comment */}
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="overflow-y-auto flex-1">
                {comments.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No comments yet</p>
                    <p className="text-xs text-gray-400 mt-1">Be the first to comment</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {comments.map((comment) => (
                      <div key={comment.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-xs font-medium">
                                {comment.author?.name?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {comment.author?.name || 'Unknown'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 ml-8">{comment.content}</p>
                          </div>
                          {comment.authorId === userId && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-500 hover:text-red-700 transition-colors ml-2"
                              title="Delete comment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}