'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getArticle, modifyArticle } from '@/lib/ArticleAPI';
import LoadingOverlay from '@/common/loadingOverlay';
import ToastEditor from "@/common/toastEditor";

export default function ModifyArticlePage() {
    return (
        <Suspense fallback={<div className="p-4 text-sm text-neutral-500">Loading…</div>}>
            <ModifyArticlePageInner />
        </Suspense>
    );
}

function ModifyArticlePageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [article, setArticle] = useState(null);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Load & permission check
    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const art = await getArticle(id); // token is attached automatically
                if (!art?.userCanModify) {
                    alert('You do not have permission to edit this article.');
                    router.replace(`/DiFF/article/detail?id=${id}`);
                    return;
                }
                setArticle(art);
                setTitle(art.title ?? '');
                setBody(art.body ?? '');
            } catch (e) {
                const status = e?.response?.status;
                if (status === 401) {
                    alert('You need to sign in.');
                    router.replace('/DiFF/member/login');
                } else if (status === 403) {
                    alert('You do not have permission to edit this article.');
                    router.replace(`/DiFF/article/detail?id=${id}`);
                } else {
                    console.error('[ModifyArticle] load error:', e);
                    setErrMsg('Failed to load the article.');
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [id, router]);

    // Submit update
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!id) {
                alert('Invalid access. No article id.');
                return;
            }
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('You need to sign in.');
                router.replace('/DiFF/member/login');
                return;
            }
            if (!title.trim()) {
                alert('Please enter a title.');
                return;
            }
            if (!body.trim()) {
                alert('Please enter content.');
                return;
            }

            setSubmitting(true);

            const modifiedArticle = {
                id: Number(id),
                title,
                body,
                userCanModify: true,
            };

            const modifyRd = await modifyArticle(modifiedArticle, token);
            console.log(modifyRd);
            alert('Updated successfully.');
            router.push(`/DiFF/article/detail?id=${id}`);
        } catch (e) {
            console.error('❌ Update failed:', e);
            alert('Failed to update. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-300">
            <LoadingOverlay show={loading} />

            {errMsg ? (
                <div className="mx-auto w-5/6 p-6">
                    <div className="rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
                        {errMsg}
                    </div>
                </div>
            ) : (
                <div className="mx-auto w-5/6 py-6">
                    {/* Top bar */}
                    <div className="mb-4 flex items-center justify-between">
                        <h1 className="text-2xl font-semibold tracking-tight">Edit Article</h1>
                        <Link
                            href={`/DiFF/article/detail?id=${id}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100/60 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900/60"
                        >
                            Cancel
                        </Link>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border border-neutral-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/30">
                        <p className="mb-5 text-sm text-neutral-500 dark:text-neutral-400">
                            Update your title and content, then save changes.
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5" aria-live="polite">
                            {/* Title */}
                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter a title"
                                    className="w-full rounded-xl border border-neutral-300 bg-neutral-100/70 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                    Content
                                </label>
                                <div className="rounded-xl border border-neutral-300 bg-neutral-100/50 p-2 dark:border-neutral-700 dark:bg-neutral-900/40">
                                    <ToastEditor key={id} initialValue={article?.body ?? ''} onChange={setBody} />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="
                                        inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium
                                        border-neutral-300 bg-neutral-900 text-neutral-100 transition-all hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]
                                        disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-100 dark:text-neutral-900
                                      "
                                >
                                    {submitting && (
                                        <span className="inline-block h-4 w-4 animate-spin rounded-full border border-neutral-500 border-t-transparent dark:border-neutral-400 dark:border-t-transparent" />
                                    )}
                                    {submitting ? 'Saving…' : 'Update'}
                                </button>

                                <Link
                                    href={`/DiFF/article/detail?id=${id}`}
                                    className="
                                        inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium
                                        border-neutral-300 text-neutral-800 transition hover:bg-neutral-100/60
                                        dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900/60
                                      "
                                >
                                    Discard
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
