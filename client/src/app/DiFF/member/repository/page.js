// src/app/DiFF/member/repository/page.jsx (혹은 해당 파일)

'use client';

import {useRouter} from 'next/navigation';
import {fetchUser} from "@/lib/UserAPI";
import {useEffect, useMemo, useState, useCallback} from "react";
import {LayoutGroup, AnimatePresence} from "framer-motion";

import RepoFolder from './repoFolder';
import RepoContent from './repoContent';
import GhostBar from './RepoGhostBar';

export default function RepositoriesPage() {
    const router = useRouter();
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRepoId, setSelectedRepoId] = useState(null);

    useEffect(() => {
        const accessToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');
        if (!accessToken) {
            router.replace('/DiFF/member/login');
            return;
        }
        fetchUser()
            .then(res => {
                setRepositories(res.repositories || []);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                router.replace('/DiFF/home/main');
            });
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
                    <h2 className="text-2xl font-semibold mb-6">내 레포지토리</h2>

                    <div className="relative flex border border-gray-200 rounded-lg shadow overflow-hidden min-h-[520px]">
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
                                        key={`detail-${selectedRepo.id}`}
                                        repo={selectedRepo}
                                        repositories={repositories}
                                        onChangeRepo={setSelectedRepoId}
                                        onClose={onClose}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>
        </LayoutGroup>
    );
}
