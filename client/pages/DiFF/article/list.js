// pages/DiFF/article/list.js
'use client';

import { useEffect, useState } from 'react';
import { fetchArticles } from '../../../src/lib/ArticleAPI'; //


export default function ArticleListPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    // CSR 상태값
    const [page, setPage] = useState(1);;
    const [searchItem, setSearchItem] = useState(1);
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        const loadArticles = async () => {
            try {
                const res = await fetchArticles({
                    searchItem,
                    keyword,
                    page
                });

                // ✅ 응답 구조 확인: articles, data, content, etc.
                setArticles(res); // 예: res.articles, res.data.articles, etc.
            } catch (err) {
                console.error('📛 게시글 불러오기 실패:', err);
            } finally {
                setLoading(false);
            }
        };

        loadArticles();
    }, [searchItem, keyword, page]);

    return (
        <div>
            <h1>게시판</h1>
            {loading ? (
                <p>불러오는 중...</p>
            ) : (
                articles.length > 0 ? (
                    articles.map(article => (
                        <div key={article.id}>
                            <h2>{article.title}</h2>
                            <p>{article.body}</p>
                        </div>
                    ))
                ) : (
                    <p>게시글이 없습니다.</p>
                )
            )}
        </div>
    );
}
