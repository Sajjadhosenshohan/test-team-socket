// ============================================
// FILE: helper/socketHelpers.ts - COMPLETE JSON VERSION
// ============================================
"use client"
import { Socket } from 'socket.io-client';

export interface Document {
    id: string;
    title: string;
     content?: string; 
    updatedAt: string;
    createdBy: string;
}

export interface Comment {
    id: string;
    content: string;
    authorId: string;
    docId: string;
    author?: {
        id: string;
        name: string;
        profileImage?: string;
    };
    createdAt: string;
    position?: number;
}

export interface ActiveUser {
    userId: string;
    userName: string;
    socketId?: string;
    joinedAt?: Date;
}

export interface SocketCallbacks {
     onDocumentLoaded: (content: string) => void; // ✅ Changed to string
    onDocumentUpdated: (content: string, editorId: string) => void; 
    onSaveSuccess: () => void;
    onSaveError?: (message: string) => void;
    onCommentAdded: (comment: Comment) => void;
    onCommentSynced: (tempId: string, actualComment: Comment) => void;
    onCommentFailed: (tempId: string) => void;
    onCommentDeleted: (commentId: string) => void;
    onActiveUsers: (users: ActiveUser[]) => void;
    onUserJoined: (userId: string, userName: string) => void;
    onUserLeft: (userId: string) => void;
    onUserTyping: (userId: string, isTyping: boolean, userName?: string) => void;
}

/**
 * ✅ Helper to safely convert content for Lexical editor
 * Handles JSON objects and strings properly
 */
export const processContentForEditor = (content: any): string => {
    if (!content) return '';
    
    // If it's already a string (Lexical JSON), return as-is
    if (typeof content === 'string') {
        return content;
    }
    
    // If it's an object (your structured JSON), convert to string
    if (typeof content === 'object') {
        try {
            return JSON.stringify(content);
        } catch (error) {
            console.error('[Helper] Failed to stringify content:', error);
            return '';
        }
    }
    
    return String(content);
};

/**
 * ✅ Helper to parse content from editor to send to backend
 */
export const processContentForBackend = (content: any): any => {
    if (!content) return {};
    
    // If it's already an object, return as-is
    if (typeof content === 'object') {
        return content;
    }
    
    // If it's a string, try to parse it
    if (typeof content === 'string') {
        try {
            return JSON.parse(content);
        } catch (error) {
            // If it fails to parse, return as-is (it's a Lexical JSON string)
            return content;
        }
    }
    
    return content;
};

export const setupSocketHandlers = (
      socket: Socket,
    currentDoc: Document | null,
    currentUser: any,
    callbacks: SocketCallbacks
) => {
    const {
        onDocumentLoaded,
        onDocumentUpdated,
        onSaveSuccess,
        onSaveError,
        onCommentAdded,
        onCommentSynced,
        onCommentFailed,
        onCommentDeleted,
        onActiveUsers,
        onUserJoined,
        onUserLeft,
        onUserTyping
    } = callbacks;

    socket.on('document-loaded', (data: { content?: string; updatedAt?: string }) => {
        console.log('[Socket] Document loaded, length:', data.content?.length);
        const content = data.content || '';
        onDocumentLoaded(content); // ✅ Pass string directly
    });

    socket.on('document-updated', (data: { content?: string; userId: string }) => {
        console.log('[Socket] Document update, length:', data.content?.length);
        const content = data.content || '';
        onDocumentUpdated(content, data.userId); // ✅ Pass string directly
    });

    socket.on('save-success', () => {
        console.log('[Socket] Save successful');
        onSaveSuccess();
    });

    socket.on('save-error', (data: { message: string }) => {
        console.error('[Socket] Save error:', data.message);
        if (onSaveError) {
            onSaveError(data.message);
        }
    });

    socket.on('comment-added', (comment: Comment) => {
        console.log('[Socket] Comment added:', comment.id);
        onCommentAdded(comment);
    });

    socket.on('comment-synced', (data: { tempId: string; actualComment: Comment }) => {
        console.log('[Socket] Comment synced:', data.tempId, '->', data.actualComment.id);
        onCommentSynced(data.tempId, data.actualComment);
    });

    socket.on('comment-failed', (data: { tempId: string }) => {
        console.error('[Socket] Comment failed:', data.tempId);
        onCommentFailed(data.tempId);
    });

    socket.on('comment-deleted', (data: { commentId: string }) => {
        console.log('[Socket] Comment deleted:', data.commentId);
        onCommentDeleted(data.commentId);
    });

    socket.on('active-users', (data: { users: ActiveUser[] }) => {
        console.log('[Socket] Active users:', data.users.length);
        onActiveUsers(data.users);
    });

    socket.on('user-joined', (data: { userId: string; userName: string }) => {
        console.log('[Socket] User joined:', data.userName);
        onUserJoined(data.userId, data.userName);
    });

    socket.on('user-left', (data: { userId: string }) => {
        console.log('[Socket] User left:', data.userId);
        onUserLeft(data.userId);
    });

    socket.on('user-typing', (data: { userId: string; userName?: string; isTyping: boolean }) => {
        console.log('[Socket] User typing:', data.userName || data.userId, data.isTyping);
        onUserTyping(data.userId, data.isTyping, data.userName);
    });

    socket.on('error', (data: { message: string; code?: string }) => {
        console.error('[Socket] Error:', data.message, data.code);
        if (data.code === 'ACCESS_DENIED') {
            alert('Access denied. You must be a team member to access this document.');
        }
    });

    socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error);
    });

    socket.on('reconnect_attempt', (attempt) => {
        console.log('[Socket] Reconnection attempt:', attempt);
    });

    socket.on('reconnect', () => {
        console.log('[Socket] Reconnected successfully');
    });
};

export const removeSocketHandlers = (socket: Socket) => {
    socket.off('document-loaded');
    socket.off('document-updated');
    socket.off('save-success');
    socket.off('save-error');
    socket.off('comment-added');
    socket.off('comment-synced');
    socket.off('comment-failed');
    socket.off('comment-deleted');
    socket.off('active-users');
    socket.off('user-joined');
    socket.off('user-left');
    socket.off('user-typing');
    socket.off('error');
    socket.off('connect_error');
    socket.off('reconnect_attempt');
    socket.off('reconnect');
};

export const joinDocumentRoom = (socket: Socket, docId: string, userId: string, userName: string) => {
    console.log('[Socket] Joining document:', docId, 'as', userName);
    socket.emit('join-document', {
        docId,
        userId,
        userName
    });
};

export const leaveDocumentRoom = (socket: Socket, docId: string, userId: string) => {
    console.log('[Socket] Leaving document:', docId);
    socket.emit('leave-document', { docId, userId });
};

export const emitEditDocument = (socket: Socket, docId: string, content: string, userId: string) => {
    console.log('[Socket] Emitting edit-document, length:', content.length);
    socket.emit('edit-document', {
        docId,
        content, // ✅ Send as string
        userId
    });
};

export const emitAddComment = (socket: Socket, docId: string, content: string, userId: string) => {
    console.log('[Socket] Emitting add-comment');
    socket.emit('add-comment', {
        docId,
        content,
        authorId: userId,
        position: null
    });
};

export const emitDeleteComment = (socket: Socket, docId: string, commentId: string, userId: string) => {
    console.log('[Socket] Emitting delete-comment:', commentId);
    socket.emit('delete-comment', {
        commentId,
        docId,
        userId
    });
};

export const emitTypingStart = (socket: Socket, docId: string, userId: string, userName: string) => {
    socket.emit('typing-start', {
        docId,
        userId,
        userName
    });
};

export const emitTypingStop = (socket: Socket, docId: string, userId: string) => {
    socket.emit('typing-stop', {
        docId,
        userId
    });
};