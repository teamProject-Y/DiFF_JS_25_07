'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchArticles } from '@/lib/ArticleAPI';

export default function ArticleListPage() {
    const searchParams = useSearchParams();
    const repositoryId = searchParams.get('repositoryId'); // ← 여기서 추출

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [searchItem, setSearchItem] = useState(0);
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchArticles({repositoryId, searchItem, keyword, page}); // ← 넘겨줌
                setArticles(res.articles);
            } catch (err) {
                console.error('❌ 게시글 로딩 실패:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [repositoryId, searchItem, keyword, page]);


    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">게시글 목록</h1>
            {loading ? (
                <p className="text-gray-500">불러오는 중...</p>
            ) : articles.length === 0 ? (
                <p className="text-gray-500">게시글이 없습니다.</p>
            ) : (
                articles.map(article => (
                    <div key={article.id} className="mb-6 p-4 border border-gray-300 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
                        <p className="text-gray-700">{article.body}</p>
                    </div>
                ))
            )}
        </div>
    );
}
