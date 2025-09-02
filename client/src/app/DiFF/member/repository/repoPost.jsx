// src/common/RepoPost.jsx
'use client';

import {useEffect, useState} from 'react';
import {fetchArticles, increaseArticleHits} from '@/lib/ArticleAPI';
import {useRouter} from 'next/navigation';

function PostCard({article}) {
    const router = useRouter();

    const handleArticleClick = async (id) => {
        try {
            await increaseArticleHits(id);  청
            window.location.href = `/DiFF/article/detail?id=${id}`;
        } catch (err) {
            console.error("조회수 증가 실패:", err);
            window.location.href = `/DiFF/article/detail?id=${id}`;
        }
    };

    return (
        <div
            onClick={() => handleArticleClick(article.id)}
            className="block cursor-pointer border rounded-xl p-4 hover:bg-gray-50 transition"
        >
            {/* 제목 */}
            <h2 className="text-xl font-bold mb-3 line-clamp-2">{article.title}</h2>

            {/* 메타 정보 */}
            <div className="flex gap-6 text-sm text-gray-600">
                <span>view: {article.hits}</span>
                <span>
                    <i className="fa-solid fa-comments"></i> {article.extra__sumReplies}
                </span>
                <span>
                    <i className="fa-solid fa-heart"></i> {article.extra__sumReaction}
                </span>
            </div>
        </div>
    );
}

export default function RepoPost({repoId}) {
    const [loading, setLoading] = useState(true);
    const [articles, setArticles] = useState([]);
    const [error, setError] = useState('');

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

                const root = resp ?? {};
                const list = root?.data?.articles ?? root?.articles ?? root?.data ?? [];
                if (mounted && Array.isArray(list)) {
                    // id를 항상 문자열로 변환해서 안전하게 저장
                    const normalized = list.map(a => ({
                        ...a,
                        id: String(a.id ?? a.articleId ?? crypto.randomUUID()),
                    }));
                    setArticles(normalized);
                }
            } catch (e) {
                if (mounted) {
                    setArticles([{
                        id: 'demo-1',
                        title: 'Demo Post',
                        hits: 123,
                        extra__sumReplies: 5,
                        extra__sumReaction: 10,
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
            {loading && <div className="py-10 text-center text-gray-500">loading...</div>}
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
                        <PostCard key={a.id} article={a}/>
                    ))}
                </div>
            )}
        </div>
    );
}
