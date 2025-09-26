'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchArticles, deleteArticle } from '@/lib/ArticleAPI';
import LoadingOverlay from "@/common/loadingOverlay";

function truncate(text = '', max = 100) {
    const t = String(text ?? '');
    return t.length > max ? `${t.slice(0, max)}…` : t;
}

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
                console.error(' post load failed:', err);
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
        <>
            <LoadingOverlay show={loading} />

            <div className="px-32 py-10">
                <h1 className="text-2xl font-bold mb-4">page error. redirect url.</h1>
                <ul className="space-y-4">
                    {articles.map((article) => (
                        <li key={article.id} className="border-b pb-4">
                            <Link
                                href={`/DiFF/article/detail?id=${article.id}`}
                                className="block group"
                            >
                                <h2 className="text-xl font-semibold group-hover:underline">
                                    {article.title}
                                </h2>
                                <p className="text-gray-700 mt-1 line-clamp-2">
                                    {article.body}
                                </p>
                                <div className="text-sm text-gray-500 mt-2">
                                    writer: {article.extra__writer ?? '익명'} | {new Date(article.regDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric"
                                })}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}


export default function Page() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <ArticleListInner />
        </Suspense>
    );
}