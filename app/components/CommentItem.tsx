"use client";

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Comment } from '../helper/socketHelpers';
import { isTempComment } from '../helper/commentHelpers';
import { formatDate } from '../helper/dateHelpers';

interface CommentItemProps {
    comment: Comment;
    userId: string | undefined;
    onDelete: (commentId: string) => void;
}

 const CommentItem = React.memo(({ comment, userId, onDelete }: CommentItemProps) => {
    const isTemp = isTempComment(comment.id);
    const isAuthor = comment.authorId === userId;

    return (
        <div
            className={`rounded-lg p-4 transition-all ${isTemp
                ? 'bg-yellow-50 border border-yellow-200 opacity-80'
                : 'bg-slate-50'
                }`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        {comment.author?.name || 'Anonymous'}
                        {isTemp && (
                            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                                Saving...
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                        {formatDate(comment.createdAt)}
                    </div>
                </div>
                {isAuthor && (
                    <button
                        onClick={() => onDelete(comment.id)}
                        disabled={isTemp}
                        className={`p-1 rounded transition-colors ml-2 flex-shrink-0 ${isTemp
                            ? 'text-slate-400 cursor-not-allowed'
                            : 'hover:bg-red-100 text-red-600 hover:text-red-700'
                            }`}
                        title="Delete comment"
                        type="button"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
            <p className="text-sm text-slate-700 break-words">{comment.content}</p>
        </div>
    );
});

CommentItem.displayName = 'CommentItem';

export default CommentItem;