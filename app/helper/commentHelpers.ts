// helper/commentHelpers.ts
import { Comment } from './socketHelpers';

export const createTempComment = (content: string, userId: string, userName: string): Comment => {
    return {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content,
        authorId: userId,
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
        comment.id === tempId ? actualComment : comment
    );
};

export const handleCommentAdded = (comments: Comment[], newComment: Comment): Comment[] => {
    // Check if comment already exists (prevent duplicates)
    const exists = comments.some(comment => comment.id === newComment.id);
    if (exists) {
        return comments;
    }
    
    // Replace temp comment if exists, otherwise add new
    const existingIndex = comments.findIndex(comment => comment.id === newComment.id);
    if (existingIndex !== -1) {
        const newComments = [...comments];
        newComments[existingIndex] = newComment;
        return newComments;
    }
    
    return [newComment, ...comments];
};