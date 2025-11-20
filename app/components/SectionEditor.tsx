// "use client";

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useEditor, EditorContent, Editor } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import Underline from '@tiptap/extension-underline';
// import TextAlign from '@tiptap/extension-text-align';
// import Color from '@tiptap/extension-color';
// import { TextStyle } from '@tiptap/extension-text-style';
// import { ChevronDown, ChevronRight } from 'lucide-react';
// import { Socket } from 'socket.io-client';

// import TiptapToolbar from './TiptapToolbar';
// import { emitTypingStart, emitTypingStop } from '../helper/socketHelpers';

// interface SectionEditorProps {
//     title: string;
//     content: any;
//     onContentChange: (key: string, content: any) => void;
//     sectionKey: string;
//     isExpanded: boolean;
//     onToggle: () => void;
//     socket: Socket | null;
//     currentDoc: any;
//     userId: string;
//     userName: string;
// }

//  const SectionEditor = React.memo(({
//     title,
//     content,
//     onContentChange,
//     sectionKey,
//     isExpanded,
//     onToggle,
//     socket,
//     currentDoc,
//     userId,
//     userName
// }: SectionEditorProps) => {
//     const [localContent, setLocalContent] = useState(content || '');
//     const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//     const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//     const isLocalEditRef = useRef(false);

//     const editor = useEditor({
//         extensions: [
//             StarterKit,
//             Underline,
//             TextAlign.configure({
//                 types: ['heading', 'paragraph'],
//             }),
//             Color.configure({ types: [TextStyle.name] }),
//             TextStyle,
//         ],
//         immediatelyRender: false,
//         content: typeof localContent === 'string' ? localContent : JSON.stringify(localContent),
//         onUpdate: ({ editor }) => {
//             const html = editor.getHTML();
//             setLocalContent(html);
//             isLocalEditRef.current = true;

//             // Emit typing indicator
//             if (socket && currentDoc && userId) {
//                 emitTypingStart(socket, currentDoc.id, userId, userName);

//                 if (typingTimeoutRef.current) {
//                     clearTimeout(typingTimeoutRef.current);
//                 }

//                 typingTimeoutRef.current = setTimeout(() => {
//                     emitTypingStop(socket, currentDoc.id, userId);
//                     isLocalEditRef.current = false;
//                 }, 800);
//             }

//             // Immediate content update for fast real-time response
//             if (saveTimeoutRef.current) {
//                 clearTimeout(saveTimeoutRef.current);
//             }

//             saveTimeoutRef.current = setTimeout(() => {
//                 onContentChange(sectionKey, html);
//             }, 200);
//         },
//     });

//     // Update editor when content changes externally
//     useEffect(() => {
//         if (!editor) return;

//         if (isLocalEditRef.current) {
//             return;
//         }

//         const newContent = typeof content === 'string' ? content : JSON.stringify(content);
//         const currentContent = editor.getHTML();

//         if (newContent !== currentContent && newContent !== localContent) {
//             editor.commands.setContent(newContent, false);
//             setLocalContent(newContent);
//         }
//     }, [content, editor, localContent]);

//     useEffect(() => {
//         return () => {
//             if (typingTimeoutRef.current) {
//                 clearTimeout(typingTimeoutRef.current);
//             }
//             if (saveTimeoutRef.current) {
//                 clearTimeout(saveTimeoutRef.current);
//             }
//         };
//     }, []);

//     return (
//         <div className="rounded-lg mb-4 bg-white shadow-sm">
//             <button
//                 onClick={onToggle}
//                 className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-lg"
//                 type="button"
//             >
//                 <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
//                 {isExpanded ? (
//                     <ChevronDown className="w-5 h-5 text-slate-500" />
//                 ) : (
//                     <ChevronRight className="w-5 h-5 text-slate-500" />
//                 )}
//             </button>

//             {isExpanded && editor && (
//                 <div className="border-t border-slate-200">
//                     <TiptapToolbar editor={editor} />
//                     <EditorContent
//                         editor={editor}
//                         className="prose prose-slate max-w-none p-6 min-h-[200px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:border-none"
//                     />
//                 </div>
//             )}
//         </div>
//     );
// });

// export default SectionEditor;

"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Socket } from 'socket.io-client';

import TiptapToolbar from './TiptapToolbar';
import { emitTypingStart, emitTypingStop, emitEditDocument } from '../helper/socketHelpers';

interface SectionEditorProps {
    title: string;
    content: any;
    onContentChange: (key: string, content: any) => void;
    sectionKey: string;
    isExpanded: boolean;
    onToggle: () => void;
    socket: Socket | null;
    currentDoc: any;
    userId: string;
    userName: string;
    hasUnsavedChanges: boolean;
    onUnsavedChange: (hasChanges: boolean) => void;
}

export const SectionEditor = React.memo(({
    title,
    content,
    onContentChange,
    sectionKey,
    isExpanded,
    onToggle,
    socket,
    currentDoc,
    userId,
    userName,
    hasUnsavedChanges,
    onUnsavedChange
}: SectionEditorProps) => {
    const [localContent, setLocalContent] = useState(content || '');
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isLocalEditRef = useRef(false);
    const lastSavedContentRef = useRef(content || '');

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Color.configure({ types: [TextStyle.name] }),
            TextStyle,
        ],
        immediatelyRender: false,
        content: typeof localContent === 'string' ? localContent : JSON.stringify(localContent),
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            setLocalContent(html);
            isLocalEditRef.current = true;

            // Mark as having unsaved changes
            if (html !== lastSavedContentRef.current) {
                onUnsavedChange(true);
            }

            // Emit typing indicator
            if (socket && currentDoc && userId) {
                emitTypingStart(socket, currentDoc.id, userId, userName);

                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

                typingTimeoutRef.current = setTimeout(() => {
                    emitTypingStop(socket, currentDoc.id, userId);
                }, 800);
            }

            // Immediate real-time update (no auto-save)
            onContentChange(sectionKey, html);
            
            // Emit real-time edit (without saving to DB)
            if (socket && currentDoc && userId) {
                const currentSections = JSON.parse(JSON.stringify(currentDoc.content || {}));
                currentSections[sectionKey] = html;
                
                emitEditDocument(socket, currentDoc.id, currentSections, userId);
            }
        },
    });

    // Update editor when content changes externally
    useEffect(() => {
        if (!editor) return;

        if (isLocalEditRef.current) {
            isLocalEditRef.current = false;
            return;
        }

        const newContent = typeof content === 'string' ? content : JSON.stringify(content);
        const currentContent = editor.getHTML();

        if (newContent !== currentContent && newContent !== localContent) {
            editor.commands.setContent(newContent, false);
            setLocalContent(newContent);
            lastSavedContentRef.current = newContent;
        }
    }, [content, editor, localContent]);

    // Reset unsaved changes when document is saved
    useEffect(() => {
        if (!hasUnsavedChanges) {
            lastSavedContentRef.current = localContent;
        }
    }, [hasUnsavedChanges, localContent]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="rounded-lg mb-4 bg-white shadow-sm">
            <button
                onClick={onToggle}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-t-lg"
                type="button"
            >
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
                    {hasUnsavedChanges && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            Unsaved
                        </span>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                )}
            </button>

            {isExpanded && editor && (
                <div className="border-t border-slate-200">
                    <TiptapToolbar editor={editor} />
                    <EditorContent
                        editor={editor}
                        className="prose prose-slate max-w-none p-6 min-h-[200px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:border-none"
                    />
                </div>
            )}
        </div>
    );
});

SectionEditor.displayName = 'SectionEditor';

export default SectionEditor;