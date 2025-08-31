'use client';

import { useRouter } from 'next/navigation';
import { fetchUser } from "@/lib/UserAPI";
import { useEffect, useMemo, useState, useCallback } from "react";
import { LayoutGroup, AnimatePresence } from "framer-motion";
import { createRepository, importGithubRepo } from "@/lib/RepositoryAPI"

import RepoFolder from './repoFolder';
import RepoContent from './repoContent';
import GhostBar from './sideBar';

const getAccessToken = () =>
    (typeof window !== 'undefined' &&
        (localStorage.getItem('accessToken') || localStorage.getItem('access_token'))) || '';

const genId = (r) =>
    String(
        r?.id ??
        r?.url ??
        r?.name ??
        (typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2))
    );

const normalizeRepos = (raw) =>
    (raw || []).map((r) => {
        const name = r?.name ?? r?.full_name ?? '';
        const url = r?.url ?? '';
        return {
            id: genId(r),
            name,
            url,
            defaultBranch: r?.defaultBranch ?? r?.default_branch ?? '',
            aprivate: !!(r?.aprivate ?? r?.aPrivate),
            regDate: r?.regDate ?? null,
        };
    });

export default function RepositoriesPage() {
    const router = useRouter();
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [error, setError] = useState('');
    const [selectedRepoId, setSelectedRepoId] = useState(null);

    const [tab, setTab] = useState('info');

    const [open, setOpen] = useState(false);
    const [name, setRepoName] = useState("");

    // 최초 1회만 사용자 레포 불러오기
    useEffect(() => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            router.replace('/DiFF/member/login');
            return;
        }

        fetchUser()
            .then((res) => {
                setRepositories(normalizeRepos(res?.repositories || []));
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                router.replace('/DiFF/home/main');
            });
    }, []);

    // const fetchRepos = useCallback(async () => {
    //     const at = getAccessToken();
    //     if (!at) {
    //         router.replace('/DiFF/member/login');
    //         return;
    //     }
    //     setLoadingRepos(true);
    //     setError('');
    //     try {
    //         const res = await fetch('http://localhost:8080/api/DiFF/github/repos', {
    //             method: 'GET',
    //             headers: {Authorization: `Bearer ${at}`},
    //             credentials: 'include',
    //         });
    //         const json = await res.json();
    //
    //         if (!res.ok || (json?.resultCode && String(json.resultCode).startsWith('F')) || json?.error) {
    //             throw new Error(json?.msg || json?.message || '리포 조회 실패');
    //         }
    //         const list = Array.isArray(json?.data)
    //             ? json.data
    //             : Array.isArray(json?.data1)
    //                 ? json.data1
    //                 : [];
    //         setRepositories(normalizeRepos(list));
    //         setSelectedRepoId(null);
    //     } catch (e) {
    //         setError(e?.message || '요청 실패');
    //     } finally {
    //         setLoadingRepos(false);
    //     }
    // }, [router]);

    const selectedRepo = useMemo(
        () => repositories.find((r) => r.id === selectedRepoId) || null,
        [repositories, selectedRepoId]
    );

    // console.log("selected repo: " + selectedRepo);

    useEffect(() => {
        if (selectedRepo) setTab('info');
    }, [selectedRepo?.id]);

    const onClose = useCallback(() => setSelectedRepoId(null), []);

    const handleCreate = async ({ name, description, visibility }) => {
        const repoName = (name ?? '').trim();
        const aPrivate = visibility === 'Private';

        if (!repoName) {
            setError('레포지토리 이름을 입력하세요.');
            return { ok: false, msg: '레포지토리 이름을 입력하세요.' };
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                name: repoName,
                description: (description ?? '').trim(),
                aPrivate: aPrivate,
                aprivate: aPrivate,
            };

            console.log('[createRepository] payload =', payload);

            const res = await createRepository(payload);

            if (res?.resultCode?.startsWith('S-')) {
                const newRepo = {
                    id: res.data,
                    name: repoName,
                    url: '',
                    defaultBranch: '',
                    aprivate: aPrivate,
                };
                setRepositories((prev) => [...prev, newRepo]);
                return { ok: true };
            } else {
                const msg = res?.msg || '생성 실패';
                setError(msg);
                return { ok: false, msg };
            }
        } catch (err) {
            const msg = err?.response?.data?.msg || '요청 실패';
            setError(msg);
            return { ok: false, msg };
        } finally {
            setLoading(false);
        }
    };

    const handleImportRepo = async (ghRepo) => {
        try {
            const res = await importGithubRepo(ghRepo); // { resultCode, msg, data: newRepoId }
            if (res?.resultCode?.startsWith('S-')) {
                const newRepo = {
                    id: res.data, // 서버가 내려주는 새 레포 ID
                    name: ghRepo?.name || ghRepo?.full_name || '',
                    url: ghRepo?.html_url || ghRepo?.url || '',
                    defaultBranch: ghRepo?.default_branch || '',
                    aprivate: !!ghRepo?.private,
                };

                setRepositories((prev) => {
                    if (prev.some((p) => p.id === newRepo.id || p.name === newRepo.name)) return prev;
                    return [...prev, newRepo];
                });

                return { ok: true };
            }
            return { ok: false, msg: res?.msg || '가져오기 실패' };
        } catch (e) {
            return { ok: false, msg: e?.response?.data?.msg || e?.message || '가져오기 실패' };
        }
    };

    if (loading) return <div className="text-center">로딩...</div>;

    return (
        <LayoutGroup>
            <section className="px-4">
                <div className="mx-auto max-w-6xl h-full">
                    <h2 className="text-2xl font-bold mb-4 mx-4 flex items-center gap-3">
                        My Repository
                        {/*<button*/}
                        {/*    onClick={fetchRepos}*/}
                        {/*    disabled={loadingRepos}*/}
                        {/*    className="text-sm px-3 py-1.5 rounded-lg bg-black text-white hover:opacity-90 active:opacity-80 disabled:opacity-60"*/}
                        {/*>*/}
                        {/*    {loadingRepos ? '불러오는 중…' : '리포 불러오기'}*/}
                        {/*</button>*/}
                    </h2>

                    {error && <p className="mb-3 text-sm text-red-500">에러: {error}</p>}

                    {/* 레포 미선택 */}
                    {!selectedRepo ? (
                        <div
                            className="relative flex border border-gray-200 rounded-lg shadow overflow-hidden  bg-white">
                            <AnimatePresence>
                                <RepoFolder
                                    key="grid"
                                    repositories={repositories}
                                    onSelect={setSelectedRepoId}
                                    // onFetchRepos={fetchRepos}
                                    onCreateRepo={handleCreate}
                                    onImportRepo={handleImportRepo}
                                />
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* 탭 */}
                            <div className="absolute -top-9 left-[230px] flex">
                                {[
                                    {key: 'info', label: 'Info'},
                                    {key: 'posts', label: 'Posts'},
                                ].map((t) => (
                                    <button
                                        key={t.key}
                                        onClick={() => setTab(t.key)}
                                        className={`px-4 py-2 text-sm border-t border-r border-l rounded-t-xl transition
                                        ${tab === t.key ? 'bg-white text-gray-900 -mb-px z-50' :
                                            'bg-gray-100  text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {onClose && (
                                <div className="absolute right-3 top-3 z-50 text-xl font-bold"
                                     onClick={onClose}>
                                    <i className="fa-solid fa-xmark"></i>
                                </div>
                            )}

                            <div className="grid grid-cols-[230px_1fr] items-start">
                                {/* 왼쪽 사이드바 */}
                                <aside
                                    className="h-[calc(100vh-220px)] overflow-y-auto rounded-l-lg border-t border-l border-b bg-gray-50">
                                    <ul className="p-4 space-y-2">
                                        {repositories.map((r) => {
                                            const sel = r.id === selectedRepoId;
                                            return (
                                                <li
                                                    key={r.id}
                                                    onClick={() => setSelectedRepoId(r.id)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer ${sel ? 'bg-gray-200 text-gray-900 font-semibold' : 'hover:bg-gray-100 text-gray-700'}`}
                                                    title={r.name}
                                                >
                                                    <i className={`fa-solid ${sel ? 'fa-folder-open text-neutral-500' : 'fa-folder text-neutral-400'}`}/>

                                                    <span className="truncate">{r.name}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </aside>

                                {/* 메인 컨텐츠 */}
                                <div
                                    className="relative border border-gray-300 rounded-r-lg bg-white pt-8 h-[calc(100vh-220px)] overflow-hidden">
                                    <GhostBar repositories={repositories}/>

                                    {/*{tab === 'info' && (*/}
                                    {/*    <RepoContent*/}
                                    {/*        key={`detail-${selectedRepo.id}`}*/}
                                    {/*        repo={selectedRepo}*/}
                                    {/*        repositories={repositories}*/}
                                    {/*        onChangeRepo={setSelectedRepoId}*/}
                                    {/*        onClose={onClose}*/}
                                    {/*        useExternalSidebar={true}*/}
                                    {/*    />*/}
                                    {/*)}*/}

                                    {/*{tab === 'posts' && (*/}
                                    {/*    <PostsPanel repositoryId={selectedRepo.id}/>*/}
                                    {/*)}*/}
                                    <RepoContent
                                        key={`detail-${selectedRepo.id}`}
                                        repo={selectedRepo}
                                        repositories={repositories}
                                        onChangeRepo={setSelectedRepoId}
                                        onClose={onClose}
                                        useExternalSidebar={true}
                                        activeTab={tab}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 하단 버튼들 */}
                    <div className="text-center mt-6 space-y-4">
                        <button
                            onClick={() => router.push('/DiFF/member/profile')}
                            className="px-6 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"
                        >
                            내 프로필 보기
                        </button>

                        <button
                            onClick={() => router.push('/DiFF/article/drafts')}
                            className="px-6 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"
                        >
                            임시저장
                        </button>

                        <button
                            onClick={() => router.push('/DiFF/article/write')}
                            className="px-6 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"
                        >
                            글 작성하기
                        </button>
                    </div>

                    {/* 모달 */}
                    {open && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
                            onClick={() => setOpen(false)}
                        >
                            <div
                                className="bg-white p-6 rounded shadow-md w-96"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-lg font-bold mb-4">레포지토리 생성</h2>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setRepoName(e.target.value)}
                                    placeholder="레포지토리 이름"
                                    className="w-full border rounded px-3 py-2 mb-2"
                                />
                                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="px-4 py-2 bg-gray-200 rounded"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleCreate}
                                        disabled={loading}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50"
                                    >
                                        {loading ? '생성 중...' : '생성'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </LayoutGroup>
    );
}
