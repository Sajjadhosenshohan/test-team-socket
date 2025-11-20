"use client";

import { Editor } from '@tiptap/react';

interface TiptapToolbarProps {
    editor: Editor | null;
}

 const TiptapToolbar = ({ editor }: TiptapToolbarProps) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 flex-wrap">
            {/* Text Formatting */}
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive('bold') ? 'bg-blue-100' : ''}`}
                title="Bold"
                type="button"
            >
                <span className="font-bold">B</span>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive('italic') ? 'bg-blue-100' : ''}`}
                title="Italic"
                type="button"
            >
                <span className="italic">I</span>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive('underline') ? 'bg-blue-100' : ''}`}
                title="Underline"
                type="button"
            >
                <span className="underline">U</span>
            </button>

            <div className="w-px h-6 bg-slate-300 mx-1"></div>

            {/* Headings */}
            <button
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive('paragraph') ? 'bg-blue-100' : ''}`}
                title="Normal Text"
                type="button"
            >
                P
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100' : ''}`}
                title="Heading 1"
                type="button"
            >
                H1
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100' : ''}`}
                title="Heading 2"
                type="button"
            >
                H2
            </button>

            <div className="w-px h-6 bg-slate-300 mx-1"></div>

            {/* Lists */}
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-blue-100' : ''}`}
                title="Bullet List"
                type="button"
            >
                • List
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-blue-100' : ''}`}
                title="Numbered List"
                type="button"
            >
                1. List
            </button>

            <div className="w-px h-6 bg-slate-300 mx-1"></div>

            {/* Alignment */}
            <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100' : ''}`}
                title="Align Left"
                type="button"
            >
                ←
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100' : ''}`}
                title="Align Center"
                type="button"
            >
                ↔
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 hover:bg-slate-200 rounded transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100' : ''}`}
                title="Align Right"
                type="button"
            >
                →
            </button>

            <div className="w-px h-6 bg-slate-300 mx-1"></div>

            {/* Text Color */}
            <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600">Color:</label>
                <input
                    type="color"
                    onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                    className="w-8 h-8 rounded cursor-pointer"
                    title="Text Color"
                />
            </div>

            {/* Preset Colors */}
            <div className="flex items-center gap-1 ml-2">
                {['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map(color => (
                    <button
                        key={color}
                        onClick={() => editor.chain().focus().setColor(color).run()}
                        className="w-6 h-6 rounded border-2 border-slate-300 hover:border-slate-400 transition-colors"
                        style={{ backgroundColor: color }}
                        title={`Apply ${color}`}
                        type="button"
                    />
                ))}
            </div>
        </div>
    );
};

export default TiptapToolbar;