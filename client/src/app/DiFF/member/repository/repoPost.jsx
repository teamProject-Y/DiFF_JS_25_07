'use client';

import AnalysisGraph from "./analysisGraph";
import {useEffect, useState} from 'react';
import {fetchArticles, increaseArticleHits} from '@/lib/ArticleAPI';
import {useRouter} from 'next/navigation';
import Link from "next/link";
import {useTheme} from "@/common/thema";

function PostSkeleton() {
    return (
        <div
            className="group cursor-pointer rounded-xl border transition-transform duration-200
            border-neutral-200 hover:bg-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-900/50"
            role="status"
            aria-busy="true"
        >
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="h-5 w-2/5 rounded animate-pulse bg-neutral-200 dark:bg-neutral-700" />
                </div>

                <div className="ml-1 my-2 flex flex-wrap items-center gap-3 text-xs">
                    <div className="h-3 w-16 rounded animate-pulse bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-3 w-16 rounded animate-pulse bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-3 w-16 rounded animate-pulse bg-neutral-200 dark:bg-neutral-700" />
                </div>
            </div>

            <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
                <div className="h-20 rounded-lg animate-pulse bg-neutral-100 dark:bg-neutral-700" />
            </div>
        </div>
    );
}

// --- Chic empty state ---
function EmptyState(isMyRepo) {
    return (
        <div
            className="h-full flex flex-col justify-around relative overflow-hidden rounded-lg border p-10 text-center shadow-sm
            border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">

            <div className="relative mx-auto flex w-full max-w-md flex-col items-center gap-6">

                {isMyRepo ?
                    <>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Nothing
                                here yet.</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Start your first post and keep
                                it
                                clean, bold, and yours.</p>
                        </div>
                        <Link
                            href="/DiFF/article/write"
                            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5
                                        hover:text-white hover:bg-neutral-700 border-neutral-700 text-neutral-700
                                        dark:border-neutral-300 dark:text-neutral-300 dark:hover:bg-neutral-300 dark:hover:text-neutral-900"
                        >
                            Start a new post →
                        </Link>
                    </>
                    :
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Nothing
                            here yet.</h3>
                    </div>
                }
            </div>
        </div>
    );
}

// --- Individual post card ---
function PostCard({article}) {
    const {analysis} = article;

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
            className="group cursor-pointer rounded-lg border transition-transform duration-200
            border-gray-200 hover:bg-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-900/50"
        >
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <h2 className="line-clamp-2 text-base font-semibold tracking-tight
                    text-neutral-900 dark:text-neutral-300">
                        {article.title || 'Untitled'}
                    </h2>
                </div>

                <div className="ml-1 my-2 flex flex-wrap items-center gap-3 text-xs
                text-gray-500 dark:text-neutral-400">
                    <span>
                        view {article.hits}
                    </span>

                    <span className="flex items-center gap-1">
                        <i className="fa-regular fa-comment" aria-hidden/>
                        {article.extra__sumReplies}
                        <span className="sr-only">comments</span>
                    </span>

                    <span className="flex items-center gap-1">
                        <i className="fa-regular fa-heart" aria-hidden/>
                        {article.extra__sumReaction}
                        <span className="sr-only">reactions</span>
                 </span>
                </div>
            </div>

            {analysis && (
                <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
                    <AnalysisGraph analysis={analysis}/>
                </div>
            )}
        </div>
    );
}

// --- Post list ---
export default function RepoPost({repoId, isMyRepo}) {
    const [loading, setLoading] = useState(true);
    const [articles, setArticles] = useState([]);
    const [error, setError] = useState('');

    let theme = useTheme();

    const mapArticles = (payload) => {

        const root = payload ?? {};
        const list = root?.data?.articles ?? root?.articles ?? root?.data ?? [];

        if (!Array.isArray(list)) return [];

        return list.map((a) => {

            return {
                id: a?.id ?? a?.articleId ?? crypto.randomUUID(),
                title: a?.title ?? "(No title)",
                hits: a?.hits ?? 0,
                extra__sumReplies: a?.extra__sumReplies ?? 0,
                extra__sumReaction: a?.extra__sumReaction ?? 0,
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
                    setArticles([
                        {
                            id: 'demo-1',
                            title: 'Demo Post',
                            hits: 123,
                            extra__sumReplies: 5,
                            extra__sumReaction: 10,
                            analysis: null,
                        },
                    ]);
                    setError(e?.message || 'Request failed');
                    console.error('[RepoPost] fetchArticles error:', e);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [repoId]);

    return (
        <div className="absolute inset-0 overflow-y-auto p-6">
            {loading && (
                <div className="grid grid-cols-1 gap-6">
                    <PostSkeleton/>
                    <PostSkeleton/>
                    <PostSkeleton/>
                </div>
            )}

            {!loading && error && (
                <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                    Couldn't load posts. Showing a demo card. <span className="text-neutral-400">({error})</span>
                </div>
            )}

            {!loading && !articles.length && <EmptyState isMyRepo={isMyRepo}/>}

            {!loading && articles.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                    {articles.map((a) => (
                        <PostCard key={a.id} article={a} isMyRepo={isMyRepo}/>
                    ))}
                </div>
            )}
        </div>
    );
}
