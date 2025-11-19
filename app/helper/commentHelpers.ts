// ============================================
// FILE: helper/commentHelpers.ts - COMPLETE VERSION
// ============================================
import { Comment } from './socketHelpers';

export const createTempComment = (content: string, userId: string, userName: string, docId: string): Comment => {
    return {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content,
        authorId: userId,
        docId,
        author: {
            id: userId,
            name: userName,
        },
        createdAt: new Date().toISOString(),
    };
};

export const isTempComment = (commentId: string): boolean => {
    return commentId.startsWith('temp-');
};

export const addCommentOptimistically = (comments: Comment[], newComment: Comment): Comment[] => {
    return [newComment, ...comments];
};

export const removeCommentOptimistically = (comments: Comment[], commentId: string): Comment[] => {
    return comments.filter(comment => comment.id !== commentId);
};

export const updateCommentOnSync = (comments: Comment[], tempId: string, actualComment: Comment): Comment[] => {
    return comments.map(comment => 
        comment.id === tempId ? { ...actualComment, author: comment.author } : comment
    );
};

export const handleCommentAdded = (comments: Comment[], newComment: Comment): Comment[] => {
    // Check if comment already exists (prevent duplicates)
    const exists = comments.some(comment => comment.id === newComment.id);
    if (exists) {
        return comments;
    }
    
    // Add new comment at the beginning
    return [newComment, ...comments];
};
