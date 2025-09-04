// src/app/DiFF/article/write/page.js
'use client';
import { getDraftById, saveDraft } from "@/lib/DraftAPI";
import { Suspense, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { writeArticle, getMyRepositories } from '@/lib/ArticleAPI';
import dynamic from 'next/dynamic';
import clsx from "clsx";

const ToastEditor = dynamic(() => import('@/common/toastEditor'), {ssr: false});

function RepoDropdown({ items = [], value, onChange }) {
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

    // 외부 클릭으로 닫기
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

    // 키보드 접근성
    const onKeyDown = useCallback(
        (e) => {
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
                    onChange?.(id);
                    setOpen(false);
                    btnRef.current?.focus();
                }
            }
        },
        [open, onChange]
    );

    return (
        <div className="relative" onKeyDown={onKeyDown}>
            {/* 트리거 버튼 */}
            <button
                type="button"
                ref={btnRef}
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="
                  w-full rounded border px-4 py-3 text-left text-sm
                  border-neutral-300 bg-neutral-100/70 text-neutral-900
                  outline-none transition hover:bg-neutral-100 focus:border-neutral-600
                  pr-10
                  dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100
                "
            >
                {label}
                <i className="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
            </button>

            {/* 드롭다운 메뉴 */}
            {open && (
                <ul
                    ref={menuRef}
                    role="listbox"
                    className="
                        absolute right-0 top-full mt-1 w-full
                        rounded border border-neutral-200 bg-gray-50 backdrop-blur
                        shadow-lg z-50 max-h-60 overflow-auto
                        dark:border-neutral-700 dark:bg-neutral-900
                      "
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
                                    onChange?.(id);
                                    setOpen(false);
                                    btnRef.current?.focus();
                                }}
                                className={`
                                      flex cursor-pointer items-center justify-between px-3 py-2 text-sm
                                      text-neutral-800 dark:text-neutral-200 
                                      ${isSelected ? "font-medium bg-neutral-200 dark:bg-neutral-700" 
                                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}
                                    `}
                            >
                                <span className="truncate">{text}</span>
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
        <Suspense fallback={<div className="p-4">Loading…</div>}>
            <WriteArticlePage/>
        </Suspense>
    );
}

export function WriteArticlePage() {
    const router = useRouter();
    const sp = useSearchParams();

    // 쿼리스트링
    const repoFromQuery = sp.get('repositoryId');

    // 상태
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

    // 로그인 체크
    useEffect(() => {
        const token = typeof window !== 'undefined' && localStorage.getItem('accessToken');
        if (!token) router.replace('/DiFF/member/login');
    }, [router]);

    // draftId 있으면 임시저장 불러오기
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
                        console.log("📥 draft.diffId 세팅:", draft.diffId);
                    }
                } catch (e) {
                    console.error("임시저장 불러오기 실패:", e);
                }
            })();
        }
    }, [draftId]);

    // 내 리포 목록 불러오기
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

    // SHA-256 체크섬
    const makeChecksum = useCallback(async (text) => {
        if (!text) return '';
        const enc = new TextEncoder().encode(text);
        const buf = await crypto.subtle.digest('SHA-256', enc);
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }, []);

    // 게시물 작성
    // 게시물 작성
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        console.log("🚀 [handleSubmit] 실행됨");
        console.log("📌 현재 상태:", {
            repositoryId,
            title,
            bodyLength: body?.length,
            draftId,
            diffId
        });

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

            console.log("📤 [handleSubmit] 서버로 보낼 data:", data);

            const res = await writeArticle(data);

            console.log("📥 [handleSubmit] 서버 응답 전체:", res);

            if (res?.resultCode?.startsWith('S-')) {
                const articleId = res.data1; // 서버가 반환한 id
                router.push(`/DiFF/article/detail?id=${articleId}`);
            }
            else {
                console.error("❌ [handleSubmit] 작성 실패 응답:", res);
                setError(res?.msg || '작성 실패');
            }
        } catch (err) {
            console.error("💥 [handleSubmit] 요청 실패", err);

            if (err?.response) {
                console.error("📥 서버 에러 응답:", err.response);
                console.error("📥 서버 에러 data:", err.response.data);
                console.error("📥 서버 에러 status:", err.response.status);
                console.error("📥 서버 에러 headers:", err.response.headers);
            } else {
                console.error("📥 네트워크 에러 or axios 설정 문제:", err.message);
            }

            if (err?.response?.status === 401) {
                router.replace('/DiFF/member/login');
            } else {
                setError(err?.response?.data?.msg || err.message || '요청 실패');
            }
        } finally {
            console.log("🔚 [handleSubmit] 종료 (submitting=false)");
            setSubmitting(false);
            setSubmittingType(null);
        }
    };


    const handleSaveDraft = async (e) => {
        e.preventDefault();
        setError('');

        if (!repositoryId) return setError('repositoryId가 없습니다.');
        if (!title.trim() && !body.trim()) return setError('빈 글은 저장할 수 없습니다.');

        try {
            setSubmitting(true);
            setSubmittingType('save');
            const checksum = await makeChecksum(body);

            const data = {
                id: draftId ? Number(draftId) : null, // 새 글이면 null
                title,
                body,
                checksum,
                repositoryId: Number(repositoryId),
                isPublic: isPublic,
            };

            const res = await saveDraft(data);

            console.log("💾 saveDraft 응답:", res);

            if (res && res.resultCode && res.resultCode.startsWith("S-")) {
                alert("임시저장 완료!");

                if (!draftId && res.data1) {
                    setDraftId(res.data1);
                }
                if (res.data2) {
                    setDiffId(res.data2);
                    console.log("💾 diffId 세팅:", res.data2);
                }
            } else {
                console.error("❌ saveDraft 실패 응답:", res);
                setError(res?.msg || "임시저장 실패");
            }
        } catch (err) {
            console.error("💥 saveDraft error:", err);
            if (err?.response?.status === 401) {
                router.replace("/DiFF/member/login");
            } else {
                setError(err?.response?.data?.msg || err.message || "요청 실패");
            }
        } finally {
            setSubmitting(false);
            setSubmittingType(null);
        }
    };




    return (
        <div className="min-h-screen w-full">
            {/* 상단 바/뒤로가기 */}
            <div className="mx-auto max-w-5xl px-4 pt-6">
                <button
                    onClick={() => router.push('/DiFF/member/repository')}
                    className="inline-flex items-center gap-2 rounded border border-neutral-300 bg-white/70 px-3 py-2 text-sm text-neutral-700 backdrop-blur transition hover:bg-white/90 dark:border-neutral-700 dark:bg-neutral-950/30 dark:text-neutral-300 dark:hover:bg-neutral-900/60"
                >
                    <i className="fa-solid fa-angle-left" />
                    <span>Back to Repositories</span>
                </button>
            </div>

            {/* 카드 */}
            <div className="mx-auto max-w-5xl px-4 pb-12 pt-6">
                <div className="rounded-2xl border border-neutral-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/30">
                    {/* 헤더 */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Write Article</h1>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                Select a repository, then add a title and content.
                            </p>
                        </div>
                        {draftId && (
                            <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                Draft #{draftId}
                            </span>
                        )}
                    </div>

                    <div className="mb-5">
                        <label className="mb-1 block text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                            Repository
                        </label>

                        {loadingRepos ? (
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-full animate-pulse rounded bg-neutral-200/70 dark:bg-neutral-800/70" />
                                <div className="h-10 w-24 animate-pulse rounded bg-neutral-200/70 dark:bg-neutral-800/70" />
                            </div>
                        ) : repoError ? (
                            <div className="rounded border border-red-300/60 bg-red-50/50 px-3 py-2 text-sm text-red-700 dark:border-red-800/70 dark:bg-red-950/30 dark:text-red-300">
                                {repoError}
                            </div>
                        ) : repos.length === 0 ? (
                            <div className="rounded border border-yellow-300/60 bg-yellow-50/50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-800/70 dark:bg-yellow-950/30 dark:text-yellow-300">
                                You don’t have any repositories. Please create one first.
                            </div>
                        ) : (
                            <RepoDropdown
                                items={repos}
                                value={repositoryId}
                                onChange={(v) => setRepositoryId(Number(v))}
                            />
                        )}
                    </div>

                    {/* 작성 폼 */}
                    <form onSubmit={handleSubmit} className="space-y-5" aria-live="polite">
                        {/* 제목 */}
                        <div>
                            <label className="mb-1 block text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                Title
                            </label>
                            <input
                                className="w-full rounded border border-neutral-300 bg-neutral-100/70 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100"
                                placeholder="제목"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* 본문 */}
                        <div className="space-y-2">
                            <label className="mb-1 block text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                Content
                            </label>
                            <div className="rounded border border-neutral-300 bg-neutral-100/50 p-2 dark:border-neutral-700 dark:bg-neutral-900/40">
                                {/* ✅ ToastEditor 연결 */}
                                <ToastEditor
                                    initialValue={body}
                                    onChange={(value) => setBody(value)}
                                />
                            </div>
                        </div>
                        {/* 상태 메시지 */}
                        <div className="min-h-[1rem]">
                            {error && (
                                <div className="mt-2 px-3 py-2 text-sm text-red-500">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* 버튼들 */}
                        <div className="flex flex-wrap items-center justify-between gap-3">

                            {/* 공개/비공개 토글 */}
                            <div>
                                <label className="mb-1 block text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                    Visibility
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsPublic(!isPublic)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                                        isPublic ? 'bg-green-500' : 'bg-gray-400'
                                    }`}
                                >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                        isPublic ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                                </button>
                                <span className="ml-3 text-sm text-neutral-700 dark:text-neutral-300">
                                                {isPublic ? '공개' : '비공개'}
                                        </span>
                            </div>

                            <div className="flex gap-2">
                                {/* Upload (Primary) */}
                                <button
                                    type="submit"
                                    disabled={submitting || !repositoryId}
                                    className={clsx(
                                        "group relative inline-flex items-center justify-center gap-2 rounded border px-5 py-2.5 text-sm font-medium transition-all",
                                        "border-neutral-300 bg-neutral-900 text-neutral-100 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]",
                                        "disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-100 dark:text-neutral-900"
                                    )}
                                >
                                    {submitting && submittingType === 'upload' && (
                                        <span className="inline-block h-4 w-4 animate-spin rounded-full border border-neutral-500 border-t-transparent dark:border-neutral-400 dark:border-t-transparent" />
                                    )}
                                    {submitting && submittingType === 'upload' ? 'Uploading…' : 'Upload'}
                                </button>

                                {/* Save Draft (Outline) */}
                                <button
                                    type="button"
                                    onClick={handleSaveDraft}
                                    disabled={submitting || !repositoryId}
                                    className={clsx(
                                        "relative inline-flex items-center justify-center gap-2 rounded border px-5 py-2.5 text-sm font-medium transition-all",
                                        "border-neutral-300 bg-transparent text-neutral-800 hover:bg-neutral-100/60",
                                        "disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900/60"
                                    )}
                                >
                                    {submitting && submittingType === 'save' && (
                                        <span className="inline-block h-4 w-4 animate-spin rounded-full border border-neutral-500 border-t-transparent dark:border-neutral-400 dark:border-t-transparent" />
                                    )}
                                    {submitting && submittingType === 'save' ? 'Saving…' : 'Save'}
                                </button>
                            </div>

                            {/* Go to drafts (Ghost) */}
                            <button
                                type="button"
                                onClick={() => router.push('/DiFF/article/drafts')}
                                className="inline-flex items-center gap-2 rounded px-5 py-2.5 text-sm text-neutral-600 hover:text-neutral-800 hover:underline dark:text-neutral-400 dark:hover:text-neutral-200"
                            >
                                <i className="fa-regular fa-file-lines" />
                                Drafts
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
