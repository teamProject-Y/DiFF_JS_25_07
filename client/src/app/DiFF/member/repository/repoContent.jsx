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

/**
 * props:
 * - repo                : 선택된 레포(RepositoriesPage에서 내려줌)
 * - repositories        : 레포 리스트
 * - onChangeRepo(id)    : 레포 변경
 * - onClose()           : 닫기
 * - useExternalSidebar  : true면 왼쪽 리스트(내부 레일) 렌더링 안 함
 */
export default function RepoContent({
                                        repo,
                                        repositories = [],
                                        onChangeRepo,
                                        onClose,
                                        useExternalSidebar = false,
                                    }) {
    const router = useRouter();

    const [articles, setArticles] = useState([]);
    const [articleLoading, setArticleLoading] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [tab, setTab] = useState('info'); // 'info' | 'posts'

    // 초회 로딩: repo가 바뀔 때 기사/메트릭 로딩
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

    // 외부 사이드바를 쓰면 컬럼: [1fr_300px], 아니면 [220px_1fr_300px]
    const gridCols = useExternalSidebar ? 'grid-cols-[1fr_300px]' : 'grid-cols-[220px_1fr_300px]';

    const createdAt = useMemo(() => {
        const d = repo?.regDate || repo?.createdAt || repo?.created_at;
        return d ? new Date(d).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) : 'Unknown';
    }, [repo]);

    return (
        <motion.div
            key={`detail-${repo?.id ?? 'none'}`}
            variants={container}
            initial="hidden"
            animate="show"
            exit="hidden"
            className={`absolute inset-0 grid ${gridCols} gap-8 p-8 bg-white`}
        >

            {/* 왼쪽 내부 레일(옵션) */}
            {!useExternalSidebar && (
                <aside className="border-r bg-gray-50 p-4 overflow-y-auto">
                    <ul className="space-y-2">
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

            {/* 중앙 메인(정보/게시물 탭 + 상자 2개 틀) */}
            <div className="min-w-0 min-h-0 flex flex-col">

                <div className="mb-4 flex items-center gap-2">

                    <div className="ml-auto flex items-center gap-2">
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="px-3 py-1.5 text-sm rounded-lg bg-neutral-900 text-white hover:bg-neutral-800"
                            >
                                닫기
                            </button>
                        )}
                    </div>
                </div>

                <div className="scrollbar-none flex-1 overflow-y-auto px-0 pb-2 space-y-6 ">
                    {/* 상단 큰 박스 */}
                    <div
                        className="h-[240px] rounded-xl border border-neutral-200 shadow-sm bg-white p-4 mb-6 mr-6">
                        {tab === 'info' ? (
                            <div className="h-full flex items-center justify-center text-neutral-500">
                                <div className="text-center">
                                    <div className="text-lg font-semibold mb-1">{repo?.name ?? 'Repository'}</div>
                                    <div className="text-sm">README 요약 / 최근 커밋 / 브랜치 등 들어갈 영역</div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-neutral-500">
                                게시물 상단 강조 영역(공지/하이라이트)
                            </div>
                        )}
                    </div>

                    {/* 하단 큰 박스 */}
                    <div
                        className="h-[260px] rounded-xl border border-neutral-200 shadow-sm bg-white p-4 mr-6 overflow-hidden">
                        {tab === 'info' ? (
                            <div className="h-full flex items-center justify-center text-neutral-500">
                                추가 정보(커밋 타임라인/브랜치/이슈 요약 등)
                            </div>
                        ) : articleLoading ? (
                            <p>게시글 불러오는 중...</p>
                        ) : articles.length > 0 ? (
                            <motion.div variants={cardsWrap} initial="hidden" animate="show"
                                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {articles.map((a, i) => (
                                    <motion.div key={a.id ?? i} variants={card}
                                                className="h-32 rounded-lg border border-neutral-200 bg-white shadow-sm p-3 hover:shadow-md transition"
                                                onClick={() => router.push(`/DiFF/article/detail?id=${a.id}`)}>
                                        <div
                                            className="font-semibold line-clamp-1">{a.title || `게시물 ${i + 1}`}</div>
                                        <div className="text-xs text-neutral-500 mt-1">
                                            {a.extra__writer || '익명'} · {new Date(a.regDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                        </div>
                                        <p className="text-sm mt-2 line-clamp-2">{a.body?.slice?.(0, 120) || '요약...'}</p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <p>등록된 게시물이 없습니다.</p>
                        )}
                    </div>
                </div>

            </div>

            {/* 오른쪽 메타 패널 */}
            <aside className="min-w-[280px]">
                {/* 상단 아이콘(원형) */}
                <div className="rounded-full w-10 h-10 flex items-center justify-center mx-auto">
                    <button>
                        <svg strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" stroke="currentColor"
                             fill="none" viewBox="0 0 24 24"
                             className="w-8 hover:scale-125 duration-200 hover:stroke-gray-300">
                            <path
                                d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        </svg>
                    </button>
                    <span className="absolute -top-14 left-[50%] -translate-x-[50%]
  z-20 origin-left scale-0 px-3 rounded-lg border
  border-gray-300 bg-white py-2 text-sm font-bold
  shadow-md transition-all duration-300 ease-in-out
  group-hover:scale-100">GitHub<span>
</span></span>
                </div>

                <div className="my-6 border-t"/>

                {/* Created At 박스 */}
                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
                    <div className="text-sm text-neutral-500">Created</div>
                    <div className="text-base font-semibold mt-1">{createdAt}</div>
                </div>

                <div className="my-6 border-t"/>

                {/* 도넛 자리에 들어갈 박스(차트는 나중에) */}
                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
                    <div className="font-semibold mb-3">Languages</div>
                    <div className="text-sm text-neutral-500">도넛 차트 영역(언어 비율) — 추후 실제 데이터 바인딩</div>
                </div>
            </aside>
        </motion.div>

    );
}
