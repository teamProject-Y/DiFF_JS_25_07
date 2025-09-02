'use client';

import {useRouter, useSearchParams} from 'next/navigation';
import {fetchUser} from "@/lib/UserAPI";
import {useEffect, useMemo, useState, useCallback} from "react";
import {LayoutGroup, AnimatePresence} from "framer-motion";
import {createRepository, importGithubRepo} from "@/lib/RepositoryAPI"

import RepoPost from "./RepoPost";
import {AddRepoModal} from './addRepoModal';
import {RepoInfo} from './repoInfo';
import GhostBar from './sideBar';
import Link from "next/link";

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
            regDate: r?.regDate
                ? new Date(r.regDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                })
                : null,
            updateDate: r?.updateDate
                ? new Date(r.updateDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                })
                : null,
        };
    });

export default function RepositoriesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [repositories, setRepositories] = useState([]);
    const [member, setMember] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRepoId, setSelectedRepoId] = useState(null);
    const [isMyRepos, setIsMyRepos] = useState(false);
    const [openChoice, setOpenChoice] = useState(false);
    const [linked, setLinked] = useState({github: false});

    const openModal = useCallback(() => setOpenChoice(true), []);
    const closeModal = useCallback(() => setOpenChoice(false), []);

    const [tab, setTab] = useState('info');

    useEffect(() => {
        if (repositories.length > 0 && !selectedRepoId) {
            setSelectedRepoId(repositories[0].id);
        } else if (repositories.length === 0) {

        }
    }, [repositories, selectedRepoId]);

    // 최초 1회만 사용자 레포 불러오기
    useEffect(() => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            router.replace('/DiFF/member/login');
            return;
        }

        const nickName = searchParams.get('nickName');
        const myNickName = typeof window !== 'undefined' && localStorage.getItem('nickName');
        setIsMyRepos(!nickName || nickName === myNickName);
        fetchUser(nickName)
            .then((res) => {
                setRepositories(normalizeRepos(res?.repositories || []));
                setLoading(false);
                setMember(res.member);
            })
            .catch(() => {
                setLoading(false);
                router.replace('/DiFF/home/main');
            });

        const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        fetch(`${base}/api/DiFF/auth/linked`, {
            headers: {Authorization: `Bearer ${accessToken}`},
            credentials: 'include',
        })
            .then(res => (res.ok ? res.json() : Promise.reject(res)))
            .then(data => setLinked({google: !!data.google, github: !!data.github}))
            .catch(() => {
            });
    }, [router, searchParams]);

    const selectedRepo = useMemo(
        () => repositories.find((r) => r.id === selectedRepoId) || repositories[0],
        [repositories, selectedRepoId]
    );

    useEffect(() => {
        if (selectedRepo) setTab('posts');
    }, [selectedRepo?.id]);

    const onClose = useCallback(() => setSelectedRepoId(null), []);

    useEffect(() => {
        if (!openChoice) return;
        const onKey = (e) => e.key === 'Escape' && closeModal();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [openChoice, closeModal]);

    const handleCreate = async ({name, description, visibility}) => {
        const repoName = (name ?? '').trim();
        const aPrivate = visibility === 'Private';

        if (!repoName) {
            setError('리포지토리 이름을 입력하세요.');
            return {ok: false, msg: '리포지토리 이름을 입력하세요.'};
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
                setSelectedRepoId(newRepo.id);
                return {ok: true};
            } else {
                const msg = res?.msg || '생성 실패';
                setError(msg);
                return {ok: false, msg};
            }
        } catch (err) {
            const msg = err?.response?.data?.msg || '요청 실패';
            setError(msg);
            return {ok: false, msg};
        } finally {
            setLoading(false);
        }
    };

    const handleImportRepo = async (payload) => {

        console.log("import payload: ", payload);

        try {
            const res = await importGithubRepo(payload);
            if (res?.resultCode?.startsWith('S-')) {
                const newRepo = {
                    id: res.data,
                    name: payload?.name || payload?.full_name || '',
                    url: payload?.url || '',
                    defaultBranch: payload?.default_branch || '',
                    aprivate: !!payload?.private,
                };

                setRepositories((prev) => {
                    if (prev.some((p) => p.id === newRepo.id || p.name === newRepo.name)) return prev;
                    return [...prev, newRepo];
                });

                setSelectedRepoId(newRepo.id);
                return {ok: true};
            }
            return {ok: false, msg: res?.msg || '가져오기 실패'};
        } catch (e) {
            return {ok: false, msg: e?.response?.data?.msg || e?.message || '가져오기 실패'};
        }
    };

    if (loading) return <div className="text-center">로딩...</div>;

    const profileHref =
        isMyRepos ? '/DiFF/member/profile'
            : `/DiFF/member/profile?nickName=${encodeURIComponent(member?.nickName ?? '')}`;

    const startLink = (provider) => {
        if (provider !== 'github') return;
        const link = `/api/DiFF/auth/link/${provider}?mode=link`;
        window.location.href = link;
    };

    return (
        <LayoutGroup>
            <section className="px-4">

                <div className="mx-auto max-w-6xl h-full">
                    <div className="mb-3 flex items-center gap-6 text-2xl font-bold">

                        <Link href={profileHref} className="text-gray-400 hover:text-gray-700">Profile</Link>
                        <span>Repositories</span>
                        {isMyRepos &&
                            <Link href="/DiFF/member/settings" className="text-gray-400 hover:text-gray-700">
                                Settings
                            </Link>
                        }

                    </div>
                    <div className="h-px w-full bg-gray-300 mb-8"/>

                    {error && <p className="mb-3 text-sm text-red-500">에러: {error}</p>}

                    <div className="relative">
                        {/* 탭 */}
                        <div className="absolute -top-9 left-[230px] flex">
                            {[
                                {key: 'posts', label: 'Posts'},
                                {key: 'info', label: 'Info'},
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

                        <div className="grid grid-cols-[230px_1fr] items-start">
                            {/* 왼쪽 사이드바 */}
                            <aside
                                className="h-[calc(100vh-220px)] overflow-y-auto rounded-l-lg border-t border-l border-b bg-gray-50">
                                <ul className="p-4 space-y-2">
                                    {isMyRepos &&
                                        <li onClick={openModal}
                                            className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 text-gray-700">
                                            <i className="fa-solid fa-folder-plus text-neutral-400"/>
                                            <span className="truncate">add repository</span>
                                        </li>
                                    }
                                    {repositories.map((r) => {
                                        const sel = r.id === selectedRepoId;
                                        return (
                                            <li
                                                key={r.id}
                                                onClick={() => setSelectedRepoId(r.id)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer ${sel ? 'bg-gray-200 text-gray-900' : 'hover:bg-gray-100 text-gray-700'}`}
                                                title={r.name}
                                            >
                                                <i className={`fa-solid ${sel ? 'fa-folder-open text-[#4E94F8]' : 'fa-folder text-blue-300'}`}/>

                                                <span className="truncate">{r.name}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </aside>

                            {/* 메인 컨텐츠 */}
                            <div
                                className="relative border border-gray-300 rounded-r-lg bg-white pt-8 h-[calc(100vh-220px)] overflow-hidden">
                                {/*<GhostBar repositories={repositories}/>*/}

                                {/* 리포 없을 때 */}
                                {repositories.length === 0 ? (
                                    <div className="absolute inset-0 flex items-center justify-center p-8">
                                        <div
                                            className="relative w-full max-w-lg rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white p-12 text-center shadow-sm transition-all">
                                            <div
                                                className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                                                <i className="fa-regular fa-folder-open text-3xl text-blue-500"/>
                                            </div>

                                            <h3 className="text-2xl font-semibold tracking-tight text-gray-900">
                                                No repositories yet
                                            </h3>
                                            <p className="mt-2 text-sm text-gray-500">
                                                Create a new repository or import one from GitHub to get started.
                                            </p>

                                            {isMyRepos ? (
                                                <div className="mt-6 flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={openModal}
                                                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50"
                                                    >
                                                        <i className="fa-solid fa-plus"/>
                                                        Create / Import Repository
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="mt-6 text-sm text-gray-400">
                                                    No repositories available.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                ) : (
                                    <>
                                        {tab === 'info' && selectedRepo ? (
                                            <RepoInfo
                                                key={`detail-${selectedRepoId ?? 'none'}`}
                                                repo={selectedRepo}
                                                repositories={repositories}
                                                onChangeRepo={(id) => setSelectedRepoId(String(id))}
                                                onClose={onClose}
                                                useExternalSidebar={true}
                                                activeTab={tab}
                                            />
                                        ) : null}
                                        {tab === 'posts' && selectedRepo ? (
                                            <RepoPost
                                                key={`posts-${selectedRepoId ?? 'none'}`}
                                                repoId={selectedRepo.id}
                                                repoName={selectedRepo.name}
                                            />
                                        ) : null}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 하단 버튼들 */}
                    {/*<div className="text-center mt-6 space-y-4">*/}
                    {/*    <button*/}
                    {/*        onClick={() => router.push('/DiFF/member/profile')}*/}
                    {/*        className="px-6 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"*/}
                    {/*    >*/}
                    {/*        내 프로필 보기*/}
                    {/*    </button>*/}

                    {/*    <button*/}
                    {/*        onClick={() => router.push('/DiFF/article/drafts')}*/}
                    {/*        className="px-6 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"*/}
                    {/*    >*/}
                    {/*        임시저장*/}
                    {/*    </button>*/}

                    {/*    <button*/}
                    {/*        onClick={() => router.push('/DiFF/article/write')}*/}
                    {/*        className="px-6 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"*/}
                    {/*    >*/}
                    {/*        글 작성하기*/}
                    {/*    </button>*/}
                    {/*</div>*/}
                </div>
            </section>
            {isMyRepos && (
                <AddRepoModal
                    open={openChoice}
                    onClose={closeModal}
                    isGithubLinked={linked.github}
                    onLinkGithub={() => startLink('github')}
                    onCreate={handleCreate}
                    onImport={handleImportRepo}
                />
            )}
        </LayoutGroup>
    );
}
