'use client';

import {useRouter} from 'next/navigation';
import {fetchUser} from "@/lib/UserAPI";
import {useEffect, useMemo, useState, useCallback} from "react";
import {LayoutGroup, AnimatePresence} from "framer-motion";

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
    const [loading, setLoading] = useState(true); // 초기 사용자/페이지 로딩
    const [loadingRepos, setLoadingRepos] = useState(false); // 버튼 로딩
    const [error, setError] = useState('');
    const [selectedRepoId, setSelectedRepoId] = useState(null);

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

            // ResultData 또는 에러 포맷 대응
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

                    <div
                        className="relative flex border border-gray-200 rounded-lg shadow overflow-hidden min-h-[520px]">
                        <AnimatePresence>
                            {selectedRepo && <GhostBar repositories={repositories} selectedRepoId={selectedRepoId}
                                                       onSelect={setSelectedRepoId}/>}
                        </AnimatePresence>

                        <div className="flex-1 relative">
                            {/* 기본(첫 화면): 카드 그리드만 */}
                            <AnimatePresence>
                                {!selectedRepo && (
                                    <RepoFolder
                                        key="grid"
                                        repositories={repositories}
                                        onSelect={setSelectedRepoId}
                                    />
                                )}
                            </AnimatePresence>

                            {/* 상세: 선택되면 표시 (필요 시 RepoContent 내부에서 파란 리스트/메타 표시) */}
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
                    <br/>
                    {/* 레포 이동 */}
                    <div className="text-center mb-6">
                        <button
                            onClick={() => router.push('/DiFF/member/profile')}
                            className="px-6 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"
                        >
                            내 프로필 보기
                        </button>
                    </div>

                    <div className="text-center mt-6">
                        <button
                            onClick={() => router.replace('/DiFF/home/main')}
                            className="px-6 py-2 text-sm bg-neutral-800 text-white rounded hover:bg-neutral-700"
                        >
                            메인으로 가기
                        </button>
                    </div>
                </div>
            </section>
        </LayoutGroup>
    );
}
