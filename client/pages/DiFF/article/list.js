// pages/DiFF/article/list.js
import { useEffect, useState } from 'react';
import {fetchArticles} from "@/lib/ArticleAPI";
 // 경로 확인!

export default function ArticleListPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    // 상태: 검색 조건이나 페이지
    const [page, setPage] = useState(1);
    const [searchItem, setSearchItem] = useState(0);
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        const load = async () => {
            console.log("📦 fetchArticles 요청 시작:", { searchItem, keyword, page });
            try {
                const res = await fetchArticles({ searchItem, keyword, page });
                console.log("✅ fetchArticles 응답 성공:", res);
                setArticles(res.articles);
            } catch (err) {
                console.error('❌ 게시글 로딩 실패:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [searchItem, keyword, page]);


    return (
        <div>
            <h1>게시글 목록</h1>
            {loading ? (
                <p>불러오는 중...</p>
            ) : (
                articles.map(article => (
                    <div key={article.id} style={{ marginBottom: '20px' }}>
                        <h2>{article.title}</h2>
                        <p>{article.body}</p>
                    </div>
                ))
            )}
        </div>
    );
}
