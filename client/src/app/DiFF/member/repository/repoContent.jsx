'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUser } from '@/lib/UserAPI';
import { fetchArticles, getAverageMetrics } from '@/lib/ArticleAPI';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 🔹 repobar 느낌: 컨테이너 슬라이드 + 자식 stagger
const container = {
    hidden: { x: -40, opacity: 0 },
    show: {
        x: 0, opacity: 1,
        transition: {
            type: 'spring', stiffness: 120, damping: 20,
            when: 'beforeChildren',
            staggerChildren: 0.08,
            delayChildren: 0.02,
        },
    },
    exit: { x: -40, opacity: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } },
};

// 🔹 왼쪽 리스트 아이템: 살짝 미끄러짐
const listItem = {
    hidden: { x: -10, opacity: 0 },
    show:   { x: 0,  opacity: 1, transition: { type: 'spring', stiffness: 220, damping: 18 } },
};

// 🔹 중앙 상단 헤더/블록: 통통 튐
const block = {
    hidden: { y: 8, opacity: 0, scale: 0.98 },
    show:   { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.28, duration: 0.45 } },
};

// 🔹 카드 그리드: 카드 stagger 래퍼
const cardsWrap = {
    hidden: {},
    show:   { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
};

// 🔹 카드: 살짝 튀면서 등장
const card = {
    hidden: { y: 10, opacity: 0, scale: 0.98 },
    show:   { y: 0,  opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.30, duration: 0.5 } },
};

// 🔹 오른쪽 패널: 우측에서 슥
const sidePanel = {
    hidden: { x: 16, opacity: 0 },
    show:   { x: 0,  opacity: 1, transition: { type: 'spring', stiffness: 180, damping: 22 } },
};

export default function RepoContent({ onClose }) {
    const router = useRouter();
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [articles, setArticles] = useState([]);
    const [articleLoading, setArticleLoading] = useState(false);

    // 🔹 분석 데이터 상태
    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        const accessToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');
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

            // 🔹 분석 데이터 가져오기
            const metricsRes = await getAverageMetrics(repo.id);
            setMetrics(metricsRes);

        } catch (err) {
            console.error('데이터 로딩 오류:', err);
            setArticles([]);
        } finally {
            setArticleLoading(false);
        }
    };

    if (loading) return <div>로딩중...</div>;

    // 🔹 차트 데이터 준비
    const chartData = metrics
        ? {
            labels: [
                'Coverage',
                'Bugs',
                'Complexity',
                'Code Smells',
                'Duplicated Lines',
                'Vulnerabilities',
                'Total Score',
            ],
            datasets: [
                {
                    label: '분석 평균',
                    data: [
                        metrics.coverage,
                        metrics.bugs,
                        metrics.complexity,
                        metrics.codeSmells,
                        metrics.duplicatedLinesDensity,
                        metrics.vulnerabilities,
                        metrics.totalScore,
                    ],
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                },
            ],
        }
        : null;

    return (
        <motion.div
            key={`detail-${selectedRepo?.id ?? 'none'}`} // repo 바뀔 때마다 enter 재생
            variants={container}
            initial="hidden"
            animate="show"
            exit="exit"
            className="absolute inset-0 grid grid-cols-[220px_1fr_300px] gap-0 bg-gray-100"
        >
            {/* 🔹 왼쪽: Repositories */}
            <aside className="border-r bg-gray-50 p-4">
                <ul className="space-y-2">
                    {repositories.map((repo) => {
                        const isSelected = selectedRepo?.id === repo.id;
                        return (
                            <motion.li
                                key={repo.id}
                                variants={listItem}
                                className={`px-3 py-1 rounded cursor-pointer flex items-center gap-2 text-sm hover:bg-gray-200 transition ${
                                    isSelected ? 'bg-gray-200 font-semibold' : ''
                                }`}
                                onClick={() => handleRepoClick(repo)}
                            >
                                <i
                                    className={`text-xl fa-solid ${
                                        isSelected ? 'fa-folder-open text-blue-400' : 'fa-folder text-blue-300'
                                    }`}
                                />
                                {repo.name}
                            </motion.li>
                        );
                    })}
                </ul>
            </aside>

            {/* 🔹 가운데: 선택된 레포의 게시물만 출력 */}
            <div className="p-6 overflow-y-auto">
                <motion.div variants={block} className="flex items-center justify-between mb-6">
                    {/*<h2 className="text-2xl font-semibold">*/}
                    {/*    {selectedRepo ? `${selectedRepo.name} 게시물` : '게시물'}*/}
                    {/*</h2>*/}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="px-3 py-1.5 text-sm bg-neutral-800 text-white rounded hover:bg-neutral-700"
                        >
                            닫기
                        </button>
                    )}
                </motion.div>

                {articleLoading ? (
                    <p>게시글 불러오는 중...</p>
                ) : articles.length > 0 ? (
                    <motion.div
                        key={`cards-${selectedRepo?.id}-${articles.length}`}
                        variants={cardsWrap}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {articles.map((article, idx) => (
                            <motion.div
                                key={article.id ?? idx}
                                variants={card}
                                whileHover={{ scale: 1.02 }}
                                className="border border-gray-200 p-4 rounded-xl bg-white shadow-md hover:shadow-lg transition h-44 flex flex-col justify-between"
                                onClick={() => router.push(`/DiFF/article/detail?id=${article.id}`)}
                            >
                                <h3 className="font-bold text-lg line-clamp-2">
                                    {article.title || `게시물 ${idx + 1}`}
                                </h3>
                                <div className="text-sm text-gray-500 mt-2">
                                    <p> 작성자: {article.extra__writer || '익명'}</p>
                                    <p>
                                        {new Date(
                                            article.regDate
                                        ).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <p>등록된 게시물이 없습니다.</p>
                )}

                {/* 🔹 분석 그래프 크게 */}
                {metrics && (
                    <div className="border rounded-xl p-6 bg-white shadow-lg mt-8">
                        <strong className="block text-xl mb-4">
                            {selectedRepo?.name} 분석 결과
                        </strong>
                        <Bar
                            data={chartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    title: {
                                        display: true,
                                        text: `${selectedRepo?.name} 품질 지표`,
                                    },
                                },
                            }}
                        />
                    </div>
                )}
            </div>

            {/*🔹 오른쪽: 메타 정보 */}
            <motion.aside className="p-6 border-l bg-gray-50">
                {selectedRepo ? (
                    <motion.div layout className="border rounded-xl p-6 bg-white shadow-lg">
                        <strong className="block text-lg">메타 정보</strong>
                        <div className="text-sm text-gray-600 mt-3 space-y-2">
                            <div>
                                생성일:{' '}
                                {new Date(
                                    selectedRepo.regDate
                                ).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </div>
                            <div> 커밋 ID: {selectedRepo.lastRqCommit || '없음'}</div>
                            <div> 언어: {selectedRepo.language || 'N/A'}</div>
                        </div>
                    </motion.div>
                ) : (
                    <p className="text-gray-500">레포지토리를 선택하세요.</p>
                )}
            </motion.aside>
        </motion.div>
    );
}
