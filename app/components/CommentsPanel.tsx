"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { Comment } from '../helper/socketHelpers';
import CommentItem from './CommentItem';

interface CommentsPanelProps {
    comments: Comment[];
    userId: string | undefined;
    newComment: string;
    onNewCommentChange: (value: string) => void;
    onAddComment: () => void;
    onDeleteComment: (commentId: string) => void;
    isLoading: boolean;
    currentUser: any;
    onClose: () => void;
}

 const CommentsPanel = React.memo(({
    comments,
    userId,
    newComment,
    onNewCommentChange,
    onAddComment,
    onDeleteComment,
    isLoading,
    currentUser,
    onClose
}: CommentsPanelProps) => {
    const commentsEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new comments arrive
    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onAddComment();
        }
    }, [onAddComment]);

    return (
        <div className="w-96 bg-white border-l border-slate-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Comments ({comments.length})
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                    title="Close comments"
                    type="button"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="font-medium">No comments yet</p>
                        <p className="text-sm">Start a conversation</p>
                    </div>
                ) : (
                    <>
                        {comments.map(comment => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                userId={userId}
                                onDelete={onDeleteComment}
                            />
                        ))}
                        <div ref={commentsEndRef} />
                    </>
                )}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-slate-200 flex-shrink-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => onNewCommentChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a comment..."
                        className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        disabled={!currentUser}
                        maxLength={1000}
                    />
                    <button
                        onClick={onAddComment}
                        disabled={!newComment.trim() || !currentUser}
                        className={`px-4 py-2 rounded-lg transition-colors flex-shrink-0 ${!newComment.trim() || !currentUser
                            ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        title="Send comment"
                        type="button"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                {newComment.length > 0 && (
                    <p className="text-xs text-slate-500 mt-1">{newComment.length}/1000</p>
                )}
            </div>
        </div>
    );
});

CommentsPanel.displayName = 'CommentsPanel';

export default CommentsPanel;