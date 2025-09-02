'use client';

import {motion} from 'framer-motion';
import {useEffect, useMemo, useState, useRef} from 'react';
import {useRouter} from 'next/navigation';

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

export function RepoInfo({
                             repo,
                             repositories = [],
                             onClose,
                             useExternalSidebar = false,
                         }) {
    const router = useRouter();

    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(repo?.name ?? '');
    useEffect(() => {
        setNameInput(repo?.name ?? '');
    }, [repo?.name]);

    const onSaveName = async () => {
        try {
            // TODO: 저장 엔드포인트 연결
            // await api.updateRepoName({ id: repo.id, name: nameInput });
            setEditingName(false);
        } catch (e) {
            console.error(e);
            alert('이름 저장 중 오류가 발생했습니다.');
        }
    };

// 언어 데이터 정규화
    const rawLang = repo?.languages;
    const langList = Array.isArray(rawLang)
        ? rawLang
        : rawLang && typeof rawLang === 'object'
            ? Object.entries(rawLang).map(([name, bytes]) => ({name, bytes}))
            : [];
    const totalBytes = langList.reduce((a, b) => a + (b.bytes || 0), 0);
    const pct = (v) => (totalBytes ? Math.round((v / totalBytes) * 100) : 0);

// 추천 표시 정보
    const defaultBranch = repo?.defaultBranch || 'main';
    const visibility = (repo.aprivate ? 'private' : 'public');
    const stats = {
        stars: repo?.stargazersCount || repo?.stars || 0,
        forks: repo?.forksCount || repo?.forks || 0,
        issues: repo?.openIssuesCount || repo?.issues || 0,
        watchers: repo?.subscribersCount || repo?.watchers || 0,
    };

    const nameRef = useRef(null);

    const enterEdit = () => {
        setEditingName(true);
        // 인풋 자동 포커스
        setTimeout(() => nameRef.current?.focus?.(), 0);
    };

    const cancelEdit = () => {
        setEditingName(false);
        setNameInput(repo?.name ?? '');
    };

    const onKeyDownName = (e) => {
        if (e.key === 'Enter') onSaveName();
        if (e.key === 'Escape') cancelEdit();
    };

    return (
        <motion.div
            key={`detail-${repo?.id ?? 'none'}`}
            variants={container}
            initial="hidden"
            animate="show"
            exit="hidden"
            className={`absolute inset-0 p-6 overflow-y-auto`}
        >
            {/* 왼쪽 레일 */}
            {!useExternalSidebar && (
                <aside className="border-r bg-gray-50 p-4 overflow-y-scroll">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="w-full text-md text-gray-500 hover:text-gray-800"
                        >
                            <i className="fa-solid fa-angle-left"></i>
                        </button>
                    )}
                </aside>
            )}

            {repositories.length === 0 &&
                <div className="w-full h-full bg-red-400">

                </div>
            }

            <div className="flex gap-3 h-full w-full overflow-y-scroll">
                {/* 중앙 메인(Info) */}
                <div className="flex-grow flex flex-col">
                    <div className="flex-1 overflow-y-auto flex flex-col">
                        {/* 상단 카드 */}
                        <div
                            className="h-[35%] rounded-xl border border-neutral-200 shadow-sm p-4 mb-3 mr-3">

                            그래프
                        </div>

                        {/* 하단 박스 */}
                        <div
                            className="flex-grow p-4 mr-3 overflow-y-scroll rounded-xl border border-neutral-200 shadow-sm">
                            {repo.url ?
                                <>
                                    깃허브 커밋들 가져오기
                                </>
                                :
                                <>
                                    깃허브 연결할래?
                                </>
                            }
                        </div>
                    </div>
                </div>

                <div className="w-[30%] space-y-3 flex flex-col">
                    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center min-w-0 flex-grow">
                                {editingName ? (
                                    <>
                                        <input
                                            ref={nameRef}
                                            value={nameInput}
                                            onChange={(e) => setNameInput(e.target.value)}
                                            onKeyDown={onKeyDownName}
                                            className="flex-grow min-w-0 px-1 py-2 rounded-md border
                                            focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            placeholder="Repository name"
                                        />
                                        <button
                                            onClick={onSaveName}
                                            className="p-1"
                                            title="Save"
                                            aria-label="Save name"
                                        >
                                            <i className="fa-solid fa-check"></i>
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className=""
                                            title="Cancel"
                                            aria-label="Cancel edit"
                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xl font-semibold break-all pl-1">
                                            {repo?.name ?? 'Repository'}
                                        </p>
                                        <button
                                            onClick={enterEdit}
                                            className="pl-2 pb-1 text-xs text-neutral-300"
                                            title="Rename"
                                            aria-label="Rename repository"
                                        >
                                            <i className="fa-solid fa-pen"></i>
                                        </button>
                                    </>
                                )}
                            </div>

                        </div>

                        <div className="mt-2 flex w-full text-sm justify-between items-center">
                            <div className="py-2"><i
                                className="fa-solid fa-calendar text-neutral-400"></i> {repo.regDate}</div>
                            <span className="ml-auto text-xs px-2 py-1 rounded-full bg-neutral-100 border">
                              {visibility}
                            </span>
                            {repo?.url && (
                                <a
                                    href={repo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={repo?.name}
                                    className="shrink-0"
                                >
                                    &nbsp;&nbsp;&nbsp;<i className="fa-brands fa-github text-2xl"></i>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* 통계 */}
                    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-neutral-500 text-xs">Stars</div>
                                <div className="text-lg font-semibold mt-0.5">{stats.stars}</div>
                            </div>
                            <div>
                                <div className="text-neutral-500 text-xs">Forks</div>
                                <div className="text-lg font-semibold mt-0.5">{stats.forks}</div>
                            </div>
                            <div>
                                <div className="text-neutral-500 text-xs">Issues</div>
                                <div className="text-lg font-semibold mt-0.5">{stats.issues}</div>
                            </div>
                            <div>
                                <div className="text-neutral-500 text-xs">Watchers</div>
                                <div className="text-lg font-semibold mt-0.5">{stats.watchers}</div>
                            </div>
                        </div>
                    </div>

                    {/* 언어 비율 */}
                    <div className="rounded-xl border border-neutral-200 flex-grow shadow-sm p-4">
                        <div className="font-semibold mb-3">Languages</div>
                        <div className="text-sm text-neutral-500">
                            도넛 차트 영역(언어 비율) — 추후 실제 데이터 바인딩
                        </div>
                    </div>

                    <button className="w-full p-2 hover:bg-red-500 hover:text-white bg-white
                        border border-neutral-200 rounded-xl shadow-sm text-red-500 transition-colors">

                        Delete Repository
                    </button>


                </div>

            </div>
        </motion.div>
    );
}