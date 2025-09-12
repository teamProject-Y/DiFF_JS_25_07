'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getArticle, modifyArticle } from '@/lib/ArticleAPI';
import dynamic from "next/dynamic";

import clsx from "clsx";
import {useDialog} from "@/common/commonLayout";
import {useTheme} from "@/common/thema";
import { Globe, Lock } from "lucide-react";

export default function ModifyArticlePage() {
    return (
        <Suspense fallback={<div className="p-4 text-sm text-neutral-500">Loading…</div>}>
            <ModifyArticlePageInner />
        </Suspense>
    );
}

function ModifyArticlePageInner() {
    const router = useRouter();
    const { alert } = useDialog();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const ToastEditor = dynamic(() => import("@/common/toastEditor"), { ssr: false });
    const [article, setArticle] = useState(null);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertCfg, setAlertCfg] = useState({});

    const bg = useTheme() === 'dark' ? '#111214' : '#ffffff';

    // Load & permission check
    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const art = await getArticle(id);
                if (!art?.userCanModify) {
                    alert({ intent: "danger", title: "You do not have permission to edit this article." });
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
                    alert({ intent: "danger", title: "You need to sign in." });
                    router.replace('/DiFF/member/login');
                } else if (status === 403) {
                    alert({ intent: "danger", title: "You do not have permission to edit this article." });
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
                alert({ intent: "danger", title: "Invalid access. Retry again." });
                return;
            }
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert({ intent: "danger", title: "You need to sign in." });
                router.replace('/DiFF/member/login');
                return;
            }
            if (!title.trim()) {
                alert({ intent: "warning", title: "Please enter title." });
                return;
            }
            if (!body.trim()) {
                alert({ intent: "warning", title: "Please enter content." });
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
            alert({ intent: "success", title: "Updated successfully." });
            router.push(`/DiFF/article/detail?id=${id}`);
        } catch (e) {
            console.error('❌ Update failed:', e);
            alert({ intent: "danger", title: "Failed to update. Please try again." });
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

                        {/* Visibility */}
                    <div className="flex items-center gap-2 mx-5">
                        <button
                            type="button"
                            onClick={() => setIsPublic(!isPublic)}
                            aria-pressed={isPublic}
                            aria-label={isPublic ? 'Public' : 'Private'}
                            title={isPublic ? 'Public' : 'Private'}
                            className="inline-flex items-center justify-center gap-2 rounded-full border w-24 py-1.5 text-sm transition border-neutral-200 bg-white text-neutral-700 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:focus-visible:ring-neutral-600"
                        >
                            {isPublic ? (
                                // Globe icon for Public
                                <Globe
                                className={`w-4 h-4`}
                                strokeWidth={2}
                                />
                            ) : (
                                // Lock icon for Private
                                <Lock
                                    className={`w-4 h-4`}
                                    strokeWidth={2}
                                />
                            )}
                            <span>{isPublic ? 'Public' : 'Private'}</span>
                        </button>
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

                <div className="sticky bottom-0 z-50 w-full p-3 border-t bg-gray-100 dark:bg-neutral-900 dark:border-neutral-700">
                    <div className="flex justify-end gap-5">
                        <Link
                            href={`/DiFF/article/detail?id=${id}`}
                            className="rounded-md border px-5 py-2 font-medium border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100/60 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                            Cancel
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

            <style jsx global>{`
                /* ---- Frame: editor full height + sticky toolbar ---- */
                .toastui-editor-defaultUI {
                    height: 100% !important;
                    display: flex;
                    flex-direction: column;
                    border: 0 !important;
                }
                .toastui-editor-toolbar {
                    position: sticky;
                    top: 0;
                    z-index: 30;
                    flex: 0 0 auto;
                    background: inherit;
                }

                /* ---- Main takes the scroll (ONLY here) ---- */
                .toastui-editor-main {
                    flex: 1 1 auto !important;
                    min-height: 0 !important;
                    overflow: auto !important;   /* ← 여기만 스크롤 */
                }

                /* 메인 내부 컨테이너/패널이 메인 높이를 정확히 채우도록 */
                .toastui-editor-main-container {
                    display: flex !important;
                    height: 100% !important;
                    min-height: 0 !important;
                }
                .toastui-editor-md-container.toastui-editor-md-vertical-style,
                .toastui-editor-preview.toastui-editor-vertical-style {
                    flex: 1 1 0% !important;
                    height: 100% !important;
                    min-height: 0 !important;
                }

                /* ---- Markdown pane: CodeMirror는 'auto-height', 내부 스크롤 제거 ---- */
                .toastui-editor-md-container .CodeMirror {
                    height: auto !important;              /* 내용 길이에 맞춰 늘어남 */
                }
                .toastui-editor-md-container .CodeMirror-scroll {
                    overflow-y: hidden !important;        /* 내부 스크롤 금지 (수직) */
                    overflow-x: auto !important;          /* 수평 스크롤만 허용 */
                    min-height: 100% !important;          /* 클릭 영역이 패널 높이만큼 확보 */
                }

                /* ---- WYSIWYG pane도 내부 스크롤 제거 ---- */
                .toastui-editor-ww-container .ProseMirror {
                    height: auto !important;
                    min-height: 100% !important;
                    overflow: visible !important;
                }

                /* 탭(Write/Preview) 숨김 */
                .toastui-editor-defaultUI .toastui-editor-tabs {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
