'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, CheckCircle, AlertCircle, User, Trash2, AlertTriangle } from 'lucide-react';
import { formatSmartDate } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface Comment {
    id: string;
    name: string;
    email: string | null;
    comment: string;
    created_at: string;
}

interface CommentSectionProps {
    newsId: string;
    initialComments: Comment[];
    isAdmin?: boolean;
}

function getAvatarColor(name: string): string {
    const colors = [
        'text-brand-600 dark:text-brand-400',
        'text-emerald-600 dark:text-emerald-400',
        'text-amber-600 dark:text-amber-400',
        'text-purple-600 dark:text-purple-400',
        'text-rose-600 dark:text-rose-400',
        'text-cyan-600 dark:text-cyan-400',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

export default function CommentSection({ newsId, initialComments, isAdmin = false }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [comment, setComment] = useState('');
    const [honeypot, setHoneypot] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Load saved name/email from localStorage
    useEffect(() => {
        const savedName = localStorage.getItem('comment_name');
        const savedEmail = localStorage.getItem('comment_email');
        if (savedName) setName(savedName);
        if (savedEmail) setEmail(savedEmail);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status === 'loading') return;

        setStatus('loading');
        setErrorMessage('');

        try {
            const res = await fetch(`/api/news/${newsId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    comment: comment.trim(),
                    honeypot,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Gagal mengirim komentar');
            }

            // Save name/email for next time
            localStorage.setItem('comment_name', name.trim());
            localStorage.setItem('comment_email', email.trim());

            // Add the new comment to the list immediately
            const newComment: Comment = {
                id: Date.now().toString(),
                name: name.trim(),
                email: email.trim(),
                comment: comment.trim(),
                created_at: new Date().toISOString(),
            };
            setComments([newComment, ...comments]);

            setComment('');
            setStatus('success');

            setTimeout(() => setStatus('idle'), 5000);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan');
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    const confirmDelete = async () => {
        if (!commentToDelete) return;

        const idToDelete = commentToDelete;
        setCommentToDelete(null); // Close modal immediately
        setDeletingId(idToDelete); // Show spinner on item

        try {
            const res = await fetch(`/api/news/${newsId}/comments/${idToDelete}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Gagal menghapus');
            }

            setComments((prev) => prev.filter((c) => c.id !== idToDelete));
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Gagal menghapus komentar');
        } finally {
            setDeletingId(null);
        }
    };

    const charCount = comment.trim().length;

    return (
        <section id="komentar" className="scroll-mt-24">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10">
                    <MessageCircle className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-outfit">
                        Komentar
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {comments.length > 0
                            ? `${comments.length} komentar`
                            : 'Jadilah yang pertama berkomentar'}
                    </p>
                </div>
            </div>

            {/* Comment Form */}
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="mb-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/2 p-6"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label
                            htmlFor="comment-name"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                        >
                            Nama <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="comment-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            maxLength={100}
                            placeholder="Nama Anda"
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="comment-email"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                        >
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="comment-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            maxLength={255}
                            placeholder="email@contoh.com"
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                        />
                    </div>
                </div>

                {/* Honeypot — hidden from humans */}
                <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    className="absolute opacity-0 pointer-events-none h-0 w-0"
                    aria-hidden="true"
                />

                <div className="mb-4">
                    <label
                        htmlFor="comment-text"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                        Komentar <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="comment-text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        minLength={10}
                        maxLength={1000}
                        rows={4}
                        placeholder="Tulis komentar Anda di sini..."
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all resize-none"
                    />
                    <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs text-gray-400">Min. 10 karakter</p>
                        <p className={`text-xs ${charCount > 900 ? 'text-amber-500' : 'text-gray-400'}`}>
                            {charCount}/1000
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {status === 'success' && (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>Komentar berhasil dikirim</span>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="flex items-center gap-2 text-red-500 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errorMessage}</span>
                        </div>
                    )}
                    {status === 'idle' && <div />}

                    <button
                        type="submit"
                        disabled={status === 'loading' || charCount < 10 || !name.trim() || !email.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-white px-5 py-2.5 text-sm font-medium text-white dark:text-gray-900 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {status === 'loading' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        Kirim Komentar
                    </button>
                </div>
            </form>

            {/* Comment List */}
            {comments.length > 0 && (
                <div className="space-y-0">
                    {comments.map((c, index) => (
                        <div
                            key={c.id}
                            className={`group flex gap-4 py-6 ${index !== comments.length - 1 ? 'border-b border-gray-100 dark:border-gray-800/50' : ''}`}
                        >
                            {/* Avatar — icon only, no circle */}
                            <div className={`shrink-0 pt-0.5 ${getAvatarColor(c.name)}`}>
                                <User className="w-5 h-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {c.name}
                                    </span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        {formatSmartDate(c.created_at)}
                                    </span>

                                    {/* Admin Delete Button */}
                                    {isAdmin && (
                                        <button
                                            onClick={() => setCommentToDelete(c.id)}
                                            disabled={deletingId === c.id}
                                            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 disabled:opacity-50"
                                            title="Hapus komentar"
                                        >
                                            {deletingId === c.id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                                    {c.comment}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {comments.length === 0 && (
                <div className="py-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                    <MessageCircle className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Belum ada komentar. Jadilah yang pertama!
                    </p>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {mounted && commentToDelete && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
                                Hapus Komentar?
                            </h3>
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Tindakan ini tidak dapat dibatalkan. Komentar akan dihapus secara permanen dari database.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCommentToDelete(null)}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
}
