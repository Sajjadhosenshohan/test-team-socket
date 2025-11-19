"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Users, MessageSquare, FileText, X, Trash2, Download, Plus, Loader2, ChevronDown, ChevronRight, Save, AlertCircle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

// Section configuration matching your schema
const SECTION_CONFIG = [
  { key: 'document_overview', title: 'Document Overview', icon: '📄', type: 'string' },
  { key: 'title_page', title: 'Title Page', icon: '📋', type: 'object' },
  { key: 'executive_summary', title: 'Executive Summary', icon: '📊', type: 'string' },
  { key: 'key_dates_and_rules', title: 'Key Dates & Rules', icon: '📅', type: 'array' },
  { key: 'compliance_matrix', title: 'Compliance Matrix', icon: '✓', type: 'string' },
  { key: 'technical_approach', title: 'Technical Approach', icon: '🔧', type: 'string' },
  { key: 'risks_and_gaps', title: 'Risks & Gaps', icon: '⚠️', type: 'array' },
  { key: 'financial_proposal_overview', title: 'Financial Proposal', icon: '💰', type: 'string' },
  { key: 'organizational_capability', title: 'Organizational Capability', icon: '🏢', type: 'string' },
  { key: 'recommendations_and_value_additions', title: 'Recommendations', icon: '💡', type: 'string' },
  { key: 'implementation_timeline', title: 'Implementation Timeline', icon: '⏱️', type: 'string' },
  { key: 'appendix', title: 'Appendix', icon: '📎', type: 'object' },
];

// Rich Text Editor Component
const RichTextEditor = ({ content, onChange, placeholder, readOnly = false }) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && content !== undefined) {
      const currentContent = editorRef.current.innerHTML;
      const newContent = content || '';
      if (currentContent !== newContent) {
        editorRef.current.innerHTML = newContent;
      }
    }
  }, [content]);

  const handleInput = (e) => {
    if (!readOnly) {
      onChange(e.currentTarget.innerHTML);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {!readOnly && (
        <div className="flex items-center gap-1 p-2 border-b bg-slate-50 flex-wrap">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className="p-2 hover:bg-slate-200 rounded font-bold text-sm"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className="p-2 hover:bg-slate-200 rounded italic text-sm"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className="p-2 hover:bg-slate-200 rounded underline text-sm"
            title="Underline"
          >
            U
          </button>
          <div className="w-px h-6 bg-slate-300 mx-1"></div>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', '<h2>')}
            className="px-2 py-1 hover:bg-slate-200 rounded text-sm"
            title="Heading"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', '<h3>')}
            className="px-2 py-1 hover:bg-slate-200 rounded text-sm"
            title="Heading 3"
          >
            H3
          </button>
          <div className="w-px h-6 bg-slate-300 mx-1"></div>
          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            className="px-2 py-1 hover:bg-slate-200 rounded text-sm"
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            className="px-2 py-1 hover:bg-slate-200 rounded text-sm"
            title="Numbered List"
          >
            1. List
          </button>
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`p-4 min-h-[200px] outline-none ${
          isFocused ? 'ring-2 ring-blue-500' : ''
        } ${readOnly ? 'bg-slate-50' : 'bg-white'}`}
        style={{ caretColor: '#1e40af' }}
        suppressContentEditableWarning
      />
      {!content && !readOnly && (
        <div className="absolute top-14 left-4 text-slate-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};

// JSON Editor for complex objects
const JsonEditor = ({ content, onChange, readOnly = false }) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (content !== undefined) {
      setJsonText(JSON.stringify(content, null, 2));
    }
  }, [content]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setJsonText(newValue);
    
    try {
      const parsed = JSON.parse(newValue);
      setError('');
      onChange(parsed);
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={jsonText}
        onChange={handleChange}
        readOnly={readOnly}
        className={`w-full h-64 p-4 font-mono text-sm border rounded-lg ${
          readOnly ? 'bg-slate-50' : 'bg-white'
        } ${error ? 'border-red-500' : 'border-slate-300'}`}
        placeholder='{"key": "value"}'
      />
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

// Array Editor for lists
const ArrayEditor = ({ items = [], onChange, readOnly = false }) => {
  const addItem = () => {
    onChange([...items, '']);
  };

  const updateItem = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            readOnly={readOnly}
            className="flex-1 px-3 py-2 border rounded-lg bg-white"
            placeholder={`Item ${index + 1}...`}
          />
          {!readOnly && (
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      {!readOnly && (
        <button
          type="button"
          onClick={addItem}
          className="w-full p-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Add Item
        </button>
      )}
    </div>
  );
};

// Section Editor Component
const SectionEditor = ({ sectionKey, sectionData, sectionType, onChange, readOnly = false }) => {
  if (sectionType === 'array') {
    return <ArrayEditor items={sectionData || []} onChange={onChange} readOnly={readOnly} />;
  }

  if (sectionType === 'object') {
    return <JsonEditor content={sectionData || {}} onChange={onChange} readOnly={readOnly} />;
  }

  // Default to string/rich text
  return (
    <RichTextEditor
      content={sectionData || ''}
      onChange={onChange}
      placeholder={`Enter ${sectionKey.replace(/_/g, ' ')} content...`}
      readOnly={readOnly}
    />
  );
};

// Main Component
const SolicitationDocEditor = ({ docId }) => {
  const [document, setDocument] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set(['document_overview']));
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [activeUsers, setActiveUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const socketRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const hasJoinedRef = useRef(false);

  // Initialize socket connection
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
      setConnectionStatus('connected');
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnectionStatus('disconnected');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setConnectionStatus('disconnected');
    });

    return () => {
      if (socketRef.current) {
        if (currentUser && document) {
          socketRef.current.emit('leave-document', { 
            docId: document.id, 
            userId: currentUser.id 
          });
        }
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Load document and setup socket handlers
  useEffect(() => {
    const loadDocument = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Import the server action dynamically
        const { getSolicitationDoc, getUserInfo } = await import('../actions/solicitation.actions');
        
        // Get current user
        const userResult = await getUserInfo();
        if (!userResult?.result) {
          throw new Error('User not authenticated');
        }
        setCurrentUser(userResult.result);

        // Get document
        const result = await getSolicitationDoc(docId);
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to load document');
        }

        console.log('Loaded document:', result.data?.doc);
        setDocument(result.data?.doc);
        setIsLoading(false);

        // Join document room via socket
        if (socketRef.current && !hasJoinedRef.current) {
          hasJoinedRef.current = true;
          
          socketRef.current.emit('join-document', {
            docId: result.data.id,
            userId: userResult.result.id,
            userName: userResult.result.firstName || 'Anonymous'
          });

          // Setup socket listeners
          setupSocketListeners(result.data, userResult.result);
        }

      } catch (err) {
        console.error('Error loading document:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    if (docId) {
      loadDocument();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('document-loaded');
        socketRef.current.off('document-updated');
        socketRef.current.off('active-users');
        socketRef.current.off('user-joined');
        socketRef.current.off('user-left');
        socketRef.current.off('save-success');
        socketRef.current.off('save-error');
      }
    };
  }, [docId]);

  const setupSocketListeners = (doc, user) => {
    if (!socketRef.current) return;

    socketRef.current.on('document-loaded', (data) => {
      console.log('📄 Document loaded from socket');
      if (data.content) {
        setDocument(prev => ({ ...prev, content: data.content }));
      }
    });

    socketRef.current.on('document-updated', (data) => {
      console.log('📝 Document updated from socket');
      if (data.userId !== user.id && data.content) {
        setDocument(prev => ({ ...prev, content: data.content }));
      }
    });

    socketRef.current.on('active-users', (data) => {
      console.log('👥 Active users:', data.users);
      setActiveUsers(data.users || []);
    });

    socketRef.current.on('user-joined', (data) => {
      console.log('👋 User joined:', data.userName);
      setActiveUsers(prev => [...prev, { userId: data.userId, userName: data.userName }]);
    });

    socketRef.current.on('user-left', (data) => {
      console.log('👋 User left:', data.userId);
      setActiveUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    socketRef.current.on('save-success', () => {
      console.log('💾 Save successful');
      setIsSaving(false);
    });

    socketRef.current.on('save-error', (data) => {
      console.error('❌ Save error:', data.message);
      setIsSaving(false);
      setError(data.message);
    });

    socketRef.current.on('error', (data) => {
      console.error('❌ Socket error:', data.message);
      setError(data.message);
    });
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  };

  const handleSectionChange = useCallback((sectionKey, newValue) => {
    if (!document || !currentUser || !socketRef.current) return;

    // Update local state immediately
    setDocument(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [sectionKey]: newValue
      }
    }));

    // Debounced save to socket
    setIsSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const updatedContent = {
        ...document.content,
        [sectionKey]: newValue
      };

      console.log('💾 Emitting document update:', sectionKey);
      socketRef.current.emit('edit-document', {
        docId: document.id,
        content: updatedContent,
        userId: currentUser.id
      });
    }, 1000);
  }, [document, currentUser]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading document...</p>
        </div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
  //       <div className="text-center max-w-md">
  //         <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
  //         <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Document</h2>
  //         <p className="text-slate-600 mb-4">{error}</p>
  //         <button
  //           onClick={() => window.location.reload()}
  //           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  //         >
  //           Retry
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Document not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {document.solicitationId || 'Untitled Document'}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-slate-500">
                Last edited {formatDate(document.updatedAt)}
              </p>
              {isSaving && (
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              )}
              <span className={`text-xs flex items-center gap-1 ${
                connectionStatus === 'connected' ? 'text-green-600' : 
                connectionStatus === 'connecting' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                }`}></div>
                {connectionStatus}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">
                {activeUsers.length} active
              </span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
              <Download className="w-5 h-5" />
              <span className="font-medium">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section-wise Editor */}
      <div className="max-w-6xl mx-auto p-8">
        <div className="space-y-4">
          {SECTION_CONFIG.map(({ key, title, icon, type }) => {
            const isExpanded = expandedSections.has(key);
            const hasContent = document.content?.[key] !== undefined && document.content?.[key] !== null && document.content?.[key] !== '';
            
            return (
              <div key={key} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button
                  type="button"
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    )}
                    <span className="text-2xl">{icon}</span>
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                  </div>
                  {hasContent && (
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                      ✓ Content Added
                    </span>
                  )}
                </button>
                
                {isExpanded && (
                  <div className="p-6 border-t border-slate-200 bg-slate-50">
                    <SectionEditor
                      sectionKey={key}
                      sectionData={document.content?.[key]}
                      sectionType={type}
                      onChange={(newValue) => handleSectionChange(key, newValue)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SolicitationDocEditor;