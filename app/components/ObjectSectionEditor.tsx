// "use client";

// import React, { useState, useCallback } from 'react';
// import { ChevronDown, ChevronRight } from 'lucide-react';

// interface ObjectSectionEditorProps {
//     title: string;
//     content: any;
//     onContentChange: (key: string, content: any) => void;
//     sectionKey: string;
//     isExpanded: boolean;
//     onToggle: () => void;
// }

//  const ObjectSectionEditor = React.memo(({
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

// export default ObjectSectionEditor;

"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ObjectSectionEditorProps {
    title: string;
    content: any;
    onContentChange: (key: string, content: any) => void;
    sectionKey: string;
    isExpanded: boolean;
    onToggle: () => void;
    hasUnsavedChanges: boolean;
    onUnsavedChange: (hasChanges: boolean) => void;
}

export const ObjectSectionEditor = React.memo(({
    title,
    content,
    onContentChange,
    sectionKey,
    isExpanded,
    onToggle,
    hasUnsavedChanges,
    onUnsavedChange
}: ObjectSectionEditorProps) => {
    const [localContent, setLocalContent] = useState(content || {});
    const lastSavedContentRef = useRef(JSON.stringify(content || {}));

    const handleFieldChange = useCallback((field: string, value: string) => {
        const updatedContent = {
            ...localContent,
            [field]: value
        };
        setLocalContent(updatedContent);
        onContentChange(sectionKey, updatedContent);

        // Check for unsaved changes
        const currentContentStr = JSON.stringify(updatedContent);
        if (currentContentStr !== lastSavedContentRef.current) {
            onUnsavedChange(true);
        }
    }, [localContent, onContentChange, sectionKey, onUnsavedChange]);

    // Reset unsaved changes when document is saved
    useEffect(() => {
        if (!hasUnsavedChanges) {
            lastSavedContentRef.current = JSON.stringify(localContent);
        }
    }, [hasUnsavedChanges, localContent]);

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

            {isExpanded && (
                <div className="border-t border-slate-200 p-6 space-y-4">
                    {Object.keys(localContent).map(field => (
                        <div key={field} className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 capitalize">
                                {field.replace(/_/g, ' ')}
                            </label>
                            <input
                                type="text"
                                value={localContent[field] || ''}
                                onChange={(e) => handleFieldChange(field, e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                placeholder={`Enter ${field.replace(/_/g, ' ')}...`}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

ObjectSectionEditor.displayName = 'ObjectSectionEditor';

export default ObjectSectionEditor;