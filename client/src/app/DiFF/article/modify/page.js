'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getArticle, modifyArticle } from '@/lib/ArticleAPI';
import LoadingOverlay from '@/common/loadingOverlay';
import ToastEditor from "@/common/toastEditor";
import clsx from "clsx";

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
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Load & permission check
    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const art = await getArticle(id);
                if (!art?.userCanModify) {
                    alert('You do not have permission to edit this article.');
                    router.replace(`/DiFF/article/detail?id=${id}`);
                    return;
                }
                setArticle(art);
                setTitle(art.title ?? '');
                setBody(art.body ?? '');
                setIsPublic(art.isPublic ?? true);
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
                isPublic,
                userCanModify: true,
            };

            await modifyArticle(modifiedArticle, token);
            alert('Updated successfully.');
            router.push(`/DiFF/article/detail?id=${id}`);
        } catch (e) {
            console.error('❌ Update failed:', e);
            alert('Failed to update. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Shortcuts
    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 's' || e.key === 'Enter')) {
                e.preventDefault();
                if (!submitting) document.getElementById('modify-form')?.requestSubmit?.();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [submitting]);

    return (
        <div className="fixed inset-0 flex flex-col bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-300">

            <form id="modify-form" onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0" aria-live="polite">

                <div
                    className={clsx(
                        "sticky inset-x-0 top-0 z-40 border-b",
                        "border-neutral-200 dark:border-neutral-700",
                        "p-3",
                        "bg-white dark:bg-neutral-900"
                    )}
                >
                    {/* Title */}
                    <div className="flex-1">
                        <input
                            className="w-full truncate rounded p-3 text-5xl font-semibold bg-transparent border-transparent focus:outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <Link
                            href={`/DiFF/article/detail?id=${id}`}
                            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm border-neutral-300 text-neutral-700 hover:bg-neutral-100/60 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                            <i className="fa-solid fa-angle-left"/>
                            Detail
                        </Link>

                        {/* Visibility */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setIsPublic(!isPublic)}
                                aria-label={isPublic ? 'Public' : 'Private'}
                                title={isPublic ? 'Public' : 'Private'}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${isPublic ? 'bg-neutral-900 dark:bg-neutral-100' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            <span className="hidden md:inline text-xs text-neutral-500">{isPublic ? 'Public' : 'Private'}</span>
                        </div>
                    </div>
                </div>

                {!!errMsg && (
                    <div className="border-b border-red-200/60 bg-red-50/70 px-3 py-1.5 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                        {errMsg}
                    </div>
                )}

                <div className="flex-1 overflow-auto pb-20">
                    <div className="h-full w-full">
                        <ToastEditor key={id} initialValue={body} onChange={setBody} height="100%" />
                    </div>
                </div>

                <div className="sticky bottom-0 z-50 w-full p-3 border-t bg-white dark:bg-neutral-900 dark:border-neutral-700">
                    <div className="flex justify-end gap-5">
                        <Link
                            href={`/DiFF/article/detail?id=${id}`}
                            className="rounded-md border px-5 py-2 font-medium border-neutral-300 bg-transparent text-neutral-800 hover:bg-neutral-100/60 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                            Discard
                        </Link>
                        <button
                            type="submit"
                            form="modify-form"
                            disabled={submitting}
                            className="rounded-md border px-5 py-2 font-medium bg-gray-900 text-white hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] disabled:opacity-50 dark:border-neutral-300 dark:bg-neutral-300 dark:text-neutral-900"
                        >
                            {submitting ? 'Saving…' : 'Update'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Global tiny CSS to make ToastUI fill its container, keep it borderless for full-bleed feel */}
            <style jsx global>{`
                /* Toast UI Editor: fill parent and scroll INSIDE */
                .toastui-editor-defaultUI,
                .toastui-editor-main,
                .toastui-editor-ww-container .ProseMirror,
                .toastui-editor-md-container .CodeMirror,
                .toastui-editor-md-container .CodeMirror-scroll {
                    background-color: #111214;
                }

                .toastui-editor-defaultUI {
                    height: 100% !important;
                    border: 0 !important;
                    display: flex;
                    flex-direction: column;

                }

                .toastui-editor-toolbar {
                    flex: 0 0 auto;
                }

                .toastui-editor-main {
                    flex: 1 1 0% !important;
                    min-height: 0 !important;
                    height: auto !important;
                }

                /* both WYSIWYG and Markdown containers fill */
                .toastui-editor-md-container,
                .toastui-editor-ww-container {
                    height: 100% !important;
                    min-height: 0 !important;
                }

                /* WYSIWYG scroll */
                .toastui-editor-ww-container .ProseMirror {
                    height: 100% !important;
                    overflow: auto !important;
                    box-sizing: border-box;
                }

                /* Markdown scroll */
                .toastui-editor-md-container .CodeMirror,
                .toastui-editor-md-container .CodeMirror-scroll {
                    height: 100% !important;
                }

                .toastui-editor-md-container .CodeMirror-scroll {
                    overflow: auto !important;
                }

                .toastui-editor-main-container {
                    min-height: 100% !important;
                }

                .toastui-editor-defaultUI .ProseMirror {
                    padding: 24px 20px;
                }

                @media (min-width: 640px) {
                    .toastui-editor-defaultUI .ProseMirror {
                        padding: 12px 12px;
                        min-height: 100% !important;
                    }
                }

                @media (min-width: 1024px) {
                    .toastui-editor-defaultUI .ProseMirror {
                        padding: 20px 20px;
                        min-height: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
}
