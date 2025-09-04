'use client';

import AnalysisGraph from "./analysisGraph";
import { useEffect, useState } from 'react';
import { fetchArticles, increaseArticleHits } from '@/lib/ArticleAPI';
import { useRouter } from 'next/navigation';
import Link from "next/link";

// --- Minimal monochrome skeleton while loading ---
function PostSkeleton() {
    return (
        <div className="rounded-xl border border-neutral-200 p-4">
            <div className="h-5 w-2/5 rounded bg-neutral-200 animate-pulse" />
            <div className="mt-3 flex gap-6">
                <div className="h-3 w-16 rounded bg-neutral-200 animate-pulse" />
                <div className="h-3 w-16 rounded bg-neutral-200 animate-pulse" />
                <div className="h-3 w-16 rounded bg-neutral-200 animate-pulse" />
            </div>
            <div className="mt-5 h-28 rounded-lg bg-neutral-100" />
        </div>
    );
}

// --- Chic empty state ---
function EmptyState() {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
            {/* subtle background vibe */}
            <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_30%,white,transparent)]">
                <div className="absolute -inset-[1px] bg-gradient-to-b from-neutral-50 to-white" />
            </div>

            <div className="relative mx-auto flex w-full max-w-md flex-col items-center gap-6">
                <div className="flex w-40 flex-col gap-2">
                    <div className="h-2 w-24 self-center rounded-full bg-neutral-300" />
                    <div className="h-16 rounded-lg border border-dashed border-neutral-300" />
                    <div className="grid grid-cols-3 gap-1">
                        <div className="h-1.5 rounded bg-neutral-200" />
                        <div className="h-1.5 rounded bg-neutral-200" />
                        <div className="h-1.5 rounded bg-neutral-200" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-semibold tracking-tight text-neutral-900">Nothing here yet.</h3>
                    <p className="text-sm text-neutral-500">Start your first post and keep it clean, bold, and yours.</p>
                </div>

                <Link
                    href="/DiFF/article/write"
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-900 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:-translate-y-0.5 hover:bg-neutral-900 hover:text-white"
                >
                    Start a new post
                    <span aria-hidden>→</span>
                </Link>

                {/* tiny helper line */}
                <p className="text-xs text-neutral-400">No clutter. Just your work.</p>
            </div>
        </div>
    );
}

// --- Individual post card ---
function PostCard({ article }) {
    const { analysis } = article;

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
            className="cursor-pointer rounded-lg border border-neutral-200 p-4 transition hover:bg-neutral-50"
        >
            <h2 className="text-lg font-bold text-neutral-900">{article.title}</h2>
            <div className="my-2 flex gap-6 text-sm text-neutral-600">
                <span>view: {article.hits}</span>
                <span>
                    <i className="fa-regular fa-comment" /> {article.extra__sumReplies}
                </span>
                <span>
                  <i className="fa-regular fa-heart" /> {article.extra__sumReaction}
                </span>
            </div>

            {analysis && (
                <div className="mt-5 p-1 bg-red-300">
                    <AnalysisGraph analysis={analysis} />
                </div>
            )}
        </div>
    );
}

// --- Post list ---
export default function RepoPost({ repoId }) {
    const [loading, setLoading] = useState(true);
    const [articles, setArticles] = useState([]);
    const [error, setError] = useState('');

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
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            )}

            {!loading && error && (
                <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                    Couldn't load posts. Showing a demo card. <span className="text-neutral-400">({error})</span>
                </div>
            )}

            {!loading && !articles.length && <EmptyState />}

            <div className="rounded-xl border border-neutral-200 p-4">
                <div className="h-5 w-2/5 rounded bg-neutral-200 animate-pulse" />
                <div className="mt-3 flex gap-6">
                    <div className="h-3 w-16 rounded bg-neutral-200 animate-pulse" />
                    <div className="h-3 w-16 rounded bg-neutral-200 animate-pulse" />
                    <div className="h-3 w-16 rounded bg-neutral-200 animate-pulse" />
                </div>
                <div className="mt-5 h-28 rounded-lg bg-neutral-100" />
            </div>

            {!loading && articles.length > 0 && (
                <div className="grid grid-cols-1 gap-5">
                    {articles.map((a) => (
                        <PostCard key={a.id} article={a} />
                    ))}
                </div>
            )}
        </div>
    );
}
