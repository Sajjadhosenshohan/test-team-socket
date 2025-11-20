"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Users, Download, Loader2, ChevronDown, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';

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

// Enhanced JSON Editor with better error handling
const JsonEditor = ({ content, onChange, readOnly = false }) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (content !== undefined && !isEditing) {
      try {
        const formatted = JSON.stringify(content, null, 2);
        setJsonText(formatted);
      } catch (err) {
        console.error('Error formatting JSON:', err);
        setJsonText('{}');
      }
    }
  }, [content, isEditing]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setJsonText(newValue);
    setIsEditing(true);
    
    try {
      const parsed = JSON.parse(newValue);
      setError('');
      onChange(parsed);
    } catch (err) {
      setError('Invalid JSON format - will save when valid');
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (error) {
      // Try to parse one more time
      try {
        const parsed = JSON.parse(jsonText);
        setError('');
        onChange(parsed);
      } catch (err) {
        // Revert to original content
        if (content !== undefined) {
          setJsonText(JSON.stringify(content, null, 2));
          setError('');
        }
      }
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={jsonText}
        onChange={handleChange}
        onBlur={handleBlur}
        readOnly={readOnly}
        className={`w-full h-64 p-4 font-mono text-sm border rounded-lg ${
          readOnly ? 'bg-slate-50' : 'bg-white'
        } ${error ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
        placeholder='{"key": "value"}'
      />
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};

// Enhanced Array Editor with better UX
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
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-slate-100 rounded text-sm font-medium text-slate-600">
            {index + 1}
          </div>
          <textarea
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            readOnly={readOnly}
            className="flex-1 px-3 py-2 border rounded-lg bg-white resize-none"
            placeholder={`Item ${index + 1}...`}
            rows={3}
          />
          {!readOnly && (
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      ))}
      {!readOnly && (
        <button
          type="button"
          onClick={addItem}
          className="w-full p-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium"
        >
          + Add Item
        </button>
      )}
    </div>
  );
};

// Enhanced Rich Text Editor
const RichTextEditor = ({ content, onChange, placeholder, readOnly = false }) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const isUpdating = useRef(false);

  useEffect(() => {
    if (editorRef.current && content !== undefined && !isUpdating.current) {
      const currentContent = editorRef.current.innerHTML;
      const newContent = content || '';
      if (currentContent !== newContent) {
        editorRef.current.innerHTML = newContent;
      }
    }
  }, [content]);

  const handleInput = (e) => {
    if (!readOnly) {
      isUpdating.current = true;
      onChange(e.currentTarget.innerHTML);
      setTimeout(() => {
        isUpdating.current = false;
      }, 100);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`p-4 min-h-[300px] outline-none ${
          isFocused ? 'ring-2 ring-indigo-500' : ''
        } ${readOnly ? 'bg-slate-50' : 'bg-white'}`}
        style={{ caretColor: '#4f46e5' }}
        suppressContentEditableWarning
      />
      {!content && !readOnly && !isFocused && (
        <div className="absolute top-4 left-4 text-slate-400 pointer-events-none">
          {placeholder}
        </div>
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
      transports: ['websocket', 'polling'],
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
  }, [currentUser, document]);

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

        console.log('📄 Loaded document:', result.data?.doc);
        setDocument(result.data?.doc);
        setIsLoading(false);

        // Join document room via socket
        if (socketRef.current && !hasJoinedRef.current) {
          hasJoinedRef.current = true;
          
          socketRef.current.emit('join-document', {
            docId: result.data?.doc?.id,
            userId: userResult.result.id,
            userName: userResult.result.firstName || 'Anonymous'
          });

          // Setup socket listeners
          setupSocketListeners(result.data?.doc, userResult.result);
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
        setDocument(prev => ({ 
          ...prev, 
          content: typeof data.content === 'string' ? JSON.parse(data.content) : data.content 
        }));
      }
    });

    socketRef.current.on('document-updated', (data) => {
      console.log('📝 Document updated from socket', data);
      if (data.userId !== user.id && data.content) {
        setDocument(prev => ({ 
          ...prev, 
          content: typeof data.content === 'string' ? JSON.parse(data.content) : data.content 
        }));
      }
    });

    socketRef.current.on('active-users', (data) => {
      console.log('👥 Active users:', data.users);
      setActiveUsers(data.users || []);
    });

    socketRef.current.on('user-joined', (data) => {
      console.log('👋 User joined:', data.userName);
      setActiveUsers(prev => {
        const exists = prev.find(u => u.userId === data.userId);
        if (exists) return prev;
        return [...prev, { userId: data.userId, userName: data.userName }];
      });
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
    if (!document || !currentUser || !socketRef.current) {
      console.warn('Cannot save: missing document, user, or socket connection');
      return;
    }

    console.log('📝 Section change:', sectionKey, typeof newValue);

    // Update local state immediately for responsive UI
    setDocument(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [sectionKey]: newValue
      }
    }));

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set saving state
    setIsSaving(true);

    // Debounced save to socket
    saveTimeoutRef.current = setTimeout(() => {
      const updatedContent = {
        ...document.content,
        [sectionKey]: newValue
      };

      console.log('💾 Emitting document update for section:', sectionKey);
      console.log('📦 Updated content:', updatedContent);

      socketRef.current.emit('edit-document', {
        docId: document.id,
        content: updatedContent,
        userId: currentUser.id
      });
    }, 1500); // Increased debounce time for better performance
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
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
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
                <span className="text-xs text-indigo-600 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              )}
              {!isSaving && (
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              )}
              <span className={`text-xs flex items-center gap-1 ${
                connectionStatus === 'connected' ? 'text-emerald-600' : 
                connectionStatus === 'connecting' ? 'text-amber-600' : 'text-red-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 
                  connectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                }`}></div>
                {connectionStatus}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">
                {activeUsers.length + 1} active
              </span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
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
            const sectionData = document.content?.[key];
            
            let hasContent = false;
            if (sectionData !== undefined && sectionData !== null) {
              if (Array.isArray(sectionData)) {
                hasContent = sectionData.length > 0;
              } else if (typeof sectionData === 'object') {
                hasContent = Object.keys(sectionData).length > 0;
              } else {
                hasContent = sectionData !== '';
              }
            }
            
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
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                      ✓ Content Added
                    </span>
                  )}
                </button>
                
                {isExpanded && (
                  <div className="p-6 border-t border-slate-200 bg-slate-50">
                    <SectionEditor
                      sectionKey={key}
                      sectionData={sectionData}
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