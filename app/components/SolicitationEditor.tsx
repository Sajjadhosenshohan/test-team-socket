"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageSquare, FileText, X, Trash2, Download, Plus, Loader2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { createSolicitationDoc, getDocComments, getTeamDocs, getUserInfo } from '../actions/solicitation.actions';

// Server Actions (place in separate file: app/actions/solicitation.ts)
// Copy the createSolicitationDoc, getTeamDocs, getSolicitationDoc, deleteSolicitationDoc, getDocComments functions here

interface Document {
    id: string;
    title: string;
    content?: string;
    updatedAt: string;
    createdBy: string;
    teamId: string;
}

interface Comment {
    id: string;
    content: string;
    authorId: string;
    author?: {
        id: string;
        name: string;
        profileImage?: string;
    };
    createdAt: string;
    position?: number;
}

interface ActiveUser {
    userId: string;
    userName: string;
}

const SolicitationEditor = () => {
    // State Management
    const [documents, setDocuments] = useState<Document[]>([]);
    const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
    const [content, setContent] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [showNewDoc, setShowNewDoc] = useState(false);
    const [newDocTitle, setNewDocTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

    const [currentUser, setCurrentUser] = useState<any>(null);

    const userId = currentUser?.id;
    const userName = currentUser?.firstName;
    const getCurrentUser = async () => {
        const user = await getUserInfo();
        setCurrentUser(user?.result);
    }

    // console.log("currentUser", currentUser)

    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize Socket Connection
    useEffect(() => {
        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5004';

        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current.on('connect', () => {
            console.log('✅ Socket connected');
        });

        socketRef.current.on('error', (error: any) => {
            console.error('❌ Socket error:', error);
            alert(error.message || 'An error occurred');
        });

        socketRef.current.on('disconnect', () => {
            console.log('❌ Socket disconnected');
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Load Documents on Mount
    useEffect(() => {
        getCurrentUser();
        loadDocuments();
    }, []);

    // Document Socket Handlers
    useEffect(() => {
        if (!currentDoc || !socketRef.current) return;

        const socket = socketRef.current;

        // Join document room
        socket.emit('join-document', {
            docId: currentDoc.id,
            userId: currentUser?.id,
            userName: currentUser?.firstName
        });

        // Document loaded
        socket.on('document-loaded', ({ content: docContent }) => {
            setContent(docContent || '');
        });

        // Document updated by others
        socket.on('document-updated', ({ content: newContent, userId: editorId }) => {
            if (editorId !== currentUser?.id) {
                setContent(newContent);
            }
        });

        // Save success
        socket.on('save-success', () => {
            setIsSaving(false);
        });

        // Comments
        socket.on('comment-added', (comment: Comment) => {
            setComments(prev => [comment, ...prev]);
        });

        socket.on('comment-deleted', ({ commentId }: { commentId: string }) => {
            setComments(prev => prev.filter(c => c.id !== commentId));
        });

        // Active users
        socket.on('active-users', ({ users }: { users: ActiveUser[] }) => {
            setActiveUsers(users);
        });

        socket.on('user-joined', ({ userId: joinedUserId, userName: joinedUserName }: { userId: string; userName: string }) => {
            setActiveUsers(prev => [...prev, { userId: joinedUserId, userName: joinedUserName }]);
        });

        socket.on('user-left', ({ userId: leftUserId }: { userId: string }) => {
            setActiveUsers(prev => prev.filter(u => u.userId !== leftUserId));
        });

        // Typing indicators
        socket.on('user-typing', ({ userId: typingUserId, isTyping }: { userId: string; isTyping: boolean }) => {
            setTypingUsers(prev => {
                const newSet = new Set(prev);
                if (isTyping) {
                    newSet.add(typingUserId);
                } else {
                    newSet.delete(typingUserId);
                }
                return newSet;
            });
        });

        // Load comments
        loadComments(currentDoc.id);

        return () => {
            socket.off('document-loaded');
            socket.off('document-updated');
            socket.off('save-success');
            socket.off('comment-added');
            socket.off('comment-deleted');
            socket.off('active-users');
            socket.off('user-joined');
            socket.off('user-left');
            socket.off('user-typing');

            socket.emit('leave-document', { docId: currentDoc.id, userId: currentUser?.id });
        };
    }, [currentDoc, currentUser]);

    // API Calls (Replace with your server actions)
    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            const result = await getTeamDocs();
            if (result.success) {
                setDocuments(result.data);
            }
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadComments = async (docId: string) => {
        try {
            const result = await getDocComments(docId);
            console.log("load comments", result)
            if (result.success) {
              setComments(result.data);
            }

        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);

        // Emit typing indicator
        if (socketRef.current && currentDoc) {
            socketRef.current.emit('typing-start', { docId: currentDoc.id, userId, userName });

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current?.emit('typing-stop', { docId: currentDoc.id, userId });
            }, 1000);
        }

        // Debounced save
        setIsSaving(true);
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            if (socketRef.current && currentDoc) {
                socketRef.current.emit('edit-document', {
                    docId: currentDoc.id,
                    content: newContent,
                    userId
                });
            }
        }, 1000);
    };

    const handleAddComment = () => {
        if (!newComment.trim() || !currentDoc || !socketRef.current) return;

        socketRef.current.emit('add-comment', {
            docId: currentDoc.id,
            content: newComment,
            authorId: userId,
            position: null
        });

        setNewComment('');
    };

    const handleDeleteComment = (commentId: string) => {
        if (!currentDoc || !socketRef.current) return;

        socketRef.current.emit('delete-comment', {
            commentId,
            docId: currentDoc.id,
            userId
        });
    };

    const selectDocument = async (doc: Document) => {
        setCurrentDoc(doc);
        setComments([]);
        setShowComments(false);
    };

    const createNewDocument = async () => {
        if (!newDocTitle.trim()) return;

        try {
            const result = await createSolicitationDoc({ title: newDocTitle });
            console.log("result client", result)
            if (result.success) {
                await loadDocuments();
                selectDocument(result.data);
            }

            // Mock for demo
            // const newDoc: Document = {
            //     id: 'doc-' + Date.now(),
            //     title: newDocTitle,
            //     updatedAt: new Date().toISOString(),
            //     createdBy: userId,
            //     teamId: 'team1'
            // };
            setDocuments(prev => [ ...prev]);
            // selectDocument(newDoc);
        } catch (error) {
            console.error('Failed to create document:', error);
        } finally {
            setNewDocTitle('');
            setShowNewDoc(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-7 h-7 text-blue-600" />
                        Solicitation Docs
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">Collaborative Workspace</p>
                </div>

                <div className="p-4">
                    <button
                        onClick={() => setShowNewDoc(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Document
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        documents.map(doc => (
                            <button
                                key={doc.id}
                                onClick={() => selectDocument(doc)}
                                className={`w-full text-left p-4 rounded-lg transition-all ${currentDoc?.id === doc.id
                                        ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                                        : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                                    }`}
                            >
                                <div className="font-semibold text-slate-900 mb-1 line-clamp-1">
                                    {doc.title}
                                </div>
                                <div className="text-xs text-slate-500">
                                    Updated {formatDate(doc.updatedAt)}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="font-medium">{userName}</span>
                    </div>
                </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 flex flex-col">
                {currentDoc ? (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{currentDoc.title}</h2>
                                <div className="flex items-center gap-4 mt-1">
                                    <p className="text-sm text-slate-500">
                                        Last edited {formatDate(currentDoc.updatedAt)}
                                    </p>
                                    {isSaving && (
                                        <span className="text-xs text-blue-600 flex items-center gap-1">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Saving...
                                        </span>
                                    )}
                                    {typingUsers.size > 0 && (
                                        <span className="text-xs text-slate-500">
                                            {typingUsers.size} user{typingUsers.size > 1 ? 's' : ''} typing...
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700">
                                        {activeUsers.length} active
                                    </span>
                                </div>

                                <button
                                    onClick={() => setShowComments(!showComments)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    <span className="font-medium">Comments ({comments.length})</span>
                                </button>

                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                                    <Download className="w-5 h-5" />
                                    <span className="font-medium">Export</span>
                                </button>
                            </div>
                        </div>

                        {/* Editor Area */}
                        <div className="flex-1 flex overflow-hidden">
                            <div className="flex-1 p-8 overflow-y-auto">
                                <textarea
                                    value={content}
                                    onChange={handleContentChange}
                                    className="w-full min-h-full p-6 bg-white rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none font-mono text-sm transition-all"
                                    placeholder="Start typing your document here..."
                                    style={{ minHeight: '600px' }}
                                />
                            </div>

                            {/* Comments Panel */}
                            {showComments && (
                                <div className="w-96 bg-white border-l border-slate-200 flex flex-col">
                                    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5" />
                                            Comments
                                        </h3>
                                        <button
                                            onClick={() => setShowComments(false)}
                                            className="p-1 hover:bg-slate-100 rounded"
                                        >
                                            <X className="w-5 h-5 text-slate-500" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {comments?.map(comment => (
                                            <div key={comment.id} className="bg-slate-50 rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <div className="font-semibold text-slate-900 text-sm">
                                                            {comment.author?.name || 'Anonymous'}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {formatDate(comment.createdAt)}
                                                        </div>
                                                    </div>
                                                    {comment.authorId === userId && (
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="p-1 hover:bg-red-100 rounded text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-700">{comment.content}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-4 border-t border-slate-200">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                                                placeholder="Add a comment..."
                                                className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                            />
                                            <button
                                                onClick={handleAddComment}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <FileText className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">
                                No Document Selected
                            </h3>
                            <p className="text-slate-500">
                                Select a document from the sidebar or create a new one
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* New Document Modal */}
            {showNewDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Create New Document</h3>
                        <input
                            type="text"
                            value={newDocTitle}
                            onChange={(e) => setNewDocTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && createNewDocument()}
                            placeholder="Enter document title..."
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-4"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowNewDoc(false)}
                                className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createNewDocument}
                                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SolicitationEditor;