'use client';

import { useEffect, useState } from 'react';
import { useSearchParams} from 'next/navigation';
import { searchArticles } from '@/lib/ArticleAPI';
import Link from 'next/link';

export default function SearchPage() {
    const sp = useSearchParams();
    const keyword = sp.get('keyword') || '';
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);



    useEffect(() => {
        if (!keyword) return;
        (async () => {
            try {
                setLoading(true);
                const res = await searchArticles(keyword);
                if (res?.resultCode?.startsWith('S-')) {
                    setArticles(res.data1 || []);
                } else {
                    setArticles([]);
                }
            } catch (err) {
                console.error('검색 실패:', err);
                setArticles([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [keyword]);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">검색 결과: "{keyword}"</h1>

            {loading ? (
                <p>검색 중...</p>
            ) : articles.length === 0 ? (
                <p>검색 결과가 없습니다.</p>
            ) : (
                <ul className="space-y-4">
                    {articles.map((a) => (
                        <Link
                            key={a.id}
                            href={`/DiFF/article/detail?id=${a.id}`}
                            className="block border p-4 rounded-md hover:bg-gray-50"
                        >
                            <h2 className="text-lg font-semibold hover:underline">{a.title}</h2>
                            <p className="text-sm text-gray-600">by {a.nickName}</p>
                            <p className="text-gray-800">{a.body?.slice(0, 100)}...</p>
                        </Link>
                    ))}
                </ul>
            )}
        </div>
    );
}
