// components/CommitList.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGithubCommitList } from '@/lib/RepositoryAPI';

export default function CommitList({ repo }) {

    console.log("commitlist 들어옴 repo: ", repo);

    const router = useRouter();

    const connected = !!repo?.url && !!repo?.name;
    const [branch, setBranch] = useState(repo?.defaultBranch || 'main');
    const [page, setPage] = useState(1);
    const [perPage] = useState(50);

    const [commits, setCommits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    // repo 바뀌면 초기화
    useEffect(() => {
        setBranch(repo?.defaultBranch || 'main');
        setPage(1);
        setCommits([]);
        setErr('');
    }, [repo?.id, repo?.owner, repo?.name, repo?.defaultBranch]);

    useEffect(() => {
        if (!connected) return;

        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setErr('');

                console.log("use effect 됨")

                const list = await getGithubCommitList(repo, { branch, page, perPage });
                if (!cancelled) setCommits(list);
            } catch (e) {
                if (!cancelled) setErr(e?.message || '커밋을 불러오지 못했습니다.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [connected, repo, branch, page, perPage]);

    if (!connected) {
        return <div className="text-sm text-neutral-500">깃허브 연결해야됨</div>;
    }

    return (
        <div className="flex flex-col gap-3">
            {/* 제어부 */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">Branch</span>
                <input
                    value={branch}
                    onChange={(e) => { setPage(1); setBranch(e.target.value.trim()); }}
                    placeholder="e.g. main"
                    className="px-2 py-1 rounded-md border text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    style={{ minWidth: 160 }}
                />
                <button
                    onClick={() => setPage((p) => p)} // 간단 새로고침
                    className="px-3 py-1 rounded-lg border text-sm bg-white hover:bg-neutral-100
                     border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-700"
                >
                    Refresh
                </button>
                <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-sm underline"
                >
                    Open repository
                </a>
            </div>

            {/* 상태 */}
            {loading && <div className="text-sm text-neutral-500">Loading commits…</div>}
            {!!err && <div className="text-sm text-red-500">{err}</div>}
            {!loading && !err && commits.length === 0 && (
                <div className="text-sm text-neutral-500">표시할 커밋이 없습니다.</div>
            )}

            {/* 리스트 */}
            {!loading && !err && commits.length > 0 && (
                <>
                    <ul className="divide-y">
                        {commits.map((c) => (
                            <li key={c.sha} className="py-3 flex items-start gap-3">
                                <img
                                    src={c.authorAvatarUrl || 'https://avatars.githubusercontent.com/u/0?v=4'}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium truncate">{c.message || '(no message)'}</span>
                                        {c.htmlUrl && (
                                            <a
                                                href={c.htmlUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-blue-600 underline shrink-0"
                                            >
                                                View on GitHub
                                            </a>
                                        )}
                                    </div>
                                    <div className="text-xs text-neutral-500 mt-0.5">
                                        {(c.authorName || c.authorLogin || 'unknown')} ·{' '}
                                        {c.authoredAt ? new Date(c.authoredAt).toLocaleString() : '(no date)'}
                                    </div>
                                    <div className="text-[11px] text-neutral-400 mt-0.5">
                                        {c.parentSha
                                            ? `${String(c.parentSha).slice(0,7)}..${String(c.sha).slice(0,7)}`
                                            : String(c.sha).slice(0,7)}
                                    </div>
                                </div>
                                <button
                                    onClick={() =>
                                        router.push(`/draft/new?repoId=${repo.id}&base=${c.parentSha || ''}&head=${c.sha}`)
                                    }
                                    className="shrink-0 px-3 py-1 rounded-lg border text-sm hover:bg-neutral-100
                             bg-white border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-700"
                                >
                                    Generate draft
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* 페이징 */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50
                         bg-white border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-700"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            Prev
                        </button>
                        <span className="text-xs text-neutral-500">Page {page}</span>
                        <button
                            className="px-3 py-1 rounded-lg border text-sm
                         bg-white border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-700"
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
