'use client';

import {motion} from 'framer-motion';
import {useEffect, useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import {fetchUser} from '@/lib/UserAPI';
import {fetchArticles, getAverageMetrics} from '@/lib/ArticleAPI';

// 애니메이션
const container = {
    hidden: {x: -40, opacity: 0},
    show: {
        x: 0, opacity: 1,
        transition: {
            type: 'spring', stiffness: 120, damping: 20,
            when: 'beforeChildren',
            staggerChildren: 0.08,
            delayChildren: 0.02,
        },
    },
    exit: {x: -40, opacity: 0, transition: {type: 'spring', stiffness: 120, damping: 20}},
};

const listItem = {
    hidden: {x: -10, opacity: 0},
    show: {x: 0, opacity: 1, transition: {type: 'spring', stiffness: 220, damping: 18}},
};

const block = {
    hidden: {y: 8, opacity: 0, scale: 0.98},
    show: {y: 0, opacity: 1, scale: 1, transition: {type: 'spring', bounce: 0.28, duration: 0.45}},
};

const cardsWrap = {
    hidden: {},
    show: {transition: {staggerChildren: 0.06, delayChildren: 0.02}},
};

const card = {
    hidden: {y: 10, opacity: 0, scale: 0.98},
    show: {y: 0, opacity: 1, scale: 1, transition: {type: 'spring', bounce: 0.30, duration: 0.5}},
};

export default function RepoContent({
                                        repo,
                                        repositories = [],
                                        onChangeRepo,
                                        onClose,
                                        useExternalSidebar = false,
                                        activeTab = 'info',
                                    }) {
    const router = useRouter();

    const [articles, setArticles] = useState([]);
    const [articleLoading, setArticleLoading] = useState(false);
    const [metrics, setMetrics] = useState(null);

    // repo 바뀔 때 기사/메트릭 로딩
    useEffect(() => {
        if (!repo?.id) return;
        (async () => {
            setArticleLoading(true);
            try {
                const res = await fetchArticles({
                    repositoryId: repo.id,
                    page: 1,
                    searchItem: 0,
                    keyword: '',
                });
                setArticles(res?.articles || []);
                const m = await getAverageMetrics(repo.id).catch(() => null);
                setMetrics(m);
            } finally {
                setArticleLoading(false);
            }
        })();
    }, [repo?.id]);
    const gridCols = useExternalSidebar
        ? (activeTab === 'info' ? 'grid-cols-[1fr_300px]' : 'grid-cols-1')
        : (activeTab === 'info' ? 'grid-cols-[220px_1fr_300px]' : 'grid-cols-[220px_1fr]');

    const createdAt = useMemo(() => {
        const d = repo?.regDate || repo?.createdAt || repo?.created_at;
        return d
            ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : 'Unknown';
    }, [repo]);

    return (
        <motion.div
            key={`detail-${repo?.id ?? 'none'}`}
            variants={container}
            initial="hidden"
            animate="show"
            exit="hidden"
            className={`absolute inset-0 grid ${gridCols} gap-6 p-8 bg-white`}
        >
            {/* 왼쪽 내부 레일(옵션) — 항상 공용 */}
            {!useExternalSidebar && (
                <aside className="border-r bg-gray-50 p-4 overflow-y-scroll">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-md text-gray-500 hover:text-gray-800"
                        >
                            {/* ✅ class → className */}
                            <i className="fa-solid fa-angle-left"></i>
                        </button>
                    )}
                    <ul className="space-y-2">
                        <li
                            key="repo-plus"
                            className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 text-blue-600 font-semibold"
                            onClick={() => window.open('https://github.com/new', '_blank')}
                            title="깃허브로 리포지토리 추가"
                        >
                            <i className="fa-solid fa-circle-plus text-neutral-500"/>
                            <span className="truncate">깃허브로 리포지토리 추가</span>
                        </li>
                        {repositories.map((r) => {
                            const sel = r.id === repo?.id;
                            return (
                                <motion.li
                                    key={r.id}
                                    variants={listItem}
                                    className={`px-3 py-2 rounded cursor-pointer text-sm hover:bg-gray-200 transition ${
                                        sel ? 'bg-gray-200 font-semibold' : ''
                                    }`}
                                    onClick={() => onChangeRepo?.(r.id)}
                                >
                                    <i className={`mr-2 fa-solid ${sel ? 'fa-folder-open' : 'fa-folder'}`}/>
                                    {r.name}
                                </motion.li>
                            );
                        })}
                    </ul>
                </aside>
            )}

            {/* 중앙 메인 */}
            <div className="min-w-0 min-h-0 flex flex-col">
                <div className="flex-1 overflow-y-auto px-0 pb-2 flex flex-col">
                    {/* 상단 큰 박스 — info 전용 */}
                    {activeTab === 'info' && (
                        <div className="flex-grow rounded-xl border border-neutral-200 shadow-sm bg-white p-4 mb-3 mr-3">
                            <div className="h-full flex items-center justify-center text-neutral-500">
                                <div className="text-center">
                                    <div className="text-lg font-semibold mb-1">{repo?.name ?? 'Repository'}</div>
                                    <div className="text-sm">README 요약 / 최근 커밋 / 브랜치 등 들어갈 영역</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 하단 큰 박스 — info: 추가정보 / posts: 게시물 목록 */}
                    <div
                        className={`flex-grow bg-white p-4 mr-3 overflow-y-scroll
                        ${activeTab === 'info' ? 'rounded-xl border border-neutral-200 shadow-sm' : 'mt-2'}`}
                                        >
                    {activeTab === 'info' ? (
                            <div className="h-full flex items-center justify-center text-neutral-500">
                                추가 정보(커밋 타임라인/브랜치/이슈 요약 등)
                            </div>
                        ) : (
                            <>
                                {articleLoading ? (
                                    <p>Loading...</p>
                                ) : articles.length > 0 ? (
                                    <motion.div
                                        variants={cardsWrap}
                                        initial="hidden"
                                        animate="show"
                                        className="grid grid-cols-1 gap-4"
                                    >
                                        {articles.map((a, i) => (
                                            <motion.div
                                                key={a.id ?? i}
                                                variants={card}
                                                className="h-32 rounded-lg border border-neutral-200 bg-white shadow-sm p-3 hover:shadow-md transition cursor-pointer"
                                                onClick={() => router.push(`/DiFF/article/detail?id=${a.id}`)}
                                            >
                                                <div className="font-semibold line-clamp-1">
                                                    {a.title || `게시물 ${i + 1}`}
                                                </div>
                                                <div className="text-xs text-neutral-500 mt-1">
                                                    {a.extra__writer || '익명'} · {a.regDate
                                                    ? new Date(a.regDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })
                                                    : ''}
                                                </div>
                                                <p className="text-sm mt-2 line-clamp-2">
                                                    {a.body?.slice?.(0, 120) || '요약...'}
                                                </p>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <p>등록된 게시물이 없습니다.</p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {activeTab === 'info' && (
                <aside className="min-w-[280px]">
                    <div className="rounded-full w-10 h-10 flex items-center justify-center mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                    </div>

                    <div className="my-6 border-t"/>

                    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
                        <div className="text-sm text-neutral-500">Created</div>
                        <div className="text-base font-semibold mt-1">{createdAt}</div>
                    </div>

                    <div className="my-6 border-t"/>

                    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
                        <div className="font-semibold mb-3">Languages</div>
                        <div className="text-sm text-neutral-500">도넛 차트 영역(언어 비율) — 추후 실제 데이터 바인딩</div>
                    </div>
                </aside>
            )}
        </motion.div>
    );
}