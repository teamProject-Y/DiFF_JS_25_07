'use client';
import { getDraftById, saveDraft } from "@/lib/DraftAPI";
import { Suspense, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { writeArticle, getMyRepositories } from '@/lib/ArticleAPI';
import dynamic from 'next/dynamic';
import clsx from "clsx";

const ToastEditor = dynamic(() => import('@/common/toastEditor'), { ssr: false });

/**
 * Minimal monochrome Repo dropdown (keyboard-accessible)
 */
function RepoDropdown({ items = [], value, onChange, disabled }) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const menuRef = useRef(null);

    const selected = useMemo(
        () => items.find((r) => Number(r.id) === Number(value)),
        [items, value]
    );

    const label = selected
        ? (selected.name || selected.repoName || `Repo#${selected.id}`)
        : "Select a repository";

    // close on outside click
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

    // keyboard
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
                <i className="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 dark:text-neutral-500" />
            </button>

            {open && (
                <ul
                    ref={menuRef}
                    role="listbox"
                    className={clsx(
                        "absolute left-0 top-full z-50 mt-1 w-[24rem] max-w-[70vw] overflow-auto rounded-md border shadow-lg",
                        "max-h-64 border-neutral-200 bg-white/95 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/95"
                    )}
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
                                {isSelected && <i className="fa-solid fa-check text-xs opacity-70" />}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="p-4 text-sm">Loading…</div>}>
            <WriteArticlePage />
        </Suspense>
    );
}

export function WriteArticlePage() {
    const router = useRouter();
    const sp = useSearchParams();

    // from query
    const repoFromQuery = sp.get('repositoryId');

    // state
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

    // auth check
    useEffect(() => {
        const token = typeof window !== 'undefined' && localStorage.getItem('accessToken');
        if (!token) router.replace('/DiFF/member/login');
    }, [router]);

    // load draft if present
    useEffect(() => {
        if (draftId) {
            (async () => {
                try {
                    const draft = await getDraftById(draftId);
                    setIsPublic(draft.isPublic ?? true);
                    setTitle(draft.title || '');
                    setBody(draft.body || '');
                    setRepositoryId(draft.repositoryId || null);
                    if (draft.diffId) {
                        setDiffId(draft.diffId);
                        // console.log("draft.diffId:", draft.diffId);
                    }
                } catch (e) {
                    console.error('Failed to load draft:', e);
                }
            })();
        }
    }, [draftId]);

    // load repos
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
                setRepoError('리포지토리 목록을 불러오지 못했습니다.');
            } finally {
                setLoadingRepos(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [repoFromQuery]);

    // checksum
    const makeChecksum = useCallback(async (text) => {
        if (!text) return '';
        const enc = new TextEncoder().encode(text);
        const buf = await crypto.subtle.digest('SHA-256', enc);
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }, []);

    // submit (upload)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!repositoryId) return setError('repositoryId가 없습니다.');
        if (!title.trim()) return setError('제목을 입력하세요.');
        if (!body.trim()) return setError('내용을 입력하세요.');

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
                router.push(`/DiFF/article/detail?id=${articleId}`);
            } else {
                setError(res?.msg || '작성 실패');
            }
        } catch (err) {
            console.error('upload error', err);
            if (err?.response?.status === 401) {
                router.replace('/DiFF/member/login');
            } else {
                setError(err?.response?.data?.msg || err.message || '요청 실패');
            }
        } finally {
            setSubmitting(false);
            setSubmittingType(null);
        }
    };

    // save draft
    const handleSaveDraft = async (e) => {
        e?.preventDefault?.();
        setError('');

        if (!repositoryId) return setError('repositoryId가 없습니다.');
        if (!title.trim() && !body.trim()) return setError('빈 글은 저장할 수 없습니다.');

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
                alert('임시저장 완료!');
                if (!draftId && res.data1) setDraftId(res.data1);
                if (res.data2) setDiffId(res.data2);
            } else {
                setError(res?.msg || '임시저장 실패');
            }
        } catch (err) {
            console.error('saveDraft error', err);
            if (err?.response?.status === 401) {
                router.replace('/DiFF/member/login');
            } else {
                setError(err?.response?.data?.msg || err.message || '요청 실패');
            }
        } finally {
            setSubmitting(false);
            setSubmittingType(null);
        }
    };

    // shortcuts: Ctrl/Cmd+S save, Ctrl/Cmd+Enter upload
    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                if (!submitting) handleSaveDraft(e);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!submitting) {
                    // create a synthetic form submit
                    const form = document.getElementById('writer-form');
                    form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [submitting, handleSaveDraft]);

    // constant header height (Tailwind h-14 => 56px)
    const headerHClass = 'h-14';

    return (
        <div className={clsx(
            "relative isolate",
            "min-h-dvh h-dvh w-full overflow-hidden",
            "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-300"
        )}>
            <div className="fixed flex justify-end gap-5 bottom-0 w-full z-50 p-3 border-t bg-white dark:bg-neutral-900 dark:border-neutral-700">
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
                    {submitting && submittingType === 'save' ? 'Saving…' : 'Save'}
                </button>

                <button
                    type="submit"
                    disabled={submitting || !repositoryId}
                    className={clsx(
                        "rounded-md border px-5 py-2 font-medium",
                        " bg-gray-900 text-white hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]",
                        "disabled:opacity-50 dark:border-neutral-300 dark:bg-neutral-300 dark:text-neutral-900"
                    )}
                >
                    {submitting && submittingType === 'upload' ? 'Uploading…' : 'Upload'}
                </button>
            </div>
            <form id="writer-form" onSubmit={handleSubmit} className="contents" aria-live="polite">
                <div
                    className={clsx(
                        "sticky inset-x-0 top-0 z-40",
                        headerHClass,
                        "flex items-center gap-5 border-b",
                        "border-neutral-200/70 backdrop-blur supports-[backdrop-filter]:bg-white/60",
                        "dark:border-neutral-800/70 dark:supports-[backdrop-filter]:bg-black/40",
                        "px-3 sm:px-4"
                    )}
                >
                    {/* Repo */}
                    <div className="col-span-12 sm:col-span-4 md:col-span-3 flex items-center gap-2">
                        {loadingRepos ? (
                            <div className="h-9 w-48 animate-pulse rounded-md bg-neutral-200/70 dark:bg-neutral-800/70" />
                        ) : repoError ? (
                            <div className="truncate text-xs text-red-500">{repoError}</div>
                        ) : repos.length === 0 ? (
                            <div className="truncate text-xs text-yellow-700 dark:text-yellow-300">No repositories. Create one first.</div>
                        ) : (
                            <RepoDropdown
                                items={repos}
                                value={repositoryId}
                                onChange={(v) => setRepositoryId(Number(v))}
                            />
                        )}
                        {draftId && (
                            <span className="hidden sm:inline-flex items-center rounded-full border px-2 py-1 text-[10px] tracking-wide text-neutral-500 dark:border-neutral-800/80 dark:text-neutral-400">
                            Draft #{draftId}
                          </span>
                        )}
                    </div>

                    {/* Title */}
                    <div className="flex-1 rounded border dark:border-neutral-700">
                        <input
                            className={clsx(
                                "w-full truncate rounded border p-3 text-lg font-bold",
                                "border-transparent bg-transparent focus:border-neutral-400",
                                "placeholder:text-neutral-400",
                                "dark:placeholder:text-neutral-600"
                            )}
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="col-span-12 sm:col-span-3 md:col-span-3 flex items-center justify-end gap-2">
                        {/* Visibility toggle */}
                        <button
                            type="button"
                            onClick={() => setIsPublic(!isPublic)}
                            className={clsx(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition",
                                isPublic ? 'bg-neutral-900 dark:bg-neutral-100' : 'bg-neutral-300 dark:bg-neutral-700'
                            )}
                            aria-label={isPublic ? 'Public' : 'Private'}
                            title={isPublic ? 'Public' : 'Private'}
                        >
                          <span
                              className={clsx(
                                  "inline-block h-4 w-4 transform rounded-full bg-white transition",
                                  isPublic ? 'translate-x-6' : 'translate-x-1'
                              )}
                          />
                        </button>
                        <span className="hidden md:inline text-xs text-neutral-500">{isPublic ? 'Public' : 'Private'}</span>

                        <button
                            type="button"
                            onClick={() => router.push('/DiFF/article/drafts')}
                            className={clsx(
                                "h-9 rounded-md px-3 text-sm text-neutral-600 hover:text-neutral-900 hover:underline",
                                "dark:text-neutral-400 dark:hover:text-neutral-100"
                            )}
                        >
                            Drafts
                        </button>
                    </div>
                </div>

                {!!error && (
                    <div className="sticky top-14 z-30 w-full border-b border-red-200/60 bg-red-50/70 px-3 py-1.5 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                        {error}
                    </div>
                )}

                <div className={clsx(
                    "absolute inset-x-0 bottom-0",
                    error ? 'top-[calc(56px+28px)]' : 'top-14'
                )}>
                    <div className="h-full w-full overflow-hidden">
                        <div className="h-full w-full overflow-auto px-0">
                            <div className="h-full w-full [--editor-padding:0]">
                                <div className="h-full w-full">
                                    <ToastEditor
                                        initialValue={body}
                                        onChange={(value) => setBody(value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Global tiny CSS to make ToastUI fill its container, keep it borderless for full-bleed feel */}
            <style jsx global>{`
                /* Toast UI Editor: fill parent and scroll INSIDE */
                .toastui-editor-defaultUI{
                    height:100% !important;
                    border:0 !important;
                    display:flex; flex-direction:column;
                }
                .toastui-editor-toolbar{ flex:0 0 auto; }
                .toastui-editor-main{
                    flex:1 1 0% !important;
                    min-height:0 !important;
                    height:auto !important;
                }
                /* both WYSIWYG and Markdown containers fill */
                .toastui-editor-md-container,
                .toastui-editor-ww-container{
                    height:100% !important;
                    min-height:0 !important;
                }
                /* WYSIWYG scroll */
                .toastui-editor-ww-container .ProseMirror{
                    height:100% !important;
                    overflow:auto !important;
                    box-sizing:border-box;
                }
                /* Markdown scroll */
                .toastui-editor-md-container .CodeMirror,
                .toastui-editor-md-container .CodeMirror-scroll{
                    height:100% !important;
                }
                .toastui-editor-md-container .CodeMirror-scroll{
                    overflow:auto !important;
                }
                
                .toastui-editor-main-container {
                    min-height:100% !important;
                }
                
                .toastui-editor-defaultUI .ProseMirror{ padding:24px 20px; }
                @media (min-width:640px){ .toastui-editor-defaultUI .ProseMirror{ padding:12px 12px; 
                min-height:100% !important;} }
                @media (min-width:1024px){ .toastui-editor-defaultUI .ProseMirror{ padding:20px 20px; 
                min-height: 100% !important;} }
            `}</style>
        </div>
    );
}
