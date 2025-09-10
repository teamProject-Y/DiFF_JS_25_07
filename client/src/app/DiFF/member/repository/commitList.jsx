// member/repository/commitList.jsx
'use client';

import {useEffect, useState, useMemo} from 'react';
import {getGithubCommitList, mkDraft} from '@/lib/RepositoryAPI';

const parseOwnerRepo = (url = '') => {
    try {
        const u = new URL(url);
        const parts = u.pathname.split('/').filter(Boolean);
        if (u.hostname.includes('github.com') && !u.hostname.includes('api.')) {
            return [parts[0], parts[1]];
        }
        if (u.hostname.includes('api.github.com') && parts[0] === 'repos') {
            return [parts[1], parts[2]];
        }
        return [parts[0], parts[1]];
    } catch {
        return [null, null];
    }
};

// ResultData 혹은 axios error에서 code/message 안전 추출
function extractResult(eOrData) {
    const data =
        eOrData?.response?.data ??
        eOrData?.data ??
        eOrData ??
        {};
    const code =
        data.resultCode ??
        eOrData?.resultCode ??
        '';
    const message =
        data.message ??
        eOrData?.message ??
        'Failed to load commits.';

    console.log("data: ", data, " code: ", code, " message : ", message);

    return { code, message };
}

export default function CommitList({ repo, refreshSignal, enabled = true }) {
    const repoId = repo?.id ?? null;
    const repoUrl = repo?.url ?? '';
    const repoDefaultBranch = repo?.defaultBranch || 'main';

    // URL에서 owner/repo 파싱값
    const [ownerFromUrl, nameFromUrl] = useMemo(
        () => parseOwnerRepo(repoUrl),
        [repoUrl]
    );

    // 최종 사용할 owner/name (언더스코어 → 하이픈 치환 포함)
    const safeOwner = useMemo(
        () =>
            (repo?.githubOwner || repo?.owner || ownerFromUrl || '')
                .replace(/_/g, '-'),
        [repo?.githubOwner, repo?.owner, ownerFromUrl]
    );
    const safeName = useMemo(
        () => (repo?.githubName || repo?.name || nameFromUrl || ''),
        [repo?.githubName, repo?.name, nameFromUrl]
    );

    const connected = !!repoUrl;

    // ===== UI 상태 =====
    const [branch, setBranch] = useState(repoDefaultBranch);
    const [page, setPage] = useState(1);
    const perPage = 10;

    const [commits, setCommits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [refreshTick, setRefreshTick] = useState(0);

    const [drafting, setDrafting] = useState(false);
    const uiDisabled = !enabled || loading || drafting;

    // 외부 refreshSignal → 내부 tick 증가
    useEffect(() => {
        if (!enabled) return;
        if (!connected) return;
        if (typeof refreshSignal === 'number') {
            setRefreshTick((n) => n + 1);
        }
    }, [refreshSignal, enabled, connected]);

    // repo.url이 갱신되면(연결 직후) 한 번 더 강제 리프레시
    useEffect(() => {
        if (!enabled) return;
        if (!connected) return;
        setRefreshTick((n) => n + 1);
    }, [repoUrl, enabled, connected]);

    // repo 식별/브랜치 기본값 바뀌면 초기화
    useEffect(() => {
        setBranch(repoDefaultBranch);
        setPage(1);
        setCommits([]);
        setErr(null);
    }, [repoId, repoDefaultBranch]);

    useEffect(() => {
        if (!enabled) return;
        if (!connected) return;

        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setErr(null);

                const repoFixed = {
                    id: repoId,
                    url: repoUrl,
                    owner: safeOwner,
                    name: safeName,
                    githubOwner: safeOwner,
                    githubName: safeName,
                };

                const listOrResult = await getGithubCommitList(repoFixed, {
                    branch,
                    page,
                    perPage,
                });

                // API가 ResultData를 200으로 줄 수도 있으니 방어
                if (!cancelled) {
                    if (Array.isArray(listOrResult)) {
                        setCommits(listOrResult);
                    } else if (listOrResult && typeof listOrResult === 'object') {
                        const { code, message } = extractResult(listOrResult);
                        if (code) {
                            setErr({ code, message });
                            setCommits([]);
                        } else {
                            setCommits([]);
                        }
                    } else {
                        setCommits([]);
                    }
                }
            } catch (e) {
                if (!cancelled) {
                    const { code, message } = extractResult(e);
                    setErr({ code, message });
                    setCommits([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [
        enabled,
        connected,
        repoId,
        repoUrl,
        safeOwner,
        safeName,
        branch,
        page,
        perPage,
        refreshTick,
    ]);

    async function makeDraft(commit) {
        try {
            setDrafting(true);
            return await mkDraft(repoId, safeOwner, safeName, commit.sha);
        } finally {
            setDrafting(false);
        }
    }

    // ===== 파생 상태 =====
    const resultCode = err?.code || '';
    const isNoCommitsF2 = resultCode === 'F-2';
    const isEmptyList = !loading && !err && Array.isArray(commits) && commits.length === 0;

    const ghCommitsUrl =
        safeOwner && safeName
            ? `https://github.com/${safeOwner}/${safeName}/commits/${encodeURIComponent(branch)}`
            : null;

    if (!connected) {
        return <div className="text-sm text-neutral-500">깃허브 연결해야됨</div>;
    }

    return (
        <div className="relative flex flex-col h-full w-full min-h-0 rounded-lg bg-white dark:text-neutral-300 dark:bg-neutral-900/50 dark:border-neutral-700">
            <div className="flex justify-between shrink-0 px-3 py-2 border-b bg-gray-100 dark:bg-neutral-900/70 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                    <span className="text-sm">
                        <i className="fa-solid fa-code-branch"></i> Branch
                    </span>
                    <input
                        value={branch}
                        onChange={(e) => {
                            setPage(1);
                            setBranch(e.target.value.trim());
                        }}
                        placeholder="e.g. main"
                        className="px-2 py-1 rounded-md border text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-neutral-700 dark:bg-neutral-800"
                        style={{ minWidth: 200 }}
                        disabled={!enabled}
                    />
                    <button
                        onClick={() => setRefreshTick((n) => n + 1)}
                        className="px-3 py-1 rounded-lg border text-sm bg-white hover:bg-neutral-100 border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                        disabled={uiDisabled}
                    >
                        Refresh
                    </button>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <button
                        className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50 bg-white border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-700"
                        disabled={page <= 1 || uiDisabled}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Prev
                    </button>
                    <span className="text-xs text-neutral-500">Page {page}</span>
                    <button
                        className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50 bg-white border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-700"
                        disabled={uiDisabled}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>

            {drafting && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg
                    bg-white/50 dark:bg-black/40 backdrop-blur-sm">
                    <div className="px-4 py-2 rounded-md border bg-white dark:bg-neutral-900
                      border-neutral-200 dark:border-neutral-700 shadow">
                        <span className="text-sm">
                          <i className="fa-solid fa-circle-notch fa-spin mr-2" />
                          Creating draft…
                        </span>
                    </div>
                </div>
            )}

            <div className="flex-1 min-h-0 w-full overflow-y-auto px-3">
                {loading && (
                    <div className="h-full w-full flex justify-center items-center text-sm text-neutral-500">
                        Loading commits…
                    </div>
                )}

                {/* F-2 : 커밋 없음 → 멋진 Empty State */}
                {!loading && isNoCommitsF2 && (
                    <div className="h-full flex items-center">
                        <div className="mx-auto rounded-lg border border-dashed w-[90%]
                        border-neutral-300 dark:border-neutral-700 p-8 text-center shadow-sm">
                            <h3 className="mt-4 text-lg font-semibold">No commits found on this branch</h3>
                            <p className="mt-2 text-sm text-neutral-500">
                                The server responded with <span className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">Code F-2</span>.
                                Try switching a branch or reloading.
                            </p>

                            <div className="mt-4 inline-flex items-center gap-2 text-xs text-neutral-500">
                                <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                  <i className="fa-solid fa-code-branch mr-1"></i>
                                    {branch}
                                </span>
                                {safeOwner && safeName && (
                                    <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                        <i className="fa-brands fa-github mr-1"></i>
                                            {safeOwner}/{safeName}
                                    </span>
                                )}
                            </div>

                            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                                <button
                                    onClick={() => setRefreshTick((n) => n + 1)}
                                    className="px-3 py-1.5 rounded-lg border text-sm
                                    bg-white hover:bg-neutral-100 border-neutral-200
                                    dark:bg-neutral-900/50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                                    disabled={uiDisabled}
                                >
                                    Reload
                                </button>
                                {ghCommitsUrl && (
                                    <a
                                        href={ghCommitsUrl}
                                        target="_blank"
                                        className="px-3 py-1.5 rounded-lg border text-sm
                                        bg-neutral-900 text-white hover:opacity-90
                                        dark:bg-neutral-300 dark:text-neutral-900 "
                                        rel="noreferrer"
                                    >
                                        View on GitHub
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 기타 에러(네트워크/권한 등) */}
                {!!err && !isNoCommitsF2 && !loading && (
                    <div className="py-8">
                        <div className="mx-auto max-w-xl flex items-start gap-3 rounded-xl text-red-700 dark:text-red-400 px-4 py-3">
                            <i className="fa-solid fa-triangle-exclamation mt-1"></i>
                            <div className="text-sm leading-relaxed">
                                <div className="font-semibold">
                                    {err.code ? `Error (${err.code})` : 'Error'}
                                </div>
                                <div className="mt-0.5">{err.message}</div>
                                <div className="mt-2 flex gap-2">
                                    <button
                                        onClick={() => setRefreshTick((n) => n + 1)}
                                        className="px-2.5 py-1 rounded-md border text-xs
                                        bg-white hover:bg-neutral-100 border-neutral-200
                                        dark:bg-neutral-900/50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                                        disabled={!enabled}
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 빈 배열(정상 200, 데이터 없음) */}
                {!loading && !err && isEmptyList && (
                    <div className="py-6 text-sm text-neutral-500">
                        No commits in this repository yet
                    </div>
                )}

                {/* 정상 렌더링 */}
                {!loading && !err && !isNoCommitsF2 && !drafting && Array.isArray(commits) && commits.length > 0 && (
                    <ul className="divide-y max-w-full divide-neutral-200 dark:divide-neutral-700">
                        {commits.map((c) => (
                            <li key={c.sha} className="py-4 flex items-start gap-3">
                                <img
                                    src={
                                        c.authorAvatarUrl ||
                                        'https://avatars.githubusercontent.com/u/0?v=4'
                                    }
                                    alt=""
                                    className="w-10 h-10 rounded-full object-cover self-center"
                                />
                                <div className="min-w-0 flex-1 max-w-2/3">
                                    <a
                                        className="font-medium truncate hover:underline clamp-1"
                                        href={c.htmlUrl || '#'}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {c.message || '(no message)'}
                                    </a>
                                    <div className="flex gap-1 text-xs text-neutral-500 mt-0.5">
                                        <span>{c.authorName || c.authorLogin || 'unknown'}</span>
                                        <span>·</span>
                                        <span>
                                          {c.authoredAt
                                              ? new Date(c.authoredAt).toLocaleDateString('en-US', {
                                                  month: 'short',
                                                  day: '2-digit',
                                                  year: 'numeric',
                                              })
                                              : ''}
                                        </span>
                                        <span>·</span>
                                        <span>{String(c.sha).slice(0, 6)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => makeDraft(c)}
                                    className="shrink-0 px-3 py-1 rounded-lg border text-sm self-center hover:bg-neutral-100 bg-white border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-700 dark:hover:bg-neutral-700"
                                    disabled={uiDisabled}>
                                    Make Draft
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
