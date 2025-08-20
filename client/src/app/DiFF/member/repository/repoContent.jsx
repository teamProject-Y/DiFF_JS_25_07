'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUser } from '@/lib/UserAPI';
import { fetchArticles } from '@/lib/ArticleAPI';

export default function RepoContent() {
    const router = useRouter();
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [articles, setArticles] = useState([]);
    const [articleLoading, setArticleLoading] = useState(false);

    useEffect(() => {
        const accessToken =
            typeof window !== 'undefined' && localStorage.getItem('accessToken');
        if (!accessToken) {
            router.replace('/DiFF/member/login');
            return;
        }

        fetchUser()
            .then(async (res) => {
                const repos = res.repositories || [];
                setRepositories(repos);
                setLoading(false);

                // 첫 로딩 시 첫 번째 레포 자동 선택
                if (repos.length > 0) {
                    await handleRepoClick(repos[0]);
                }
            })
            .catch((err) => {
                console.error('레포지토리 오류:', err);
                setLoading(false);
                router.replace('/DiFF/home/main');
            });
    }, [router]);

    // 레포 클릭 시 게시글 불러오기
    const handleRepoClick = async (repo) => {
        setSelectedRepo(repo);
        setArticleLoading(true);
        try {
            const res = await fetchArticles({
                repositoryId: repo.id,
                page: 1,
                searchItem: 0,
                keyword: '',
            });
            setArticles(res.articles || []);
        } catch (err) {
            console.error('게시글 로딩 오류:', err);
            setArticles([]);
        } finally {
            setArticleLoading(false);
        }
    };

    if (loading) return <div>로딩중...</div>;

    return (
        <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 grid grid-cols-[220px_1fr_300px] gap-0 bg-gray-100"
        >
            {/* 🔹 왼쪽: Repositories (단 하나만) */}
            <aside className="border-r bg-gray-50 p-4">
                <ul className="space-y-2">
                    {repositories.map((repo) => {
                        const isSelected = selectedRepo?.id === repo.id;
                        return (
                            <li
                                key={repo.id}
                                className={`px-3 py-1 rounded cursor-pointer flex items-center gap-2 text-sm hover:bg-gray-200 transition ${
                                    isSelected ? "bg-gray-200 font-semibold" : ""
                                }`}
                                onClick={() => handleRepoClick(repo)}
                            >
                                <i
                                    className={`text-xl fa-solid ${
                                        isSelected ? "fa-folder-open text-blue-400" : "fa-folder text-blue-300"
                                    }`}
                                ></i>
                                {repo.name}
                            </li>
                        );
                    })}
                </ul>
            </aside>

            {/* 🔹 가운데: 선택된 레포의 게시물만 출력 */}
            <div className="p-6 overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-6">
                    {selectedRepo ? `${selectedRepo.name} 게시물` : '게시물'}
                </h2>

                {articleLoading ? (
                    <p>게시글 불러오는 중...</p>
                ) : articles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article, idx) => (
                            <motion.div
                                key={article.id}
                                whileHover={{ scale: 1.02 }}
                                className="border border-gray-200 p-4 rounded-xl bg-white shadow-md hover:shadow-lg transition h-44 flex flex-col justify-between"
                                onClick={() =>
                                    router.push(`/DiFF/article/detail?id=${article.id}`)
                                }
                            >
                                <h3 className="font-bold text-lg line-clamp-2">
                                    {article.title || `게시물 ${idx + 1}`}
                                </h3>
                                <div className="text-sm text-gray-500 mt-2">
                                    <p> 작성자: {article.extra__writer || '익명'}</p>
                                    <p> 작성일: {article.regDate?.split('T')[0]}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p>등록된 게시물이 없습니다.</p>
                )}
            </div>

            {/* 🔹 오른쪽: 메타 정보 */}
            <aside className="p-6 border-l bg-gray-50">
                {selectedRepo ? (
                    <div className="border rounded-xl p-6 bg-white shadow-lg">
                        <strong className="block text-lg"> 메타 정보</strong>
                        <div className="text-sm text-gray-600 mt-3 space-y-2">
                            <div> 생성일: {selectedRepo.regDate?.split('T')[0]}</div>
                            <div> 커밋 ID: {selectedRepo.lastRqCommit || '없음'}</div>
                            <div> 언어: {selectedRepo.language || 'N/A'}</div>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">레포지토리를 선택하세요.</p>
                )}
            </aside>
        </motion.div>
    );
}
