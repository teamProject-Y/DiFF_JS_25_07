'use client';

import Link from "next/link";

export default function AfterMainPage({ me, trendingArticles }) {
    const posts = Array.from({ length: 6 }).map((_, i) => ({
        id: i + 1,
        title: `Sample Title ${i + 1}`,
        preview: 'Preview text only for layout. Replace with your data.',
        channelName: 'Channel',
        authorName: 'Author',
        date: 'Jul 22',
        views: 1234,
        comments: 12,
    }));

    return (
        <div className="w-full min-h-screen bg-white text-black">
            <div className="h-screen pt-28">
                {/* 3열 */}
                <div className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-[220px_1fr_300px] gap-8">
                    {/* 왼쪽 */}
                    <aside className="space-y-6">
                        <nav className="space-y-3 text-gray-700">
                            <Link href="/DiFF/home/main" className="block hover:underline">
                                Home
                            </Link>
                            <Link href="/DiFF/member/myPage" className="block hover:underline">
                                Profile
                            </Link>
                            <Link href="/DiFF/member/repository" className="block hover:underline">
                                Repositories
                            </Link>
                        </nav>
                        <div className="pt-4 text-sm text-gray-500">
                            <div className="font-semibold mb-2">Following</div>
                            <p>Find more writers and publications to follow.</p>
                        </div>
                    </aside>

                    {/* 센터 피드 */}
                    <main className="space-y-8">
                        <div className="flex items-center gap-6 border-b">
                            {['Trending','Following'].map((t,i)=>(
                                <button key={t} className={`py-4 -mb-px ${i===0?'border-b-2 border-black font-semibold':'text-gray-500'}`}>{t}</button>
                            ))}
                        </div>

                        {trendingArticles && trendingArticles.length > 0 ? (
                            trendingArticles.map((article, idx) => (
                                <article key={idx} className="flex gap-6 border-b pb-8">
                                    <div className="flex-1 space-y-2">
                                        <div className="text-sm text-gray-500">
                                            in Trending · by {article.extra_writer || "Unknown"}
                                        </div>
                                        <h2 className="text-2xl font-extrabold">{article.title}</h2>
                                        <p className="text-gray-600">{article.body?.slice(0, 100) || "내용 미리보기 없음"}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{article.regDate}</span>
                                            <span>👀 {article.hits}</span>
                                            <button className="ml-auto px-3 py-1 rounded-full border">Save</button>
                                        </div>
                                    </div>
                                    <div className="w-[220px] h-[150px] bg-gray-200 rounded-xl" />
                                </article>
                            ))
                        ) : (
                            <div>트렌딩 게시물이 없습니다.</div>
                        )}
                    </main>

                    {/* 오른쪽 */}
                    <aside className="space-y-6">
                        <section className="border rounded-xl p-4">
                            <h3 className="font-semibold mb-3">Staff Picks</h3>
                            <ul className="space-y-3 text-sm text-gray-700">
                                <li>Pick 1</li><li>Pick 2</li><li>Pick 3</li>
                            </ul>
                        </section>
                        <section className="border rounded-xl p-4">
                            <h3 className="font-semibold mb-3">Hashtag</h3>
                            <div className="flex flex-wrap gap-2">
                                {['Data Science','Self Improvement','Writing','Relationships','Politics','Productivity'].map(t=>(
                                    <span key={t} className="px-3 py-1 rounded-full border text-sm">{t}</span>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}