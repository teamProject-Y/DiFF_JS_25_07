// src/common/RepoPost.jsx
'use client';

import AnalysisGraph from "./analysisGraph";
import { useEffect, useState } from 'react';
import { fetchArticles, increaseArticleHits } from '@/lib/ArticleAPI';
import { useRouter } from 'next/navigation';

// 개별 게시글 카드
function PostCard({ article }) {
    const router = useRouter();
    const { analysis } = article; // ✅ analysis 꺼내오기

    const handleArticleClick = async (id) => {
        try {
            await increaseArticleHits(id);
            window.location.href = `/DiFF/article/detail?id=${id}`;
        } catch (err) {
            console.error("조회수 증가 실패:", err);
            window.location.href = `/DiFF/article/detail?id=${id}`;
        }
    };

    return (
        <div
            onClick={() => handleArticleClick(article.id)}
            className="p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition"
        >
            <h2 className="text-lg font-bold mb-2">{article.title}</h2>
            <div className="flex gap-6 text-sm text-gray-600 mb-3">
                <span>view: {article.hits}</span>
                <span>
                    <i className="fa-solid fa-comments"></i> {article.extra__sumReplies}
                </span>
                <span>
                    <i className="fa-solid fa-heart"></i> {article.extra__sumReaction}
                </span>
            </div>

            {/* 분석 결과 */}
            {analysis && (
                <div className="mt-3">
                    <AnalysisGraph analysis={analysis} />
                </div>
            )}
        </div>
    );
}

// 게시글 목록
export default function RepoPost({ repoId }) {
    const [loading, setLoading] = useState(true);
    const [articles, setArticles] = useState([]);
    const [error, setError] = useState('');

    // ✨ 응답 필드 매핑 함수
    const mapArticles = (payload) => {
        console.log("📦 [mapArticles] payload:", payload);

        const root = payload ?? {};
        const list = root?.data?.articles ?? root?.articles ?? root?.data ?? [];

        console.log("📋 [mapArticles] list:", list);

        if (!Array.isArray(list)) return [];

        return list.map((a) => {
            console.log("📝 [mapArticles] single article:", a);

            return {
                id: a?.id ?? a?.articleId ?? crypto.randomUUID(),
                title: a?.title ?? "(제목 없음)",
                hits: a?.hits ?? a?.viewCount ?? 0,
                extra__sumReplies: a?.extra__sumReplies ?? a?.commentCount ?? 0,
                extra__sumReaction: a?.extra__sumReaction ?? a?.likeCount ?? 0,
                analysis: a?.analysis ?? null,
            };
        });
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setError('');
            try {
                const resp = await fetchArticles({
                    repositoryId: repoId,
                    searchItem: 0,
                    keyword: '',
                    page: 1,
                });

                const mapped = mapArticles(resp);
                if (mounted) setArticles(mapped);
            } catch (e) {
                if (mounted) {
                    setArticles([{
                        id: 'demo-1',
                        title: 'Demo Post',
                        hits: 123,
                        extra__sumReplies: 5,
                        extra__sumReaction: 10,
                        analysis: null,
                    }]);
                    setError(e?.message || '요청 실패');
                    console.error('[RepoPost] fetchArticles error:', e);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [repoId]);

    return (
        <div className="absolute inset-0 overflow-y-auto p-6">
            {loading && <div className="py-10 text-center text-gray-500">로딩 중…</div>}
            {!loading && error && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}
            {!loading && !articles.length && (
                <div className="py-10 text-center text-gray-500">게시물이 없어.</div>
            )}
            {!loading && articles.length > 0 && (
                <div className="grid gap-6 grid-cols-1">
                    {articles.map((a) => (
                        <PostCard key={a.id} article={a} />
                    ))}
                </div>
            )}
        </div>
    );
}
