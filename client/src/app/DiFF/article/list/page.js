'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchArticles } from '@/lib/ArticleAPI';

function ArticleListInner() {
    const searchParams = useSearchParams();
    const repositoryId = searchParams.get('repositoryId') || null;

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [searchItem, setSearchItem] = useState(0);
    const [keyword, setKeyword] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const param = searchParams.get('filter');
        if (param) setFilter(param);
    }, [searchParams]);

    useEffect(() => {
        let alive = true;
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetchArticles({ repositoryId, searchItem, keyword, page });
                if (!alive) return;
                setArticles(res.articles || []);
            } catch (err) {
                console.error('❌ 게시글 로딩 실패:', err);
                if (!alive) return;
                setArticles([]);
            } finally {
                if (alive) setLoading(false);
            }
        };
        load();
        return () => { alive = false; };
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

export default function Page() {
    // 여기서는 hook 안 쓰고, 아래를 Suspense로 감싸기만 함
    return (
        <Suspense fallback={<p>불러오는 중...</p>}>
            <ArticleListInner />
        </Suspense>
    );
}
