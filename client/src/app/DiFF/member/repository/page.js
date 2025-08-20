'use client';

import { useRouter } from 'next/navigation';
import { fetchUser } from "@/lib/UserAPI";
import { useEffect, useMemo, useState, useCallback } from "react";
import { LayoutGroup, AnimatePresence } from "framer-motion";

import RepoFolder from './repoFolder';
import RepoFolderbar from './repoFolderbar';
import RepoContent from './repoContent';

export default function RepositoriesPage() {
    const router = useRouter();
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRepoId, setSelectedRepoId] = useState(null);

    // 로그인 체크 + 레포 로드
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
            .catch(err => {
                console.error("레포지토리 오류:", err);
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


                        {/* 메인 영역 */}
                        <div className="flex-1 relative">
                            {/* 초기 그리드 */}
                            <AnimatePresence initial={false}>
                                {!selectedRepo && (
                                    <RepoFolder
                                        repositories={repositories}
                                        onSelect={setSelectedRepoId}
                                    />
                                )}
                            </AnimatePresence>

                            {/* 레포 상세 */}
                            <AnimatePresence>
                                {selectedRepo && (
                                    <RepoContent
                                        repo={selectedRepo}
                                        onClose={onClose}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
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

//
//
// 'use client';
//
// import { useRouter } from 'next/navigation'
// import { fetchUser } from "@/lib/UserAPI";
// import { useEffect,useState } from "react";
//
// export default function RepositoriesPage() {
//     const router = useRouter();
//     const [repositories, setRepositories] = useState([]);
//     const [loading, setLoading] = useState(true);
//
//     useEffect(() => {
//         const accessToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');
//         if (!accessToken) {
//             router.replace('/DiFF/member/login');
//             return;
//         }
//
//         fetchUser()
//             .then(res => {
//                 setRepositories(res.repositories);
//                 setLoading(false);
//             })
//             .catch(err => {
//                 console.error("레포지토리 오류:", err);
//                 setLoading(false);
//                 router.replace('/DiFF/home/main');
//             });
//     }, [router]);
//
//     if (loading) return <div>로딩...</div>;
//
//     return (
//         <section className="mt-24 text-xl px-4">
//             <div className="mx-auto max-w-5xl">
//                 <h2 className="text-2xl font-semibold mb-4">내 레포지토리</h2>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {repositories?.length > 0 ? (
//                         repositories.map((repo, idx) => (
//                             <div
//                                 key={repo.id}
//                                 className="border border-gray-300 p-4 rounded-lg bg-white shadow-md cursor-pointer hover:bg-gray-100 transition"
//                                 onClick={() => router.push(`/DiFF/article/list?repositoryId=${repo.id}`)}
//                             >
//                                 <h3 className="font-bold text-lg mb-2">
//                                     {repo.name || `Repository ${idx + 1}`}
//                                 </h3>
//                                 <p className="text-sm text-gray-500 mb-1">
//                                     생성일: {repo.regDate?.split('T')[0]}
//                                 </p>
//                                 <p className="text-sm text-gray-500 mb-1">
//                                     커밋 ID: {repo.lastRqCommit || '없음'}
//                                 </p>
//                             </div>
//                         ))
//                     ) : (
//                         <p>등록된 레포지토리가 없습니다.</p>
//                     )}
//                 </div>
//
//                 {/* 🔹 뒤로가기 */}
//                 <div className="text-center">
//                     <button
//                         onClick={() => router.replace('/DiFF/home/main')}
//                         className="px-6 py-2 text-sm bg-neutral-800 text-white rounded hover:bg-neutral-700"
//                     >
//                         메인으로 가기
//                     </button>
//                 </div>
//             </div>
//         </section>
//     );
// }
