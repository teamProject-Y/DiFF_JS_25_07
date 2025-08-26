'use client';

import { useRouter } from 'next/navigation';
import { fetchUser } from "@/lib/UserAPI";
import { useEffect, useMemo, useState, useCallback } from "react";
import { LayoutGroup, AnimatePresence } from "framer-motion";
import { createRepository } from "@/lib/ArticleAPI";

import RepoFolder from './repoFolder';
import RepoContent from './repoContent';
import GhostBar from './RepoGhostBar';

const getAccessToken = () =>
    (typeof window !== 'undefined' &&
        (localStorage.getItem('accessToken') || localStorage.getItem('access_token'))) ||
    '';

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

    const [open, setOpen] = useState(false);
    const [name, setRepoName] = useState("");

    // 로그인 체크 + 레포 로드
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
    }, [router]);

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
            const list = Array.isArray(json?.data) ? json.data : Array.isArray(json?.data1) ? json.data1 : [];
            setRepositories(normalizeRepos(list));
            setSelectedRepoId(null);
        } catch (e) {
            setError(e?.message || '요청 실패');
        } finally {
            setLoadingRepos(false);
        }
    }, [router]);

    const selectedRepo = useMemo(
        () => repositories.find(r => r.id === selectedRepoId) || null,
        [repositories, selectedRepoId]
    );

    const onClose = useCallback(() => setSelectedRepoId(null), []);

    if (loading) return <div className="text-center">로딩...</div>;

    const handleCreate = async () => {
        if (!name.trim()) {
            setError("레포지토리 이름을 입력하세요.");
            return;
        }
        setLoading(true);
        setError("");

        try {
            const res = await createRepository({ name: name });
            if (res?.resultCode?.startsWith("S-")) {
                alert(res.msg);
                setOpen(false);
                setRepoName("");
                // 생성 후 다시 목록 불러오기
                await fetchRepos();
            } else {
                setError(res?.msg || "생성 실패");
            }
        } catch (err) {
            setError(err?.response?.data?.msg || "요청 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <LayoutGroup>
            <section className="px-4">
                <div className="mx-auto max-w-6xl">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                        내 리포지토리
                        <button
                            onClick={fetchRepos}
                            disabled={loadingRepos}
                            className="text-sm px-3 py-1.5 rounded-lg bg-black text-white hover:opacity-90 active:opacity-80 disabled:opacity-60"
                        >
                            {loadingRepos ? '불러오는 중…' : '리포 불러오기'}
                        </button>
                    </h2>

                    {error && <p className="mb-3 text-sm text-red-500">에러: {error}</p>}

                    <div className="relative flex border border-gray-200 rounded-lg shadow overflow-hidden min-h-[520px]">
                        <AnimatePresence>
                            {selectedRepo && (
                                <GhostBar repositories={repositories} selectedRepoId={selectedRepoId} onSelect={setSelectedRepoId} />
                            )}
                        </AnimatePresence>

                        <div className="flex-1 relative">
                            <AnimatePresence>
                                {!selectedRepo && (
                                    <RepoFolder
                                        key="grid"
                                        repositories={repositories}
                                        onSelect={setSelectedRepoId}
                                    />
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {selectedRepo && (
                                    <RepoContent
                                        key="detail"
                                        repo={selectedRepo}
                                        repositories={repositories}
                                        onChangeRepo={setSelectedRepoId}
                                        onClose={onClose}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

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
                </div>

                {/* ✅ 모달 */}
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
                                    {loading ? "생성 중..." : "생성"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </LayoutGroup>
    );
}

