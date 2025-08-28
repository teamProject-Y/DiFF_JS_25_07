'use client';

import { useRouter } from 'next/navigation';
import { fetchUser } from "@/lib/UserAPI";
import { useEffect, useMemo, useState, useCallback } from "react";
import { LayoutGroup, AnimatePresence } from "framer-motion";
import {createRepository, repositoryArticles} from "@/lib/ArticleAPI";

import RepoFolder from './repoFolder';
import RepoContent from './repoContent';
import GhostBar from './sideBar';

// ---------------------------------------------
// Helper Components
// ---------------------------------------------
// function IndexPanel({ repo }) {
//     return (
//         <div className="relative border border-gray-300 rounded-r-lg bg-white pt-7 h-[calc(100vh-220px)] overflow-auto px-6">
//             <div className="max-w-3xl mx-auto">
//                 <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
//                     <i className="fa-solid fa-magnifying-glass" /> 인덱스 정보
//                 </h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     <div className="p-4 rounded-xl border bg-gray-50">
//                         <div className="text-xs text-gray-500 uppercase">Repository</div>
//                         <div className="font-medium">{repo?.name || '—'}</div>
//                     </div>
//                     <div className="p-4 rounded-xl border bg-gray-50">
//                         <div className="text-xs text-gray-500 uppercase">Default Branch</div>
//                         <div className="font-medium">{repo?.defaultBranch || '—'}</div>
//                     </div>
//                     <div className="p-4 rounded-xl border bg-gray-50 sm:col-span-2">
//                         <div className="text-xs text-gray-500 uppercase">URL</div>
//                         {repo?.url ? (
//                             <a className="font-medium text-blue-600 hover:underline" href={repo.url} target="_blank" rel="noopener noreferrer">{repo.url}</a>
//                         ) : (
//                             <div className="font-medium text-gray-400">없음</div>
//                         )}
//                     </div>
//                     <div className="p-4 rounded-xl border bg-gray-50">
//                         <div className="text-xs text-gray-500 uppercase">Visibility</div>
//                         <div className="font-medium">{repo?.aprivate ? 'Private' : 'Public'}</div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

function PostsPanel({ repositoryId }) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");

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
                const res = await repositoryArticles({ repositoryId });
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

        return () => { ignore = true; };
    }, [repositoryId]);

    return (
        <div className="w-full h-full">
            <div className="w-[90%] mx-auto">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <i className="fa-regular fa-newspaper" /> 게시물
                </h3>

                {loading && <p className="text-sm text-gray-500">불러오는 중…</p>}
                {error && <p className="text-sm text-red-500">에러: {error}</p>}

                {!loading && !error && (
                    articles.length === 0 ? (
                        <p className="text-sm text-gray-500">아직 게시물이 없어요.</p>
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

// ---------------------------------------------
// Utils
// ---------------------------------------------
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

// ---------------------------------------------
// Page
// ---------------------------------------------
export default function RepositoriesPage() {
    const router = useRouter();
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [error, setError] = useState('');
    const [selectedRepoId, setSelectedRepoId] = useState(null);

    // tabs: 'index' | 'info' | 'posts'
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
                headers: { Authorization: `Bearer ${at}` },
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

    // 레포지토리 생성 → DB insert → state에 직접 추가
    const handleCreate = async () => {
        if (!name.trim()) {
            setError("레포지토리 이름을 입력하세요.");
            return;
        }
        setLoading(true);
        setError("");

        try {
            const res = await createRepository({ name });
            if (res?.resultCode?.startsWith("S-")) {
                alert(res.msg);
                setOpen(false);
                setRepoName("");

                // 새 레포 직접 state에 추가
                const newRepo = {
                    id: res.data, // 서버에서 newRepoId 내려줌
                    name,
                    url: "",
                    defaultBranch: "",
                    aprivate: false,
                };
                setRepositories((prev) => [...prev, newRepo]);
            } else {
                setError(res?.msg || "생성 실패");
            }
        } catch (err) {
            setError(err?.response?.data?.msg || "요청 실패");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center">로딩...</div>;

    return (
        <LayoutGroup>
            <section className="px-4">
                <div className="mx-auto max-w-6xl">
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
                        <div className="relative flex border border-gray-200 rounded-lg shadow overflow-hidden min-h-[520px] bg-white">
                            <AnimatePresence>
                                <RepoFolder
                                    key="grid"
                                    repositories={repositories}
                                    onSelect={setSelectedRepoId} />
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* 탭 */}
                            <div className="absolute -top-9 left-[230px] flex">
                                {[
                                    // { key: 'index', label: '인덱스' },
                                    { key: 'info', label: 'Info' },
                                    { key: 'posts', label: 'Posts' },
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
                                <aside className="min-h-[calc(100vh-220px)] overflow-y-auto rounded-l-lg border-t border-l border-b bg-gray-50">
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
                                                    <i className={`fa-solid ${sel ? 'fa-folder-open text-neutral-500' : 'fa-folder text-neutral-400'}`} />
                                                    <span className="truncate">{r.name}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </aside>

                                {/* 메인 컨텐츠 */}
                                <div className="relative border border-gray-300 rounded-r-lg bg-white pt-8 h-[calc(100vh-220px)] overflow-hidden">
                                    <GhostBar repositories={repositories} />

                                    {/*{tab === 'index' && (*/}
                                    {/*    <IndexPanel repo={selectedRepo} />*/}
                                    {/*)}*/}

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
                                        <PostsPanel repositoryId={selectedRepo.id} />
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

                        <button
                            onClick={() => setOpen(true)}
                            className="px-6 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"
                        >
                            레포지토리 생성
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

                    <div className="text-center mt-6">
                        <button
                            onClick={() => router.replace('/DiFF/home/main')}
                            className="px-6 py-2 text-sm bg-neutral-800 text-white rounded hover:bg-neutral-700"
                        >
                            메인으로 가기
                        </button>
                    </div>
                    <div className="text-center mb-6">
                        <button
                            onClick={() => router.push('/DiFF/article/drafts')}
                            className="px-6 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"
                        >
                            임시저장
                        </button>
                    </div>
                </div>
            </section>
        </LayoutGroup>
    );
}
