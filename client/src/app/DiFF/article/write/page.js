'use client';

import {getDraftById, saveDraft} from "@/lib/DraftAPI";
import {Suspense, useEffect, useState, useCallback, useMemo, useRef, useLayoutEffect} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {writeArticle, getMyRepositories} from '@/lib/ArticleAPI';
import dynamic from 'next/dynamic';
import clsx from "clsx";
import {useDialog} from "@/common/commonLayout";
import {useTheme} from "@/common/thema";
import {Globe, Lock} from "lucide-react";
import { createPortal } from 'react-dom';

const ToastEditor = dynamic(() => import('@/common/toastEditor'), {ssr: false});

function InlinePortal({ children }) {
    const [mount, setMount] = useState(null);
    useEffect(() => { setMount(document.body); }, []);
    if (!mount) return null;
    return createPortal(children, mount);
}

function RepoDropdown({items = [], value, onChange, disabled}) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const menuRef = useRef(null);
    const [pos, setPos] = useState({left: 0, top: 0, width: 0});

    const selected = useMemo(
        () => items.find((r) => Number(r.id) === Number(value)),
        [items, value]
    );

    const label = selected
        ? (selected.name || selected.repoName || `Repo#${selected.id}`)
        : "Select a repository";

    useEffect(() => {
        function onDocClick(e) {
            if (!open) return;
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                btnRef.current &&
                !btnRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [open]);

    useLayoutEffect(() => {
           if (!open || !btnRef.current) return;
           const update = () => {
                 const r = btnRef.current.getBoundingClientRect();
                 setPos({ left: r.left, top: r.bottom + 4, width: r.width });
               };
           update();
           window.addEventListener('scroll', update, true); // 내부 스크롤까지
           window.addEventListener('resize', update);
           return () => {
                 window.removeEventListener('scroll', update, true);
                 window.removeEventListener('resize', update);
               };
         }, [open]);

    const onKeyDown = useCallback(
        (e) => {
            if (disabled) return;
            if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                setOpen(true);
                return;
            }
            if (!open) return;

            const options = Array.from(menuRef.current?.querySelectorAll("[role='option']") || []);
            const currentIndex = options.findIndex((el) => el === document.activeElement);
            if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
                btnRef.current?.focus();
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                const next = options[Math.min(currentIndex + 1, options.length - 1)] || options[0];
                next?.focus();
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                const prev = options[Math.max(currentIndex - 1, 0)] || options[options.length - 1];
                prev?.focus();
            } else if (e.key === "Enter") {
                e.preventDefault();
                const id = document.activeElement?.getAttribute("data-value");
                if (id != null) {
                    onChange?.(Number(id));
                    setOpen(false);
                    btnRef.current?.focus();
                }
            }
        },
        [open, onChange, disabled]
    );

    return (
        <div className="relative" onKeyDown={onKeyDown}>
            <button
                type="button"
                ref={btnRef}
                onClick={() => !disabled && setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                disabled={disabled}
                className={clsx(
                    "h-9 min-w-[12rem] truncate rounded-md border px-3 text-left text-sm",
                    "border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50",
                    "outline-none focus:border-neutral-600",
                    "dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-950/60",
                    disabled && "opacity-60 cursor-not-allowed"
                )}
            >
                {label}
                <i className="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 dark:text-neutral-500"/>
            </button>

            {open && (
                <InlinePortal>
                <ul
                    ref={menuRef}
                    role="listbox"
                    style={{ position: 'fixed', left: pos.left, top: pos.top, width: pos.width }}
                    className="z-[999] mt-1 max-h-64 max-w-[70vw] overflow-auto rounded-md border shadow-lg
                      border-neutral-200 bg-white/95 backdrop-blur-sm
                      dark:border-neutral-700 dark:bg-neutral-900/95"
                >
                    {items.map((r) => {
                        const id = String(r.id);
                        const text = r.name || r.repoName || `Repo#${r.id}`;
                        const isSelected = String(value) === id;
                        return (
                            <li
                                key={id}
                                role="option"
                                aria-selected={isSelected}
                                tabIndex={0}
                                data-value={id}
                                onClick={() => {
                                    onChange?.(Number(id));
                                    setOpen(false);
                                    btnRef.current?.focus();
                                }}
                                className={clsx(
                                    "flex cursor-pointer items-center justify-between px-3 py-2 text-sm",
                                    "text-neutral-800 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800",
                                    isSelected && "bg-neutral-200/70 dark:bg-neutral-700/60"
                                )}
                            >
                                <span className="truncate">{text}</span>
                                {isSelected && <i className="fa-solid fa-check text-xs opacity-70"/>}
                            </li>
                        );
                    })}
                </ul>
                </InlinePortal>
            )}
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="p-4 text-sm">Loading…</div>}>
            <WriteArticlePage/>
        </Suspense>
    );
}

export function WriteArticlePage() {
    const router = useRouter();
    const { alert } = useDialog();
    const sp = useSearchParams();
    const [draftLoading, setDraftLoading] = useState(!!sp.get('draftId'));
    const [editorKey, setEditorKey] = useState('empty');

    const repoFromQuery = sp.get('repositoryId');

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [repos, setRepos] = useState([]);
    const [repositoryId, setRepositoryId] = useState(null);
    const [loadingRepos, setLoadingRepos] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submittingType, setSubmittingType] = useState(null);
    const [error, setError] = useState('');
    const [repoError, setRepoError] = useState('');
    const [draftId, setDraftId] = useState(sp.get('draftId'));
    const [diffId, setDiffId] = useState(null);
    const [isPublic, setIsPublic] = useState(true);

    useEffect(() => {
        const token = typeof window !== 'undefined' && localStorage.getItem('accessToken');
        if (!token) router.replace('/DiFF/member/login');
    }, [router]);

    useEffect(() => {
        let alive = true;
            (async () => {
                  if (!draftId) { setDraftLoading(false); return; }
                  setDraftLoading(true);
                  try {
                        const draft = await getDraftById(draftId);
                        if (!alive) return;
                        setIsPublic(draft.isPublic ?? true);
                        setTitle(draft.title || '');
                        setBody(draft.body || '');
                        setRepositoryId(draft.repositoryId || null);
                        if (draft.diffId) setDiffId(draft.diffId);
                            const ver = draft.checksum || draft.updatedAt || Date.now();
                        setEditorKey(`draft-${draftId}-${ver}`);
                      } catch (e) {
                        console.error('Failed to load draft:', e);
                      } finally {
                        if (alive) setDraftLoading(false);
                      }
                })();
            return () => { alive = false; };
    }, [draftId]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoadingRepos(true);
                setRepoError('');
                const list = await getMyRepositories();
                if (!mounted) return;
                setRepos(list);
                const init =
                    (repoFromQuery && Number(repoFromQuery)) ||
                    (list.length > 0 ? Number(list[0].id) : null);
                setRepositoryId(init);
            } catch (e) {
                setRepoError('Failed to load repository list.');
            } finally {
                setLoadingRepos(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [repoFromQuery]);

    async function makeChecksum(text) {
        if (!text) return "";

        if (typeof window === "undefined" || !window.crypto?.subtle) {
            console.warn("❌ crypto.subtle 미지원");
            return "";
        }

        const enc = new TextEncoder().encode(text);
        const buf = await crypto.subtle.digest("SHA-256", enc);
        return Array.from(new Uint8Array(buf))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!repositoryId) return setError('Not found repository.');
        if (!title.trim()) return setError('Please enter the title.');
        if (!body.trim()) return setError('Please enter the content.');

        try {
            setSubmitting(true);
            setSubmittingType('upload');
            const checksum = await makeChecksum(body);
            const data = {
                title,
                body,
                checksum,
                repositoryId: Number(repositoryId),
                draftId: draftId ? Number(draftId) : null,
                diffId: diffId ? Number(diffId) : null,
                isPublic: isPublic,
            };
            const res = await writeArticle(data);
            if (res?.resultCode?.startsWith('S-')) {
                const articleId = res.data1;
                setTimeout(() => router.push(`/DiFF/article/detail?id=${articleId}`), 0);
            } else {
                setError(res?.msg || 'Failed to write');
            }
        } catch (err) {
            console.error('upload error', err);
            if (err?.response?.status === 401) {
                router.replace('/DiFF/member/login');
            } else {
                setError(err?.response?.data?.msg || err.message || 'Failed to request');
            }
        } finally {
            setSubmitting(false);
            setSubmittingType(null);
        }
    };

    const handleSaveDraft = async (e) => {
        e?.preventDefault?.();
        setError('');

        if (!repositoryId) return setError('Can\'t find repository.');
        if (!title.trim() && !body.trim()) return setError('Can\'t save empty post');

        try {
            setSubmitting(true);
            setSubmittingType('save');
            const checksum = await makeChecksum(body);
            const data = {
                id: draftId ? Number(draftId) : null,
                title,
                body,
                checksum,
                repositoryId: Number(repositoryId),
                isPublic: isPublic,
            };
            const res = await saveDraft(data);
            if (res && res.resultCode && res.resultCode.startsWith('S-')) {
                alert({ intent: "success", title: "Success to save." });
                if (!draftId && res.data1) setDraftId(res.data1);
                if (res.data2) setDiffId(res.data2);
            } else {
                setError(res?.msg || 'Failed to save');
            }
        } catch (err) {
            console.error('saveDraft error', err);
            if (err?.response?.status === 401) {
                router.replace('/DiFF/member/login');
            } else {
                setError(err?.response?.data?.msg || err.message || 'Failed to reqeust');
            }
        } finally {
            setSubmitting(false);
            setSubmittingType(null);
        }
    };

    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                if (!submitting) handleSaveDraft(e);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!submitting) {
                    const form = document.getElementById('writer-form');
                    form?.dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}));
                }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [submitting, handleSaveDraft]);

    return (
        <div
            className={clsx(
                "fixed inset-0 flex flex-col",
                "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-300"
            )}
        >
            <form
                id="writer-form"
                onSubmit={handleSubmit}
                className="flex-1 flex flex-col min-h-0"
                aria-live="polite"
            >
                <div
                    className={clsx(
                        "sticky inset-x-0 top-0 z-40 border-b p-3",
                        "border-neutral-200 dark:border-neutral-700",
                        "bg-white dark:bg-neutral-900"
                    )}
                >
                    <div className="flex-1">
                        <input
                            className={clsx(
                                "w-full truncate rounded p-3 text-5xl font-semibold",
                                "bg-transparent border-transparent focus:outline-none",
                                "placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                            )}
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        {/* Repo */}
                        <div className="col-span-12 sm:col-span-4 md:col-span-3 flex items-center gap-2">
                            {loadingRepos ? (
                                <div className="h-9 w-48 animate-pulse rounded-md bg-neutral-200/70 dark:bg-neutral-800/70" />
                            ) : repoError ? (
                                <div className="truncate text-xs text-red-500">{repoError}</div>
                            ) : repos.length === 0 ? (
                                <div className="truncate text-xs text-yellow-700 dark:text-yellow-300">
                                    No repositories. Create one first.
                                </div>
                            ) : (
                                <RepoDropdown
                                    items={repos}
                                    value={repositoryId}
                                    onChange={(v) => setRepositoryId(Number(v))}
                                />
                            )}
                        </div>

                        <div className="col-span-12 sm:col-span-3 md:col-span-3 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsPublic(!isPublic)}
                                aria-pressed={isPublic}
                                aria-label={isPublic ? 'Public' : 'Private'}
                                title={isPublic ? 'Public' : 'Private'}
                                className="inline-flex items-center justify-center gap-2 rounded-full border w-24 py-1.5 text-sm transition border-neutral-200 bg-white text-neutral-700 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:focus-visible:ring-neutral-600"
                            >
                                {isPublic ? <Globe className="w-4 h-4" strokeWidth={2} /> : <Lock className="w-4 h-4" strokeWidth={2} />}
                                <span>{isPublic ? 'Public' : 'Private'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push("/DiFF/article/drafts")}
                                className="btn2"
                            >
                                Drafts
                            </button>
                        </div>
                    </div>
                </div>

                {!!error && (
                    <div className="border-b border-red-200/60 bg-red-50/70 px-3 py-1.5 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                        {error}
                    </div>
                )}

                <div className="flex-1 overflow-hidden">
                    <div className="h-full w-full">
                        {!draftLoading && (
                                    <ToastEditor
                                      key={editorKey}
                                      initialValue={body}
                                      onChange={(value) => setBody(value)}
                                      height="100%"
                                    />
                                  )}
                    </div>
                </div>

                <div className="sticky bottom-0 z-50 w-full border-t p-3 bg-white dark:bg-neutral-900 dark:border-neutral-700">
                    <div className="flex justify-end gap-5">
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={submitting || !repositoryId}
                            className={clsx(
                                "rounded-md border px-5 py-2 font-medium",
                                "border-neutral-300 bg-transparent text-neutral-800 hover:bg-neutral-100/60",
                                "disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            )}
                        >
                            {submitting && submittingType === "save" ? "Saving…" : "Save"}
                        </button>

                        <button
                            type="submit"
                            disabled={submitting || !repositoryId}
                            className={clsx(
                                "rounded-md border px-5 py-2 font-medium",
                                "bg-gray-900 text-white hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]",
                                "disabled:opacity-50 dark:border-neutral-300 dark:bg-neutral-300 dark:text-neutral-900"
                            )}
                        >
                            {submitting && submittingType === "upload" ? "Uploading…" : "Upload"}
                        </button>
                    </div>
                </div>
            </form>

            <style jsx global>{`
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
                
                .toastui-editor-main {
                    flex: 1 1 auto !important;
                    min-height: 0 !important;
                    overflow: auto !important; 
                }
                
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
                
                .toastui-editor-md-container .CodeMirror {
                    height: auto !important;              
                }
                .toastui-editor-md-container .CodeMirror-scroll {
                    overflow-y: hidden !important;        
                    overflow-x: auto !important;          
                    min-height: 100% !important;          
                }
                
                .toastui-editor-ww-container .ProseMirror {
                    height: auto !important;
                    min-height: 100% !important;
                    overflow: visible !important;
                }
                
                .toastui-editor-defaultUI .toastui-editor-tabs {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
