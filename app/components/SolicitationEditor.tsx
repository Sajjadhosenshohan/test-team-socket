// "use client";

// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { Send, Users, MessageSquare, FileText, X, Trash2, Download, Plus, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
// import { io, Socket } from 'socket.io-client';

// // Tiptap imports
// import { useEditor, EditorContent, Editor } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import Underline from '@tiptap/extension-underline';
// import TextAlign from '@tiptap/extension-text-align';
// import Color from '@tiptap/extension-color';
// import { TextStyle } from '@tiptap/extension-text-style';

// // Import server actions
// import { createSolicitationDoc, getDocComments, getTeamDocs, getUserInfo, getSolicitationDoc } from '../actions/solicitation.actions';
// import {
//     ActiveUser,
//     Comment,
//     Document,
//     emitAddComment,
//     emitDeleteComment,
//     emitEditDocument,
//     emitTypingStart,
//     emitTypingStop,
//     joinDocumentRoom,
//     leaveDocumentRoom,
// } from '../helper/socketHelpers';
// import {
//     handleCommentAdded as handleCommentAddedHelper,
//     isTempComment,
//     removeCommentOptimistically,
//     updateCommentOnSync
// } from '../helper/commentHelpers';
// import { createNewDocument } from '../helper/documentHelpers';
// import { formatDate } from '../helper/dateHelpers';

// // Tiptap Toolbar Component with proper typing
// interface TiptapToolbarProps {
//     editor: Editor | null;
// }

// function TiptapToolbar({ editor }: TiptapToolbarProps) {
//     if (!editor) {
//         return null;
//     }

//     return (
//         <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 flex-wrap">
//             {/* Text Formatting */}
//             <button
//                 onClick={() => editor.chain().focus().toggleBold().run()}
//                 className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive('bold') ? 'bg-blue-100' : ''}`}
//                 title="Bold"
//                 type="button"
//             >
//                 <span className="font-bold">B</span>
//             </button>
//             <button
//                 onClick={() => editor.chain().focus().toggleItalic().run()}
//                 className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive('italic') ? 'bg-blue-100' : ''}`}
//                 title="Italic"
//                 type="button"
//             >
//                 <span className="italic">I</span>
//             </button>
//             <button
//                 onClick={() => editor.chain().focus().toggleUnderline().run()}
//                 className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive('underline') ? 'bg-blue-100' : ''}`}
//                 title="Underline"
//                 type="button"
//             >
//                 <span className="underline">U</span>
//             </button>

//             <div className="w-px h-6 bg-slate-300 mx-1"></div>

//             {/* Headings */}
//             <button
//                 onClick={() => editor.chain().focus().setParagraph().run()}
//                 className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive('paragraph') ? 'bg-blue-100' : ''}`}
//                 title="Normal Text"
//                 type="button"
//             >
//                 P
//             </button>
//             <button
//                 onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
//                 className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100' : ''}`}
//                 title="Heading 1"
//                 type="button"
//             >
//                 H1
//             </button>
//             <button
//                 onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
//                 className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100' : ''}`}
//                 title="Heading 2"
//                 type="button"
//             >
//                 H2
//             </button>

//             <div className="w-px h-6 bg-slate-300 mx-1"></div>

//             {/* Lists */}
//             <button
//                 onClick={() => editor.chain().focus().toggleBulletList().run()}
//                 className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-blue-100' : ''}`}
//                 title="Bullet List"
//                 type="button"
//             >
//                 • List
//             </button>
//             <button
//                 onClick={() => editor.chain().focus().toggleOrderedList().run()}
//                 className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-blue-100' : ''}`}
//                 title="Numbered List"
//                 type="button"
//             >
//                 1. List
//             </button>

//             <div className="w-px h-6 bg-slate-300 mx-1"></div>

//             {/* Alignment */}
//             <button
//                 onClick={() => editor.chain().focus().setTextAlign('left').run()}
//                 className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100' : ''}`}
//                 title="Align Left"
//                 type="button"
//             >
//                 ←
//             </button>
//             <button
//                 onClick={() => editor.chain().focus().setTextAlign('center').run()}
//                 className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100' : ''}`}
//                 title="Align Center"
//                 type="button"
//             >
//                 ↔
//             </button>
//             <button
//                 onClick={() => editor.chain().focus().setTextAlign('right').run()}
//                 className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100' : ''}`}
//                 title="Align Right"
//                 type="button"
//             >
//                 →
//             </button>

//             <div className="w-px h-6 bg-slate-300 mx-1"></div>

//             {/* Text Color */}
//             <div className="flex items-center gap-2">
//                 <label className="text-xs text-slate-600">Color:</label>
//                 <input
//                     type="color"
//                     onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
//                     className="w-8 h-8 rounded cursor-pointer"
//                     title="Text Color"
//                 />
//             </div>

//             {/* Preset Colors */}
//             <div className="flex items-center gap-1 ml-2">
//                 {['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map(color => (
//                     <button
//                         key={color}
//                         onClick={() => editor.chain().focus().setColor(color).run()}
//                         className="w-6 h-6 rounded border-2 border-slate-300 hover:border-slate-400 transition-colors"
//                         style={{ backgroundColor: color }}
//                         title={`Apply ${color}`}
//                         type="button"
//                     />
//                 ))}
//             </div>
//         </div>
//     );
// }

// // Section Editor Component with Tiptap
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

// const SectionEditor = React.memo(({
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

// SectionEditor.displayName = 'SectionEditor';

// // Object Section Editor for nested objects
// interface ObjectSectionEditorProps {
//     title: string;
//     content: any;
//     onContentChange: (key: string, content: any) => void;
//     sectionKey: string;
//     isExpanded: boolean;
//     onToggle: () => void;
// }

// const ObjectSectionEditor = React.memo(({
//     title,
//     content,
//     onContentChange,
//     sectionKey,
//     isExpanded,
//     onToggle
// }: ObjectSectionEditorProps) => {
//     const [localContent, setLocalContent] = useState(content || {});

//     const handleFieldChange = useCallback((field: string, value: string) => {
//         const updatedContent = {
//             ...localContent,
//             [field]: value
//         };
//         setLocalContent(updatedContent);
//         onContentChange(sectionKey, updatedContent);
//     }, [localContent, onContentChange, sectionKey]);

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

//             {isExpanded && (
//                 <div className="border-t border-slate-200 p-6 space-y-4">
//                     {Object.keys(localContent).map(field => (
//                         <div key={field} className="space-y-2">
//                             <label className="block text-sm font-medium text-slate-700 capitalize">
//                                 {field.replace(/_/g, ' ')}
//                             </label>
//                             <input
//                                 type="text"
//                                 value={localContent[field] || ''}
//                                 onChange={(e) => handleFieldChange(field, e.target.value)}
//                                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
//                                 placeholder={`Enter ${field.replace(/_/g, ' ')}...`}
//                             />
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// });

// ObjectSectionEditor.displayName = 'ObjectSectionEditor';

// // Comment Item Component
// interface CommentItemProps {
//     comment: Comment;
//     userId: string | undefined;
//     onDelete: (commentId: string) => void;
// }

// const CommentItem = React.memo(({ comment, userId, onDelete }: CommentItemProps) => {
//     const isTemp = isTempComment(comment.id);
//     const isAuthor = comment.authorId === userId;

//     return (
//         <div
//             className={`rounded-lg p-4 transition-all ${isTemp
//                 ? 'bg-yellow-50 border border-yellow-200 opacity-80'
//                 : 'bg-slate-50'
//                 }`}
//         >
//             <div className="flex items-start justify-between mb-2">
//                 <div className="flex-1">
//                     <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
//                         {comment.author?.name || 'Anonymous'}
//                         {isTemp && (
//                             <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
//                                 Saving...
//                             </span>
//                         )}
//                     </div>
//                     <div className="text-xs text-slate-500 mt-0.5">
//                         {formatDate(comment.createdAt)}
//                     </div>
//                 </div>
//                 {isAuthor && (
//                     <button
//                         onClick={() => onDelete(comment.id)}
//                         disabled={isTemp}
//                         className={`p-1 rounded transition-colors ml-2 flex-shrink-0 ${isTemp
//                             ? 'text-slate-400 cursor-not-allowed'
//                             : 'hover:bg-red-100 text-red-600 hover:text-red-700'
//                             }`}
//                         title="Delete comment"
//                         type="button"
//                     >
//                         <Trash2 className="w-4 h-4" />
//                     </button>
//                 )}
//             </div>
//             <p className="text-sm text-slate-700 break-words">{comment.content}</p>
//         </div>
//     );
// });

// CommentItem.displayName = 'CommentItem';

// // Comments Panel Component
// interface CommentsPanelProps {
//     comments: Comment[];
//     userId: string | undefined;
//     newComment: string;
//     onNewCommentChange: (value: string) => void;
//     onAddComment: () => void;
//     onDeleteComment: (commentId: string) => void;
//     isLoading: boolean;
//     currentUser: any;
//     onClose: () => void;
// }

// const CommentsPanel = React.memo(({
//     comments,
//     userId,
//     newComment,
//     onNewCommentChange,
//     onAddComment,
//     onDeleteComment,
//     isLoading,
//     currentUser,
//     onClose
// }: CommentsPanelProps) => {
//     const commentsEndRef = useRef<HTMLDivElement>(null);

//     // Auto-scroll to bottom when new comments arrive
//     useEffect(() => {
//         commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [comments]);

//     const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
//         if (e.key === 'Enter' && !e.shiftKey) {
//             e.preventDefault();
//             onAddComment();
//         }
//     }, [onAddComment]);

//     return (
//         <div className="w-96 bg-white border-l border-slate-200 flex flex-col">
//             {/* Header */}
//             <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
//                 <h3 className="font-bold text-slate-900 flex items-center gap-2">
//                     <MessageSquare className="w-5 h-5" />
//                     Comments ({comments.length})
//                 </h3>
//                 <button
//                     onClick={onClose}
//                     className="p-1 hover:bg-slate-100 rounded transition-colors"
//                     title="Close comments"
//                     type="button"
//                 >
//                     <X className="w-5 h-5 text-slate-500" />
//                 </button>
//             </div>

//             {/* Comments List */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-4">
//                 {isLoading ? (
//                     <div className="flex items-center justify-center py-12">
//                         <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//                     </div>
//                 ) : comments.length === 0 ? (
//                     <div className="text-center py-12 text-slate-500">
//                         <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
//                         <p className="font-medium">No comments yet</p>
//                         <p className="text-sm">Start a conversation</p>
//                     </div>
//                 ) : (
//                     <>
//                         {comments.map(comment => (
//                             <CommentItem
//                                 key={comment.id}
//                                 comment={comment}
//                                 userId={userId}
//                                 onDelete={onDeleteComment}
//                             />
//                         ))}
//                         <div ref={commentsEndRef} />
//                     </>
//                 )}
//             </div>

//             {/* Comment Input */}
//             <div className="p-4 border-t border-slate-200 flex-shrink-0">
//                 <div className="flex gap-2">
//                     <input
//                         type="text"
//                         value={newComment}
//                         onChange={(e) => onNewCommentChange(e.target.value)}
//                         onKeyPress={handleKeyPress}
//                         placeholder="Add a comment..."
//                         className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
//                         disabled={!currentUser}
//                         maxLength={1000}
//                     />
//                     <button
//                         onClick={onAddComment}
//                         disabled={!newComment.trim() || !currentUser}
//                         className={`px-4 py-2 rounded-lg transition-colors flex-shrink-0 ${!newComment.trim() || !currentUser
//                             ? 'bg-slate-300 cursor-not-allowed text-slate-500'
//                             : 'bg-blue-600 hover:bg-blue-700 text-white'
//                             }`}
//                         title="Send comment"
//                         type="button"
//                     >
//                         <Send className="w-5 h-5" />
//                     </button>
//                 </div>
//                 {newComment.length > 0 && (
//                     <p className="text-xs text-slate-500 mt-1">{newComment.length}/1000</p>
//                 )}
//             </div>
//         </div>
//     );
// });

// CommentsPanel.displayName = 'CommentsPanel';

// // Main Component
// const SolicitationEditor = () => {
//     // State Management
//     const [documents, setDocuments] = useState<any[]>([]);
//     const [currentDoc, setCurrentDoc] = useState<any>(null);
//     const [comments, setComments] = useState<Comment[]>([]);
//     const [newComment, setNewComment] = useState('');
//     const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
//     const [showComments, setShowComments] = useState(false);
//     const [showNewDoc, setShowNewDoc] = useState(false);
//     const [newDocTitle, setNewDocTitle] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [isSaving, setIsSaving] = useState(false);
//     const [isLoadingDoc, setIsLoadingDoc] = useState(false);
//     const [isLoadingComments, setIsLoadingComments] = useState(false);
//     const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
//     const [currentUser, setCurrentUser] = useState<any>(null);
//     const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
//     const [docSections, setDocSections] = useState<any>(null);

//     const userId = currentUser?.id;
//     const userName = currentUser?.firstName;

//     const socketRef = useRef<Socket | null>(null);
//     const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//     const loadedDocs = useRef<Set<string>>(new Set());
//     const isJoiningDoc = useRef(false);

//     // Memoized values
//     const sortedDocuments = useMemo(() => {
//         return [...documents].sort((a, b) =>
//             new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
//         );
//     }, [documents]);

//     const sortedComments = useMemo(() => {
//         return [...comments].sort((a, b) =>
//             new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
//         );
//     }, [comments]);

//     const typingUsersList = useMemo(() => {
//         return Array.from(typingUsers);
//     }, [typingUsers]);

//     // Content change handler
//     const handleSectionContentChange = useCallback((sectionKey: string, content: any) => {
//         if (!currentDoc || !socketRef.current || !userId) return;

//         setDocSections((prevSections: any) => {
//             const updatedContent = {
//                 ...prevSections,
//                 [sectionKey]: content
//             };

//             setIsSaving(true);

//             if (saveTimeoutRef.current) {
//                 clearTimeout(saveTimeoutRef.current);
//             }

//             saveTimeoutRef.current = setTimeout(() => {
//                 if (socketRef.current && currentDoc && userId) {
//                     console.log(`📝 Emitting document update for section: ${sectionKey}`);
//                     emitEditDocument(socketRef.current, currentDoc.id, updatedContent, userId);
//                 }
//             }, 200);

//             return updatedContent;
//         });
//     }, [currentDoc, userId]);

//     // Toggle section
//     const toggleSection = useCallback((sectionKey: string) => {
//         setExpandedSections(prev => {
//             const newSet = new Set(prev);
//             if (newSet.has(sectionKey)) {
//                 newSet.delete(sectionKey);
//             } else {
//                 newSet.add(sectionKey);
//             }
//             return newSet;
//         });
//     }, []);

//     // Initialize document sections
//     useEffect(() => {
//         if (currentDoc?.content) {
//             console.log('📄 Initializing document sections:', currentDoc.content);
//             setDocSections(currentDoc.content);

//             const firstSection = Object.keys(currentDoc.content)[0];
//             if (firstSection) {
//                 setExpandedSections(new Set([firstSection]));
//             }
//         }
//     }, [currentDoc]);

//     // Initialize Socket
//     useEffect(() => {
//         const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5004';

//         socketRef.current = io(SOCKET_URL, {
//             transports: ['websocket'],
//             reconnection: true,
//             reconnectionAttempts: 5,
//             reconnectionDelay: 1000,
//         });

//         socketRef.current.on('connect', () => {
//             console.log('✅ Socket connected');
//         });

//         socketRef.current.on('error', (error: any) => {
//             console.error('❌ Socket error:', error);
//         });

//         socketRef.current.on('disconnect', () => {
//             console.log('❌ Socket disconnected');
//         });

//         return () => {
//             if (socketRef.current) {
//                 socketRef.current.disconnect();
//             }
//             if (saveTimeoutRef.current) {
//                 clearTimeout(saveTimeoutRef.current);
//             }
//         };
//     }, []);

//     // Load initial data
//     useEffect(() => {
//         getCurrentUser();
//         loadDocuments();
//     }, []);

//     const getCurrentUser = async () => {
//         const user = await getUserInfo();
//         setCurrentUser(user?.result);
//     };

//     // Socket handlers for document and comments
//     useEffect(() => {
//         if (!currentDoc || !socketRef.current || !currentUser || isJoiningDoc.current) return;

//         isJoiningDoc.current = true;
//         const socket = socketRef.current;
//         const docId = currentDoc.id;

//         console.log(`🔄 Setting up socket handlers for document: ${docId}`);

//         joinDocumentRoom(socket, docId, currentUser.id, currentUser.firstName);

//         // Document handlers
//         const handleDocumentLoaded = (data: { content: any; updatedAt: string }) => {
//             console.log(`📄 Document loaded for ${docId}`, data);
//             if (!loadedDocs.current.has(docId)) {
//                 try {
//                     setDocSections(data.content);
//                     console.log('✅ Document sections loaded');
//                 } catch (error) {
//                     console.error('Failed to process document content:', error);
//                 }
//                 loadedDocs.current.add(docId);
//                 loadComments(docId);
//             }
//             isJoiningDoc.current = false;
//         };

//         const handleDocumentUpdated = (data: { content: any; userId: string; timestamp: Date }) => {
//             console.log(`📝 Document updated by ${data.userId}`, data);
//             if (userId && data.userId !== userId && data.content) {
//                 try {
//                     console.log('🔄 Updating sections from external change');
//                     setDocSections(data.content);
//                 } catch (error) {
//                     console.error('Failed to process updated content:', error);
//                 }
//             }
//         };

//         const handleSaveSuccess = () => {
//             console.log('💾 Save successful');
//             setIsSaving(false);
//         };

//         const handleSaveError = (data: { message: string }) => {
//             console.error('❌ Save error:', data.message);
//             setIsSaving(false);
//         };

//         // Comment handlers - FIXED with proper data handling
//         const handleCommentAdded = (comment: Comment) => {
//             console.log(`💬 Comment added: ${comment.id}`, comment);
//             setComments(prev => handleCommentAddedHelper(prev, comment));
//         };

//         const handleCommentSynced = (data: { tempId: string; actualComment: Comment }) => {
//             console.log(`🔄 Comment synced: ${data.tempId} -> ${data.actualComment.id}`, data);
//             setComments(prev => updateCommentOnSync(prev, data.tempId, data.actualComment));
//         };

//         const handleCommentFailed = (data: { tempId: string }) => {
//             console.log(`❌ Comment failed: ${data.tempId}`);
//             setComments(prev => removeCommentOptimistically(prev, data.tempId));
//         };

//         const handleCommentDeleted = (data: { commentId: string }) => {
//             console.log(`🗑️ Comment deleted: ${data.commentId}`);
//             setComments(prev => removeCommentOptimistically(prev, data.commentId));
//         };

//         // User presence handlers
//         const handleActiveUsers = (data: { users: ActiveUser[] }) => {
//             console.log(`👥 Active users: ${data.users.length}`);
//             setActiveUsers(data.users);
//         };

//         const handleUserJoined = (data: { userId: string; userName: string }) => {
//             console.log(`👋 User joined: ${data.userName}`);
//             setActiveUsers(prev => {
//                 if (prev.some(u => u.userId === data.userId)) return prev;
//                 return [...prev, { userId: data.userId, userName: data.userName }];
//             });
//         };

//         const handleUserLeft = (data: { userId: string }) => {
//             console.log(`👋 User left: ${data.userId}`);
//             setActiveUsers(prev => prev.filter(u => u.userId !== data.userId));
//             setTypingUsers(prev => {
//                 const newSet = new Set(prev);
//                 newSet.delete(data.userId);
//                 return newSet;
//             });
//         };

//         const handleUserTyping = (data: { userId: string; userName?: string; isTyping: boolean }) => {
//             console.log(`⌨️ User typing: ${data.userId} - ${data.isTyping}`);
//             setTypingUsers(prev => {
//                 const newSet = new Set(prev);
//                 if (data.isTyping) {
//                     newSet.add(data.userId);
//                 } else {
//                     newSet.delete(data.userId);
//                 }
//                 return newSet;
//             });
//         };

//         const handleError = (data: { message: string; code?: string }) => {
//             console.error('❌ Socket error:', data);
//             if (data.code === 'ACCESS_DENIED') {
//                 alert('Access denied. You must be a team member to access this document.');
//                 setCurrentDoc(null);
//                 setDocSections(null);
//             }
//         };

//         // Register all event listeners
//         socket.on('document-loaded', handleDocumentLoaded);
//         socket.on('documentUpdated', handleDocumentUpdated);
//         socket.on('save-success', handleSaveSuccess);
//         socket.on('save-error', handleSaveError);
//         socket.on('comment-added', handleCommentAdded);
//         socket.on('comment-synced', handleCommentSynced);
//         socket.on('comment-failed', handleCommentFailed);
//         socket.on('comment-deleted', handleCommentDeleted);
//         socket.on('active-users', handleActiveUsers);
//         socket.on('user-joined', handleUserJoined);
//         socket.on('user-left', handleUserLeft);
//         socket.on('user-typing', handleUserTyping);
//         socket.on('error', handleError);

//         return () => {
//             console.log(`🔌 Cleaning up socket handlers for document: ${docId}`);
//             socket.off('document-loaded', handleDocumentLoaded);
//             socket.off('documentUpdated', handleDocumentUpdated);
//             socket.off('save-success', handleSaveSuccess);
//             socket.off('save-error', handleSaveError);
//             socket.off('comment-added', handleCommentAdded);
//             socket.off('comment-synced', handleCommentSynced);
//             socket.off('comment-failed', handleCommentFailed);
//             socket.off('comment-deleted', handleCommentDeleted);
//             socket.off('active-users', handleActiveUsers);
//             socket.off('user-joined', handleUserJoined);
//             socket.off('user-left', handleUserLeft);
//             socket.off('user-typing', handleUserTyping);
//             socket.off('error', handleError);

//             leaveDocumentRoom(socket, docId, currentUser.id);
//             isJoiningDoc.current = false;
//         };
//     }, [currentDoc, currentUser, userId]);

//     // Load documents
//     const loadDocuments = async () => {
//         setIsLoading(true);
//         try {
//             const result = await getTeamDocs();
//             if (result.success) {
//                 setDocuments(result?.result?.solicitationDocs || []);
//             }
//         } catch (error) {
//             console.error('Failed to load documents:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Load comments
//     const loadComments = async (docId: string) => {
//         try {
//             console.log(`📥 Loading comments for ${docId}`);
//             setIsLoadingComments(true);
//             const result = await getDocComments(docId);
//             if (result.success) {
//                 console.log(`✅ Loaded ${result.data.length} comments`);
//                 setComments(result.data);
//             }
//         } catch (error) {
//             console.error('Failed to load comments:', error);
//         } finally {
//             setIsLoadingComments(false);
//         }
//     };

//     // Add comment
//     const handleAddComment = useCallback(() => {
//         if (!newComment.trim() || !currentDoc || !socketRef.current || !userId || !userName) {
//             console.warn('❌ Cannot add comment - missing required data');
//             return;
//         }

//         console.log(`➕ Adding comment: ${newComment}`);
//         emitAddComment(socketRef.current, currentDoc.id, newComment, userId);
//         setNewComment('');
//     }, [newComment, currentDoc, userId, userName]);

//     // Delete comment
//     const handleDeleteComment = useCallback((commentId: string) => {
//         if (!currentDoc || !socketRef.current || !userId) {
//             console.warn('❌ Cannot delete comment - missing required data');
//             return;
//         }

//         console.log(`🗑️ Deleting comment: ${commentId}`);
//         setComments(prev => removeCommentOptimistically(prev, commentId));
//         emitDeleteComment(socketRef.current, currentDoc.id, commentId, userId);
//     }, [currentDoc, userId]);

//     // Select document
//     const handleSelectDocument = async (doc: any) => {
//         if (isLoadingDoc) return;

//         console.log(`📑 Selecting document: ${doc.id}`);
//         setIsLoadingDoc(true);
//         setCurrentDoc(null);
//         setDocSections(null);
//         setComments([]);
//         setShowComments(false);
//         setExpandedSections(new Set());
//         setTypingUsers(new Set());

//         try {
//             const result = await getSolicitationDoc(doc.id);

//             console.log(`✅ Document loaded:`, result?.result?.doc);
//             if (result?.result?.doc) {
//                 setCurrentDoc(result?.result?.doc);
//                 loadedDocs.current.delete(doc.id);
//             } else {
//                 console.error('Failed to load document:', result.message);
//                 alert('Failed to load document. Please try again.');
//             }
//         } catch (error) {
//             console.error('Error loading document:', error);
//             alert('Error loading document. Please try again.');
//         } finally {
//             setIsLoadingDoc(false);
//         }
//     };

//     // Create new document
//     const handleCreateNewDocument = () => {
//         createNewDocument(
//             newDocTitle,
//             createSolicitationDoc,
//             loadDocuments,
//             handleSelectDocument,
//             loadedDocs,
//             setNewDocTitle,
//             setShowNewDoc
//         );
//     };

//     // Format section title
//     const formatSectionTitle = (key: string): string => {
//         return key.split('_').map(word =>
//             word.charAt(0).toUpperCase() + word.slice(1)
//         ).join(' ');
//     };

//     // Check if section is object
//     const isObjectSection = (content: any): boolean => {
//         return typeof content === 'object' && !Array.isArray(content) && content !== null;
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
//             {/* Sidebar */}
//             <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
//                 <div className="p-6 border-b border-slate-200">
//                     <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
//                         <FileText className="w-7 h-7 text-blue-600" />
//                         Solicitation Docs
//                     </h1>
//                     <p className="text-sm text-slate-600 mt-1">Collaborative Workspace</p>
//                 </div>

//                 <div className="p-4">
//                     <button
//                         onClick={() => setShowNewDoc(true)}
//                         className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
//                     >
//                         <Plus className="w-5 h-5" />
//                         New Document
//                     </button>
//                 </div>

//                 <div className="flex-1 overflow-y-auto p-4 space-y-2">
//                     {isLoading ? (
//                         <div className="flex items-center justify-center py-12">
//                             <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//                         </div>
//                     ) : documents.length === 0 ? (
//                         <div className="text-center py-12 px-4">
//                             <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
//                             <p className="text-slate-500">No documents yet</p>
//                             <p className="text-sm text-slate-400 mt-1">Create your first document</p>
//                         </div>
//                     ) : (
//                         sortedDocuments.map(doc => (
//                             <button
//                                 key={doc.id}
//                                 onClick={() => handleSelectDocument(doc)}
//                                 disabled={isLoadingDoc}
//                                 className={`w-full text-left p-4 rounded-lg transition-all ${currentDoc?.id === doc.id
//                                     ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
//                                     : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
//                                     } ${isLoadingDoc ? 'opacity-50 cursor-not-allowed' : ''}`}
//                             >
//                                 <div className="flex items-start justify-between gap-2">
//                                     <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//                                     <div className="flex-1 min-w-0">
//                                         <h3 className="font-medium text-slate-900 truncate">
//                                             {doc.solicitationId}
//                                         </h3>
//                                         <div className="flex items-center gap-2 mt-1">
//                                             <span className={`text-xs px-2 py-0.5 rounded-full ${doc.status === 'Completed'
//                                                 ? 'bg-green-100 text-green-700'
//                                                 : 'bg-yellow-100 text-yellow-700'
//                                                 }`}>
//                                                 {doc.status}
//                                             </span>
//                                         </div>
//                                         <p className="text-sm text-slate-500 mt-1">
//                                             Updated {formatDate(doc.updatedAt)}
//                                         </p>
//                                         <p className="text-xs text-slate-400 mt-0.5">
//                                             By {doc.creator?.firstName} {doc.creator?.lastName}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </button>
//                         ))
//                     )}
//                 </div>

//                 <div className="p-4 border-t border-slate-200">
//                     <div className="flex items-center gap-2 text-sm text-slate-600">
//                         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
//                         <span className="font-medium">{userName || 'Loading...'}</span>
//                     </div>
//                 </div>
//             </div>

//             {/* Main Editor */}
//             <div className="flex-1 flex flex-col overflow-hidden">
//                 {isLoadingDoc ? (
//                     <div className="flex-1 flex items-center justify-center bg-slate-50">
//                         <div className="text-center">
//                             <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
//                             <p className="text-slate-600 font-medium">Loading document...</p>
//                         </div>
//                     </div>
//                 ) : currentDoc && docSections ? (
//                     <>
//                         {/* Header */}
//                         <div className="border-b border-slate-200 bg-white px-6 py-4">
//                             <div className="flex items-start justify-between gap-4">
//                                 <div className="flex-1">
//                                     <h1 className="text-2xl font-bold text-slate-900 mb-1">
//                                         {currentDoc.solicitationId}
//                                     </h1>
//                                     <div className="flex items-center gap-3 text-sm text-slate-600 flex-wrap">
//                                         <span className={`px-2 py-1 rounded text-xs font-medium ${currentDoc.status === 'Completed'
//                                             ? 'bg-green-100 text-green-700'
//                                             : 'bg-yellow-100 text-yellow-700'
//                                             }`}>
//                                             {currentDoc.status}
//                                         </span>
//                                         <span>Last edited {formatDate(currentDoc.updatedAt)}</span>
//                                         {currentDoc.creator && (
//                                             <span>• Created by {currentDoc.creator.firstName} {currentDoc.creator.lastName}</span>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="flex items-center gap-3 flex-wrap">
//                                     {isSaving && (
//                                         <span className="text-xs text-blue-600 flex items-center gap-1.5">
//                                             <Loader2 className="w-3.5 h-3.5 animate-spin" />
//                                             Saving...
//                                         </span>
//                                     )}
//                                     {typingUsersList.length > 0 && (
//                                         <span className="text-xs text-slate-500">
//                                             {typingUsersList.length} user{typingUsersList.length > 1 ? 's' : ''} typing...
//                                         </span>
//                                     )}

//                                     <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
//                                         <Users className="w-4 h-4 text-slate-600" />
//                                         <span className="text-sm font-medium text-slate-700">
//                                             {activeUsers.length}
//                                         </span>
//                                     </div>

//                                     <button
//                                         onClick={() => setShowComments(!showComments)}
//                                         className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap"
//                                     >
//                                         <MessageSquare className="w-5 h-5" />
//                                         <span className="font-medium">Comments ({comments.length})</span>
//                                     </button>

//                                     <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors whitespace-nowrap">
//                                         <Download className="w-5 h-5" />
//                                         <span className="font-medium">Export</span>
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Content Area */}
//                         <div className="flex-1 flex overflow-hidden">
//                             {/* Editor */}
//                             <div className="flex-1 flex flex-col overflow-y-auto">
//                                 <div className="p-6 space-y-4">
//                                     {Object.entries(docSections).map(([sectionKey, sectionContent]) => {
//                                         const isExpanded = expandedSections.has(sectionKey);

//                                         if (isObjectSection(sectionContent)) {
//                                             return (
//                                                 <ObjectSectionEditor
//                                                     key={sectionKey}
//                                                     title={formatSectionTitle(sectionKey)}
//                                                     content={sectionContent}
//                                                     onContentChange={handleSectionContentChange}
//                                                     sectionKey={sectionKey}
//                                                     isExpanded={isExpanded}
//                                                     onToggle={() => toggleSection(sectionKey)}
//                                                 />
//                                             );
//                                         } else {
//                                             return (
//                                                 <SectionEditor
//                                                     key={sectionKey}
//                                                     title={formatSectionTitle(sectionKey)}
//                                                     content={sectionContent}
//                                                     onContentChange={handleSectionContentChange}
//                                                     sectionKey={sectionKey}
//                                                     isExpanded={isExpanded}
//                                                     onToggle={() => toggleSection(sectionKey)}
//                                                     socket={socketRef.current}
//                                                     currentDoc={currentDoc}
//                                                     userId={userId || ''}
//                                                     userName={userName || 'Anonymous'}
//                                                 />
//                                             );
//                                         }
//                                     })}
//                                 </div>
//                             </div>

//                             {/* Comments Panel */}
//                             {showComments && (
//                                 <CommentsPanel
//                                     comments={sortedComments}
//                                     userId={userId}
//                                     newComment={newComment}
//                                     onNewCommentChange={setNewComment}
//                                     onAddComment={handleAddComment}
//                                     onDeleteComment={handleDeleteComment}
//                                     isLoading={isLoadingComments}
//                                     currentUser={currentUser}
//                                     onClose={() => setShowComments(false)}
//                                 />
//                             )}
//                         </div>
//                     </>
//                 ) : (
//                     <div className="flex-1 flex items-center justify-center bg-slate-50">
//                         <div className="text-center max-w-md px-6">
//                             <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//                             <h2 className="text-2xl font-bold text-slate-900 mb-2">
//                                 No Document Selected
//                             </h2>
//                             <p className="text-slate-600">
//                                 Select a document from the sidebar or create a new one
//                             </p>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* New Document Modal */}
//             {showNewDoc && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
//                         <h3 className="text-xl font-bold text-slate-900 mb-4">Create New Document</h3>
//                         <input
//                             type="text"
//                             value={newDocTitle}
//                             onChange={(e) => setNewDocTitle(e.target.value)}
//                             onKeyPress={(e) => e.key === 'Enter' && handleCreateNewDocument()}
//                             placeholder="Enter document title..."
//                             className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-4 transition-all"
//                             autoFocus
//                         />
//                         <div className="flex gap-3">
//                             <button
//                                 onClick={() => setShowNewDoc(false)}
//                                 className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleCreateNewDocument}
//                                 disabled={!newDocTitle.trim()}
//                                 className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${!newDocTitle.trim()
//                                     ? 'bg-slate-300 cursor-not-allowed'
//                                     : 'bg-blue-600 hover:bg-blue-700 text-white'
//                                     }`}
//                             >
//                                 Create
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default SolicitationEditor;




"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Users, MessageSquare, FileText, X, Download, Plus, Loader2, Save } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

// Server actions
import { createSolicitationDoc, getDocComments, getTeamDocs, getUserInfo, getSolicitationDoc } from '../actions/solicitation.actions';
import {
    ActiveUser,
    Comment,
    emitAddComment,
    emitDeleteComment,
    emitEditDocument,
    emitSaveDocument,
    joinDocumentRoom,
    leaveDocumentRoom,
} from '../helper/socketHelpers';
import {
    handleCommentAdded as handleCommentAddedHelper,
    removeCommentOptimistically,
    updateCommentOnSync
} from '../helper/commentHelpers';

// Helpers
import { formatSectionTitle, isObjectSection } from '../helper/sectionHelpers';
import { formatDate } from '../helper/dateHelpers';
import { createNewDocument } from '../helper/documentHelpers';
import ObjectSectionEditor from './ObjectSectionEditor';
import CommentsPanel from './CommentsPanel';
import SectionEditor from './SectionEditor';


const SolicitationEditor = () => {
    // State Management
    const [documents, setDocuments] = useState<any[]>([]);
    const [currentDoc, setCurrentDoc] = useState<any>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [showNewDoc, setShowNewDoc] = useState(false);
    const [newDocTitle, setNewDocTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingDoc, setIsLoadingDoc] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [docSections, setDocSections] = useState<any>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [unsavedChangesBySection, setUnsavedChangesBySection] = useState<Set<string>>(new Set());

    const userId = currentUser?.id;
    const userName = currentUser?.firstName;

    const socketRef = useRef<Socket | null>(null);
    const loadedDocs = useRef<Set<string>>(new Set());
    const isJoiningDoc = useRef(false);

    // Memoized values
    const sortedDocuments = useMemo(() => {
        return [...documents].sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }, [documents]);

    const sortedComments = useMemo(() => {
        return [...comments].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
    }, [comments]);

    const typingUsersList = useMemo(() => {
        return Array.from(typingUsers);
    }, [typingUsers]);

    // Content change handler - only real-time, no auto-save
    const handleSectionContentChange = useCallback((sectionKey: string, content: any) => {
        if (!currentDoc || !socketRef.current || !userId) return;

        setDocSections((prevSections: any) => {
            const updatedContent = {
                ...prevSections,
                [sectionKey]: content
            };

            // Mark section as having unsaved changes
            setUnsavedChangesBySection(prev => new Set(prev).add(sectionKey));
            setHasUnsavedChanges(true);

            // Emit real-time edit (without saving to DB)
            emitEditDocument(socketRef.current, currentDoc.id, updatedContent, userId);

            return updatedContent;
        });
    }, [currentDoc, userId]);

    // Handle section unsaved changes
    const handleSectionUnsavedChange = useCallback((sectionKey: string, hasChanges: boolean) => {
        setUnsavedChangesBySection(prev => {
            const newSet = new Set(prev);
            if (hasChanges) {
                newSet.add(sectionKey);
            } else {
                newSet.delete(sectionKey);
            }
            return newSet;
        });
    }, []);

    // Save document manually
    const handleSaveDocument = useCallback(async () => {
        if (!currentDoc || !socketRef.current || !userId || !docSections) {
            console.warn('❌ Cannot save document - missing required data');
            return;
        }

        console.log('💾 Manual save document:', currentDoc.id);
        setIsSaving(true);

        emitSaveDocument(socketRef.current, currentDoc.id, docSections, userId);
        await handleGetSingleDocument(currentDoc);
    }, [currentDoc, userId, docSections]);

    // Toggle section
    const toggleSection = useCallback((sectionKey: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sectionKey)) {
                newSet.delete(sectionKey);
            } else {
                newSet.add(sectionKey);
            }
            return newSet;
        });
    }, []);

    // Initialize document sections
    useEffect(() => {
        if (currentDoc?.content) {
            console.log('📄 Initializing document sections:', currentDoc.content);
            setDocSections(currentDoc.content);
            setHasUnsavedChanges(false);
            setUnsavedChangesBySection(new Set());

            const firstSection = Object.keys(currentDoc.content)[0];
            if (firstSection) {
                setExpandedSections(new Set([firstSection]));
            }
        }
    }, [currentDoc]);

    // Initialize Socket
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

    // Socket handlers for document and comments
    useEffect(() => {
        if (!currentDoc || !socketRef.current || !currentUser || isJoiningDoc.current) return;

        isJoiningDoc.current = true;
        const socket = socketRef.current;
        const docId = currentDoc.id;

        console.log(`🔄 Setting up socket handlers for document: ${docId}`);

        joinDocumentRoom(socket, docId, currentUser.id, currentUser.firstName);

        // Document handlers
        const handleDocumentLoaded = (data: { content: any; updatedAt: string }) => {
            console.log(`📄 Document loaded for ${docId}`, data);
            if (!loadedDocs.current.has(docId)) {
                try {
                    setDocSections(data.content);
                    console.log('✅ Document sections loaded');
                } catch (error) {
                    console.error('Failed to process document content:', error);
                }
                loadedDocs.current.add(docId);
                loadComments(docId);
            }
            isJoiningDoc.current = false;
        };

        const handleDocumentUpdated = (data: { content: any; userId: string; timestamp: Date; isUnsaved?: boolean }) => {
            console.log(`📝 Document updated by ${data.userId}`, data);
            if (userId && data.userId !== userId && data.content) {
                try {
                    console.log('🔄 Updating sections from external change');
                    setDocSections(data.content);

                    // If this is an unsaved change from another user, mark as unsaved
                    if (data.isUnsaved) {
                        setHasUnsavedChanges(true);
                    }
                } catch (error) {
                    console.error('Failed to process updated content:', error);
                }
            }
        };

        const handleSaveSuccess = (data: { message: string; updatedAt: string }) => {
            console.log('💾 Save successful', data);
            setIsSaving(false);
            setHasUnsavedChanges(false);
            setUnsavedChangesBySection(new Set());

            // Update current doc with new updatedAt
            setCurrentDoc(prev => prev ? { ...prev, updatedAt: data.updatedAt } : null);

            // Show success message
            // You can add a toast notification here
        };

        const handleSaveError = (data: { message: string }) => {
            console.error('❌ Save error:', data.message);
            setIsSaving(false);
            // Show error message
            alert(`Failed to save document: ${data.message}`);
        };

        const handleDocumentSaved = (data: { content: any; userId: string; timestamp: Date; updatedAt: string }) => {
            console.log(`📝 Document saved by ${data.userId}`);
            if (data.userId !== userId) {
                // Another user saved the document, update our state
                setDocSections(data.content);
                setHasUnsavedChanges(false);
                setUnsavedChangesBySection(new Set());
                setCurrentDoc(prev => prev ? { ...prev, updatedAt: data.updatedAt } : null);
            }
        };

        // Comment handlers (keep existing)
        const handleCommentAdded = (comment: Comment) => {
            console.log(`💬 Comment added: ${comment.id}`, comment);
            setComments(prev => handleCommentAddedHelper(prev, comment));
        };

        const handleCommentSynced = (data: { tempId: string; actualComment: Comment }) => {
            console.log(`🔄 Comment synced: ${data.tempId} -> ${data.actualComment.id}`, data);
            setComments(prev => updateCommentOnSync(prev, data.tempId, data.actualComment));
        };

        const handleCommentFailed = (data: { tempId: string }) => {
            console.log(`❌ Comment failed: ${data.tempId}`);
            setComments(prev => removeCommentOptimistically(prev, data.tempId));
        };

        const handleCommentDeleted = (data: { commentId: string }) => {
            console.log(`🗑️ Comment deleted: ${data.commentId}`);
            setComments(prev => removeCommentOptimistically(prev, data.commentId));
        };

        // User presence handlers (keep existing)
        const handleActiveUsers = (data: { users: ActiveUser[] }) => {
            console.log(`👥 Active users: ${data.users.length}`);
            setActiveUsers(data.users);
        };

        const handleUserJoined = (data: { userId: string; userName: string }) => {
            console.log(`👋 User joined: ${data.userName}`);
            setActiveUsers(prev => {
                if (prev.some(u => u.userId === data.userId)) return prev;
                return [...prev, { userId: data.userId, userName: data.userName }];
            });
        };

        const handleUserLeft = (data: { userId: string }) => {
            console.log(`👋 User left: ${data.userId}`);
            setActiveUsers(prev => prev.filter(u => u.userId !== data.userId));
            setTypingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(data.userId);
                return newSet;
            });
        };

        const handleUserTyping = (data: { userId: string; userName?: string; isTyping: boolean }) => {
            console.log(`⌨️ User typing: ${data.userId} - ${data.isTyping}`);
            setTypingUsers(prev => {
                const newSet = new Set(prev);
                if (data.isTyping) {
                    newSet.add(data.userId);
                } else {
                    newSet.delete(data.userId);
                }
                return newSet;
            });
        };

        const handleError = (data: { message: string; code?: string }) => {
            console.error('❌ Socket error:', data);
            if (data.code === 'ACCESS_DENIED') {
                alert('Access denied. You must be a team member to access this document.');
                setCurrentDoc(null);
                setDocSections(null);
            }
        };

        // Register all event listeners
        socket.on('document-loaded', handleDocumentLoaded);
        socket.on('documentUpdated', handleDocumentUpdated);
        socket.on('save-success', handleSaveSuccess);
        socket.on('save-error', handleSaveError);
        socket.on('document-saved', handleDocumentSaved);
        socket.on('comment-added', handleCommentAdded);
        socket.on('comment-synced', handleCommentSynced);
        socket.on('comment-failed', handleCommentFailed);
        socket.on('comment-deleted', handleCommentDeleted);
        socket.on('active-users', handleActiveUsers);
        socket.on('user-joined', handleUserJoined);
        socket.on('user-left', handleUserLeft);
        socket.on('user-typing', handleUserTyping);
        socket.on('error', handleError);

        return () => {
            console.log(`🔌 Cleaning up socket handlers for document: ${docId}`);
            socket.off('document-loaded', handleDocumentLoaded);
            socket.off('documentUpdated', handleDocumentUpdated);
            socket.off('save-success', handleSaveSuccess);
            socket.off('save-error', handleSaveError);
            socket.off('document-saved', handleDocumentSaved);
            socket.off('comment-added', handleCommentAdded);
            socket.off('comment-synced', handleCommentSynced);
            socket.off('comment-failed', handleCommentFailed);
            socket.off('comment-deleted', handleCommentDeleted);
            socket.off('active-users', handleActiveUsers);
            socket.off('user-joined', handleUserJoined);
            socket.off('user-left', handleUserLeft);
            socket.off('user-typing', handleUserTyping);
            socket.off('error', handleError);

            leaveDocumentRoom(socket, docId, currentUser.id);
            isJoiningDoc.current = false;
        };
    }, [currentDoc, currentUser, userId]);

    // Load initial data
    useEffect(() => {
        getCurrentUser();
        loadDocuments();
    }, []);

    const getCurrentUser = async () => {
        const user = await getUserInfo();
        setCurrentUser(user?.result);
    };
    // Load documents (keep existing)
    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            const result = await getTeamDocs();
            console.log(`📥 Loaded ${result?.result?.solicitationDocs?.length || 0} documents`);
            if (result.success) {
                setDocuments(result?.result?.solicitationDocs || []);
            }
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load comments (keep existing)
    const loadComments = async (docId: string) => {
        try {
            console.log(`📥 Loading comments for ${docId}`);
            setIsLoadingComments(true);
            const result = await getDocComments(docId);
            if (result.success) {
                console.log(`✅ Loaded ${result.data.length} comments`);
                setComments(result.data);
            }
        } catch (error) {
            console.error('Failed to load comments:', error);
        } finally {
            setIsLoadingComments(false);
        }
    };

    // Add comment (keep existing)
    const handleAddComment = useCallback(() => {
        if (!newComment.trim() || !currentDoc || !socketRef.current || !userId || !userName) {
            console.warn('❌ Cannot add comment - missing required data');
            return;
        }

        console.log(`➕ Adding comment: ${newComment}`);
        emitAddComment(socketRef.current, currentDoc.id, newComment, userId);
        setNewComment('');
    }, [newComment, currentDoc, userId, userName]);

    // Delete comment (keep existing)
    const handleDeleteComment = useCallback((commentId: string) => {
        if (!currentDoc || !socketRef.current || !userId) {
            console.warn('❌ Cannot delete comment - missing required data');
            return;
        }

        console.log(`🗑️ Deleting comment: ${commentId}`);
        setComments(prev => removeCommentOptimistically(prev, commentId));
        emitDeleteComment(socketRef.current, currentDoc.id, commentId, userId);
    }, [currentDoc, userId]);

    // Select document (keep existing)
    const handleSelectDocument = async (doc: any) => {
        if (isLoadingDoc) return;

        // Warn about unsaved changes
        if (hasUnsavedChanges && currentDoc) {
            const confirmSwitch = window.confirm(
                'You have unsaved changes. Are you sure you want to switch documents?'
            );
            if (!confirmSwitch) return;
        }

        console.log(`📑 Selecting document: ${doc.id}`);
        setIsLoadingDoc(true);
        setCurrentDoc(null);
        setDocSections(null);
        setComments([]);
        setShowComments(false);
        setExpandedSections(new Set());
        setTypingUsers(new Set());
        setHasUnsavedChanges(false);
        setUnsavedChangesBySection(new Set());

        await handleGetSingleDocument(doc);
    };

    const handleGetSingleDocument = async (doc: any) => {
        try {
            const result = await getSolicitationDoc(doc.id);

            console.log(`✅ Document loaded:`, result?.result?.doc);
            if (result?.result?.doc) {
                setCurrentDoc(result?.result?.doc);
                loadedDocs.current.delete(doc.id);
            } else {
                console.error('Failed to load document:', result.message);
                alert('Failed to load document. Please try again.');
            }
        } catch (error) {
            console.error('Error loading document:', error);
            alert('Error loading document. Please try again.');
        } finally {
            setIsLoadingDoc(false);
        }
    }

    // Create new document (keep existing)
    const handleCreateNewDocument = () => {
        createNewDocument(
            newDocTitle,
            createSolicitationDoc,
            loadDocuments,
            handleSelectDocument,
            loadedDocs,
            setNewDocTitle,
            setShowNewDoc
        );
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
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No documents yet</p>
                            <p className="text-sm text-slate-400 mt-1">Create your first document</p>
                        </div>
                    ) : (
                        sortedDocuments.map(doc => (
                            <button
                                key={doc.id}
                                onClick={() => handleSelectDocument(doc)}
                                disabled={isLoadingDoc}
                                className={`w-full text-left p-4 rounded-lg transition-all ${currentDoc?.id === doc.id
                                    ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                                    : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                                    } ${isLoadingDoc ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-slate-900 truncate">
                                            {doc.solicitationId}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${doc.status === 'Completed'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {doc.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Updated {formatDate(doc.updatedAt)}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            By {doc.creator?.firstName} {doc.creator?.lastName}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="font-medium">{userName || 'Loading...'}</span>
                    </div>
                </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {isLoadingDoc ? (
                    <div className="flex-1 flex items-center justify-center bg-slate-50">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-slate-600 font-medium">Loading document...</p>
                        </div>
                    </div>
                ) : currentDoc && docSections ? (
                    <>
                        {/* Header with Save Button */}
                        <div className="border-b border-slate-200 bg-white px-6 py-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                                        {currentDoc.solicitationId}
                                    </h1>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 flex-wrap">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${currentDoc.status === 'Completed'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {currentDoc.status}
                                        </span>
                                        <span>Last saved {formatDate(currentDoc.updatedAt)}</span>
                                        {currentDoc.creator && (
                                            <span>• Created by {currentDoc.creator.firstName} {currentDoc.creator.lastName}</span>
                                        )}
                                        {hasUnsavedChanges && (
                                            <span className="text-orange-600 font-medium">• Unsaved changes</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 flex-wrap">
                                    {isSaving && (
                                        <span className="text-xs text-blue-600 flex items-center gap-1.5">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Saving...
                                        </span>
                                    )}
                                    {typingUsersList.length > 0 && (
                                        <span className="text-xs text-slate-500">
                                            {typingUsersList.length} user{typingUsersList.length > 1 ? 's' : ''} typing...
                                        </span>
                                    )}

                                    {/* Save Button */}
                                    <button
                                        onClick={handleSaveDocument}
                                        disabled={!hasUnsavedChanges || isSaving}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${!hasUnsavedChanges || isSaving
                                            ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                            }`}
                                    >
                                        <Save className="w-5 h-5" />
                                        <span className="font-medium">
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </span>
                                    </button>

                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                                        <Users className="w-4 h-4 text-slate-600" />
                                        <span className="text-sm font-medium text-slate-700">
                                            {activeUsers.length}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => setShowComments(!showComments)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        <span className="font-medium">Comments ({comments.length})</span>
                                    </button>

                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors whitespace-nowrap">
                                        <Download className="w-5 h-5" />
                                        <span className="font-medium">Export</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Editor */}
                            <div className="flex-1 flex flex-col overflow-y-auto">
                                <div className="p-6 space-y-4">
                                    {Object.entries(docSections).map(([sectionKey, sectionContent]) => {
                                        const isExpanded = expandedSections.has(sectionKey);
                                        const sectionHasUnsavedChanges = unsavedChangesBySection.has(sectionKey);

                                        if (isObjectSection(sectionContent)) {
                                            return (
                                                <ObjectSectionEditor
                                                    key={sectionKey}
                                                    title={formatSectionTitle(sectionKey)}
                                                    content={sectionContent}
                                                    onContentChange={handleSectionContentChange}
                                                    sectionKey={sectionKey}
                                                    isExpanded={isExpanded}
                                                    onToggle={() => toggleSection(sectionKey)}
                                                    hasUnsavedChanges={sectionHasUnsavedChanges}
                                                    onUnsavedChange={(hasChanges) => handleSectionUnsavedChange(sectionKey, hasChanges)}
                                                />
                                            );
                                        } else {
                                            return (
                                                <SectionEditor
                                                    key={sectionKey}
                                                    title={formatSectionTitle(sectionKey)}
                                                    content={sectionContent}
                                                    onContentChange={handleSectionContentChange}
                                                    sectionKey={sectionKey}
                                                    isExpanded={isExpanded}
                                                    onToggle={() => toggleSection(sectionKey)}
                                                    socket={socketRef.current}
                                                    currentDoc={currentDoc}
                                                    userId={userId || ''}
                                                    userName={userName || 'Anonymous'}
                                                    hasUnsavedChanges={sectionHasUnsavedChanges}
                                                    onUnsavedChange={(hasChanges) => handleSectionUnsavedChange(sectionKey, hasChanges)}
                                                />
                                            );
                                        }
                                    })}
                                </div>
                            </div>

                            {/* Comments Panel */}
                            {showComments && (
                                <CommentsPanel
                                    comments={sortedComments}
                                    userId={userId}
                                    newComment={newComment}
                                    onNewCommentChange={setNewComment}
                                    onAddComment={handleAddComment}
                                    onDeleteComment={handleDeleteComment}
                                    isLoading={isLoadingComments}
                                    currentUser={currentUser}
                                    onClose={() => setShowComments(false)}
                                />
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-slate-50">
                        <div className="text-center max-w-md px-6">
                            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                No Document Selected
                            </h2>
                            <p className="text-slate-600">
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
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateNewDocument()}
                            placeholder="Enter document title..."
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-4 transition-all"
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
                                onClick={handleCreateNewDocument}
                                disabled={!newDocTitle.trim()}
                                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${!newDocTitle.trim()
                                    ? 'bg-slate-300 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
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