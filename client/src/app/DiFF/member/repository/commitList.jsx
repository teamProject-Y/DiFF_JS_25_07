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

export default function CommitList({ repo, refreshSignal, enabled = true }) {
    // ===== 안정화된 프리미티브 파생값들 =====
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
    const [err, setErr] = useState('');
    const [refreshTick, setRefreshTick] = useState(0);

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
        setErr('');
    }, [repoId, repoDefaultBranch]);

    // === 커밋 패치 ===
    // ⚠️ 여기에서 'repo'(객체) 자체를 의존성에서 제거하고,
    //     실제로 필요한 프리미티브만 의존하게 변경
    useEffect(() => {
        if (!enabled) return;
        if (!connected) return;

        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setErr('');

                const repoFixed = {
                    // 필요한 최소 정보만 전달 (객체 재생성 영향 ↓)
                    id: repoId,
                    url: repoUrl,
                    owner: safeOwner,
                    name: safeName,
                    githubOwner: safeOwner,
                    githubName: safeName,
                };

                const list = await getGithubCommitList(repoFixed, {
                    branch,
                    page,
                    perPage,
                });
                if (!cancelled) setCommits(list);
            } catch (e) {
                if (!cancelled) setErr(e?.message || '커밋을 불러오지 못했습니다.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // ⬇⬇⬇ 'repo' 대신 안정화된 값들만
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
        const draft = await mkDraft(safeOwner, safeName, commit.sha);
        console.log('draft:', draft);
        console.log('draft detail: ', draft.msg, draft.data1);
        return draft;
    }

    if (!connected) {
        return <div className="text-sm text-neutral-500">깃허브 연결해야됨</div>;
    }

    return (
        <div className="flex flex-col h-full w-full min-h-0 rounded-lg bg-white dark:text-neutral-300 dark:bg-neutral-900/50 dark:border-neutral-700">
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
                        disabled={!enabled || loading}
                    >
                        Refresh
                    </button>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <button
                        className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50 bg-white border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-700"
                        disabled={page <= 1 || loading || !enabled}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Prev
                    </button>
                    <span className="text-xs text-neutral-500">Page {page}</span>
                    <button
                        className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50 bg-white border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-700"
                        disabled={loading || !enabled}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0 w-full overflow-y-auto px-3">
                {loading && (
                    <div className="h-full w-full flex justify-center items-center text-sm text-neutral-500">
                        Loading commits…
                    </div>
                )}
                {!!err && (
                    <div className="h-full w-full flex justify-center items-center text-sm text-red-500">
                        {err}
                    </div>
                )}
                {!loading && !err && commits.length === 0 && (
                    <div className="py-6 text-sm text-neutral-500">
                        No commits this repository yet
                    </div>
                )}

                {!loading && !err && commits.length > 0 && (
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
                                    disabled={!enabled}
                                >
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
