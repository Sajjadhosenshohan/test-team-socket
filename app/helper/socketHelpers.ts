// helper/socketHelpers.ts
import { Socket } from 'socket.io-client';

export interface Document {
    id: string;
    title: string;
    content?: string;
    updatedAt: string;
    createdBy: string;
    teamId: string;
}

export interface Comment {
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

export interface ActiveUser {
    userId: string;
    userName: string;
}

// Socket event handlers callback interface
export interface SocketCallbacks {
    onDocumentLoaded: (content: string) => void;
    onDocumentUpdated: (content: string, editorId: string) => void;
    onSaveSuccess: () => void;
    onCommentAdded: (comment: Comment) => void;
    onCommentSynced: (tempId: string, actualComment: Comment) => void;
    onCommentFailed: (tempId: string) => void;
    onCommentDeleted: (commentId: string) => void;
    onActiveUsers: (users: ActiveUser[]) => void;
    onUserJoined: (userId: string, userName: string) => void;
    onUserLeft: (userId: string) => void;
    onUserTyping: (userId: string, isTyping: boolean) => void;
}

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
        onCommentAdded,
        onCommentSynced,
        onCommentFailed,
        onCommentDeleted,
        onActiveUsers,
        onUserJoined,
        onUserLeft,
        onUserTyping
    } = callbacks;

    // Document loaded
    socket.on('document-loaded', (data: { content: string }) => {
        onDocumentLoaded(data.content || '');
    });

    // Document updated
    socket.on('document-updated', (data: { content: string; userId: string }) => {
        onDocumentUpdated(data.content, data.userId);
    });

    // Save success
    socket.on('save-success', () => {
        onSaveSuccess();
    });

    // Comments
    socket.on('comment-added', (comment: Comment) => {
        onCommentAdded(comment);
    });

    socket.on('comment-synced', (data: { tempId: string; actualComment: Comment }) => {
        onCommentSynced(data.tempId, data.actualComment);
    });

    socket.on('comment-failed', (data: { tempId: string }) => {
        onCommentFailed(data.tempId);
    });

    socket.on('comment-deleted', (data: { commentId: string }) => {
        onCommentDeleted(data.commentId);
    });

    // Active users
    socket.on('active-users', (data: { users: ActiveUser[] }) => {
        onActiveUsers(data.users);
    });

    socket.on('user-joined', (data: { userId: string; userName: string }) => {
        onUserJoined(data.userId, data.userName);
    });

    socket.on('user-left', (data: { userId: string }) => {
        onUserLeft(data.userId);
    });

    // Typing indicators
    socket.on('user-typing', (data: { userId: string; isTyping: boolean }) => {
        onUserTyping(data.userId, data.isTyping);
    });
};

export const removeSocketHandlers = (socket: Socket) => {
    socket.off('document-loaded');
    socket.off('document-updated');
    socket.off('save-success');
    socket.off('comment-added');
    socket.off('comment-synced');
    socket.off('comment-failed');
    socket.off('comment-deleted');
    socket.off('active-users');
    socket.off('user-joined');
    socket.off('user-left');
    socket.off('user-typing');
};

export const joinDocumentRoom = (socket: Socket, docId: string, userId: string, userName: string) => {
    socket.emit('join-document', {
        docId,
        userId,
        userName
    });
};

export const leaveDocumentRoom = (socket: Socket, docId: string, userId: string) => {
    socket.emit('leave-document', { docId, userId });
};

// export const emitEditDocument = (socket: Socket, docId: string, content: string, userId: string) => {
//     socket.emit('edit-document', {
//         docId,
//         content,
//         userId
//     });
// };

export const emitAddComment = (socket: Socket, docId: string, content: string, userId: string) => {
    socket.emit('add-comment', {
        docId,
        content,
        authorId: userId,
        position: null
    });
};

export const emitDeleteComment = (socket: Socket, docId: string, commentId: string, userId: string) => {
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

export const emitEditDocumentField = (
  socket: Socket,
  docId: string,
  path: string[],
  value: any,
  userId: string
) => {
  socket.emit('edit-document-field', { docId, path, value, userId });
};

// Add new function for manual saving
export const emitSaveDocument = (
  socket: Socket | null,
  docId: string,
  content: any,
  userId: string
) => {
  if (!socket) {
    console.error('❌ Socket not available for saving document');
    return;
  }

  console.log('💾 Emitting manual save document:', docId);
  socket.emit('save-document', {
    docId,
    content,
    userId
  });
};

// Update existing emitEditDocument to remove auto-save
export const emitEditDocument = (
  socket: Socket | null,
  docId: string,
  content: any,
  userId: string
) => {
  if (!socket) {
    console.error('❌ Socket not available for editing document');
    return;
  }

  console.log('📝 Emitting document edit (real-time only):', docId);
  socket.emit('edit-document', {
    docId,
    content,
    userId
  });
};