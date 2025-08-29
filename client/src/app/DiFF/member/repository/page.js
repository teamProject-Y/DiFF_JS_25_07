'use client';

import {useRouter} from 'next/navigation';
import {fetchUser} from "@/lib/UserAPI";
import {useEffect, useMemo, useState, useCallback} from "react";
import {LayoutGroup, AnimatePresence} from "framer-motion";
import {createRepository, repositoryArticles} from "@/lib/ArticleAPI";

import RepoFolder from './repoFolder';
import RepoContent from './repoContent';
import GhostBar from './sideBar';

function PostsPanel({repositoryId}) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        if (!repositoryId) {
            setArticles([]);
            return;
        }

        setLoading(true);
        setError("");

        (async () => {
            try {
                const res = await repositoryArticles({repositoryId});
                if (res?.resultCode?.startsWith("S-")) {
                    if (!ignore) setArticles(Array.isArray(res.data) ? res.data : []);
                } else {
                    if (!ignore) {
                        setArticles([]);
                    }
                }
            } catch (e) {
                if (!ignore) {
                    setError(e?.response?.data?.msg || e?.message || "요청 실패");
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        })();

        return () => {
            ignore = true;
        };
    }, [repositoryId]);

    return (
        <div className="w-full h-full">
            <div className="w-[90%] h-full mx-auto">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <i className="fa-regular fa-newspaper"/> 게시물
                </h3>

                {loading &&
                    <div className="h-full text-3xl flex flex-col justify-center items-center text-gray-500">
                        <svg aria-hidden="true"
                             className="inline w-[15%] h-[15%] text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300"
                             viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"/>
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"/>
                        </svg>
                        <h2 className="mt-8 pb-40 text-xl">Loading...</h2>
                    </div>}
                {error && <p className="text-sm text-red-500">에러: {error}</p>}

                {!loading && !error && (
                    articles.length === 0 ? (
                        <p className="text-sm text-gray-500">게시물이 작성되지 않았습니다.</p>
                    ) : (
                        <div className="space-y-3">
                            {articles.map((article, idx) => (
                                <div
                                    key={article.id ?? article.slug ?? `${idx}-${article.title}`}
                                    className="rounded-xl border border-dashed p-6 text-gray-500"
                                >
                                    <div className="text-xs uppercase tracking-wide mb-2">
                                        Current Repository
                                    </div>
                                    <div className="font-medium">{article.title}</div>
                                    <div className="text-sm text-gray-400 truncate">
                                        {article.body}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

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
        const url = r?.url ?? r?.html_url ?? '';
        return {
            id: genId(r),
            name,
            url,
            defaultBranch: r?.defaultBranch ?? r?.default_branch ?? '',
            aprivate: !!(r?.aprivate ?? r?.private),
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

    const fetchRepos = useCallback(async () => {
        const at = getAccessToken();
        if (!at) {
            router.replace('/DiFF/member/login');
            return;
        }
        setLoadingRepos(true);
        setError('');
        try {
            const res = await fetch('http://localhost:8080/api/DiFF/github/repos', {
                method: 'GET',
                headers: {Authorization: `Bearer ${at}`},
                credentials: 'include',
            });
            const json = await res.json();

            if (!res.ok || (json?.resultCode && String(json.resultCode).startsWith('F')) || json?.error) {
                throw new Error(json?.msg || json?.message || '리포 조회 실패');
            }
            const list = Array.isArray(json?.data)
                ? json.data
                : Array.isArray(json?.data1)
                    ? json.data1
                    : [];
            setRepositories(normalizeRepos(list));
            setSelectedRepoId(null);
        } catch (e) {
            setError(e?.message || '요청 실패');
        } finally {
            setLoadingRepos(false);
        }
    }, [router]);

    const selectedRepo = useMemo(
        () => repositories.find((r) => r.id === selectedRepoId) || null,
        [repositories, selectedRepoId]
    );

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

    if (loading) return <div className="text-center">로딩...</div>;

    return (
        <LayoutGroup>
            <section className="px-4">
                <div className="mx-auto max-w-6xl h-full">
                    <h2 className="text-2xl font-bold mb-4 mx-4 flex items-center gap-3">
                        My Repository
                        <button
                            onClick={fetchRepos}
                            disabled={loadingRepos}
                            className="text-sm px-3 py-1.5 rounded-lg bg-black text-white hover:opacity-90 active:opacity-80 disabled:opacity-60"
                        >
                            {loadingRepos ? '불러오는 중…' : '리포 불러오기'}
                        </button>
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
                                    onFetchRepos={fetchRepos}
                                    onCreateRepo={handleCreate}
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
                                    className="min-h-[calc(100vh-220px)] overflow-y-auto rounded-l-lg border-t border-l border-b bg-gray-50">
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

                                    {tab === 'info' && (
                                        <RepoContent
                                            key={`detail-${selectedRepo.id}`}
                                            repo={selectedRepo}
                                            repositories={repositories}
                                            onChangeRepo={setSelectedRepoId}
                                            onClose={onClose}
                                            useExternalSidebar={true}
                                        />
                                    )}

                                    {tab === 'posts' && (
                                        <PostsPanel repositoryId={selectedRepo.id}/>
                                    )}
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

                    {/*<div className="text-center mt-6">*/}
                    {/*    <button*/}
                    {/*        onClick={() => router.replace('/DiFF/home/main')}*/}
                    {/*        className="px-6 py-2 text-sm bg-neutral-800 text-white rounded hover:bg-neutral-700"*/}
                    {/*    >*/}
                    {/*        메인으로 가기*/}
                    {/*    </button>*/}
                    {/*</div>*/}
                    {/*<div className="text-center mb-6">*/}
                    {/*    <button*/}
                    {/*        onClick={() => router.push('/DiFF/article/drafts')}*/}
                    {/*        className="px-6 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"*/}
                    {/*    >*/}
                    {/*        임시저장*/}
                    {/*    </button>*/}
                    {/*</div>*/}
                </div>
            </section>
        </LayoutGroup>
    );
}
