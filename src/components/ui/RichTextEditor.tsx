'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Heading from '@tiptap/extension-heading';
import History from '@tiptap/extension-history';
import HardBreak from '@tiptap/extension-hard-break';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import {
    Bold as BoldIcon,
    Italic as ItalicIcon,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Link as LinkIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Undo,
    Redo,
    X,
    Unlink,
    ExternalLink,
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

// Link Popup Component
function LinkPopup({
    isOpen,
    onClose,
    onSubmit,
    onRemove,
    initialUrl,
    position,
    hasLink,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (url: string) => void;
    onRemove: () => void;
    initialUrl: string;
    position: { top: number; left: number };
    hasLink: boolean;
}) {
    const [url, setUrl] = useState(initialUrl);
    const inputRef = useRef<HTMLInputElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setUrl(initialUrl);
    }, [initialUrl]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleSubmit = () => {
        if (url.trim()) {
            let finalUrl = url.trim();
            if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith('mailto:')) {
                finalUrl = 'https://' + finalUrl;
            }
            onSubmit(finalUrl);
        }
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={popupRef}
            className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[300px]"
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <LinkIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {hasLink ? 'Edit Link' : 'Insert Link'}
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="https://example.com"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-3 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md transition-colors"
                    >
                        {hasLink ? 'Update' : 'Add'}
                    </button>
                </div>
                {hasLink && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onRemove}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                            <Unlink className="h-3 w-3" />
                            Remove Link
                        </button>
                        {url && (
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors ml-auto"
                            >
                                <ExternalLink className="h-3 w-3" />
                                Open
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Tulis deskripsi...',
    className = '',
}: RichTextEditorProps) {
    const [linkPopupOpen, setLinkPopupOpen] = useState(false);
    const [linkPopupPosition, setLinkPopupPosition] = useState({ top: 0, left: 0 });
    const [currentLinkUrl, setCurrentLinkUrl] = useState('');
    const [, forceUpdate] = useState(0); // Force re-render trigger
    const linkButtonRef = useRef<HTMLButtonElement>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            Document,
            Paragraph,
            Text,
            Bold,
            Italic,
            Strike,
            Underline,
            BulletList,
            OrderedList,
            ListItem,
            History,
            HardBreak,
            Heading.configure({
                levels: [1, 2, 3],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-brand-500 underline hover:text-brand-600 cursor-pointer',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none min-h-[150px] px-4 py-3 focus:outline-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onTransaction: () => {
            // Force re-render to update toolbar button active states
            forceUpdate(n => n + 1);
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    const openLinkPopup = useCallback(() => {
        if (!editor || !linkButtonRef.current || !editorContainerRef.current) return;

        const buttonRect = linkButtonRef.current.getBoundingClientRect();
        const containerRect = editorContainerRef.current.getBoundingClientRect();

        setLinkPopupPosition({
            top: buttonRect.bottom - containerRect.top + 4,
            left: Math.max(0, buttonRect.left - containerRect.left - 100),
        });

        const currentUrl = editor.getAttributes('link').href || '';
        setCurrentLinkUrl(currentUrl);
        setLinkPopupOpen(true);
    }, [editor]);

    const handleLinkSubmit = useCallback((url: string) => {
        if (!editor) return;
        editor.chain().focus().setLink({ href: url }).run();
    }, [editor]);

    const handleLinkRemove = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().unsetLink().run();
        setLinkPopupOpen(false);
    }, [editor]);

    if (!editor) {
        return null;
    }

    const ToolbarButton = ({
        onClick,
        active,
        disabled,
        children,
        title,
        buttonRef,
    }: {
        onClick: () => void;
        active?: boolean;
        disabled?: boolean;
        children: React.ReactNode;
        title: string;
        buttonRef?: React.Ref<HTMLButtonElement>;
    }) => (
        <button
            ref={buttonRef}
            type="button"
            tabIndex={-1}
            onClick={onClick}
            onMouseDown={(e) => e.preventDefault()}
            disabled={disabled}
            title={title}
            className={`p-1.5 rounded transition-colors ${active
                ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    );

    return (
        <div
            ref={editorContainerRef}
            className={`relative border border-gray-300 dark:border-gray-600 rounded-lg overflow-visible bg-white dark:bg-gray-700 ${className}`}
        >
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo"
                >
                    <Undo className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo"
                >
                    <Redo className="h-4 w-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

                <ToolbarButton
                    onClick={() => {
                        editor.chain().focus().toggleBold().run();
                    }}
                    active={editor.isActive('bold')}
                    title="Bold (Ctrl+B)"
                >
                    <BoldIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => {
                        editor.chain().focus().toggleItalic().run();
                    }}
                    active={editor.isActive('italic')}
                    title="Italic (Ctrl+I)"
                >
                    <ItalicIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => {
                        editor.chain().focus().toggleUnderline().run();
                    }}
                    active={editor.isActive('underline')}
                    title="Underline (Ctrl+U)"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => {
                        editor.chain().focus().toggleStrike().run();
                    }}
                    active={editor.isActive('strike')}
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 className="h-4 w-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    active={editor.isActive({ textAlign: 'left' })}
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    active={editor.isActive({ textAlign: 'center' })}
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    active={editor.isActive({ textAlign: 'right' })}
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

                <ToolbarButton
                    onClick={openLinkPopup}
                    active={editor.isActive('link')}
                    title="Insert Link (Ctrl+K)"
                    buttonRef={linkButtonRef}
                >
                    <LinkIcon className="h-4 w-4" />
                </ToolbarButton>
            </div>

            <LinkPopup
                isOpen={linkPopupOpen}
                onClose={() => setLinkPopupOpen(false)}
                onSubmit={handleLinkSubmit}
                onRemove={handleLinkRemove}
                initialUrl={currentLinkUrl}
                position={linkPopupPosition}
                hasLink={editor.isActive('link')}
            />

            <EditorContent editor={editor} />
        </div>
    );
}
