'use client';

import {useEffect, useState} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import {increaseArticleHits, searchArticles} from '@/lib/ArticleAPI';
import {searchMembers} from '@/lib/UserAPI';
import Link from 'next/link';

function extractFirstImage(markdown) {
    if (!markdown) return null;
    const regex = /!\[.*?\]\((.*?)\)/;
    const match = regex.exec(markdown);
    return match ? match[1] : null;
}

function removeMd(md) {
    if (!md) return '';
    return md
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[#>*`~\-+_=]/g, '')
        .trim();
}

export default function SearchPage() {
    const sp = useSearchParams();
    const router = useRouter();
    const keyword = sp.get('keyword') || '';
    const [articles, setArticles] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Article');


    const handleArticleClick = async (id) => {
        try {
            await increaseArticleHits(id);
            router.push(`/DiFF/article/detail?id=${id}`);
        } catch (e) {
            console.error('조회수 증가 실패', e);
            router.push(`/DiFF/article/detail?id=${id}`);
        }
    };

    useEffect(() => {
        if (!keyword) return;
        (async () => {
            setLoading(true);
            try {
                // 게시글 검색
                const articleRes = await searchArticles(keyword);
                if (articleRes?.resultCode?.startsWith('S-')) {
                    setArticles(articleRes.data1 || []);
                }

                // 멤버 검색
                const memberRes = await searchMembers(keyword);
                if (memberRes?.resultCode?.startsWith('S-')) {
                    setMembers(memberRes.data1 || []);
                }
            } catch (err) {
                console.error('검색 실패:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [keyword]);

    return (
        <div className="w-full min-h-full overflow-auto">
            <div className="h-screen">
                <div className="mx-auto px-32 flex">
                    <main className="flex-grow">
                        {/* 타이틀 */}
                        <h1 className="text-2xl font-bold my-4 text-gray-500 dark:text-neutral-500">
                            Showing Results for <span className="text-black dark:text-neutral-300">"{keyword}"</span>
                        </h1>

                        {/* 탭 버튼 */}
                        <div className="flex items-center border-b dark:border-neutral-700">
                            {['Article', 'Profile'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setActiveTab(t)}
                                    className={`p-4 -mb-px ${
                                        activeTab === t
                                            ? "border-b-2 font-semibold border-black dark:border-neutral-400 dark:text-neutral-300"
                                            : "text-gray-500 dark:text-neutral-600"
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {/* 로딩 상태 */}
                        {loading ? (
                            <p>Searching...</p>
                        ) : activeTab === 'Article' ? (
                            articles.length > 0 ? (
                                articles.map((article) => {
                                    const imgSrc = extractFirstImage(article.body);
                                    return (
                                        <div
                                            key={article.id}
                                            className="block cursor-pointer text-gray-500 dark:text-neutral-400"
                                            onClick={() => handleArticleClick(article.id)}
                                        >
                                            <div
                                                className="flex h-52 border-b p-4 justify-center items-center transition
                                                hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
                                                <div className="h-full w-[70%] pr-8 flex flex-col">
                                                    <div className="text-sm ">
                                                        in Search · by{' '}
                                                        {article.extra__writer ? (
                                                            <Link
                                                                href={`/DiFF/member/profile?nickName=${encodeURIComponent(
                                                                    article.extra__writer
                                                                )}`}
                                                                className="hover:underline cursor-pointer hover:text-black dark:hover:text-neutral-200"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {article.extra__writer}
                                                            </Link>
                                                        ) : (
                                                            'Unknown'
                                                        )}
                                                    </div>
                                                    <div className="py-2 flex-grow">
                                                        <h2 className="text-2xl py-2 font-black text-gray-900 dark:text-neutral-300">{article.title}</h2>
                                                        <p className="clamp-2 text-sm  overflow-hidden">
                                                            {article.body ? removeMd(article.body) : ""}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm">
                                                    <span>
                                                        {new Date(article.regDate).toLocaleDateString(
                                                            'en-US',
                                                            {year: 'numeric', month: 'short', day: 'numeric'}
                                                        )}
                                                    </span>
                                                        <span>view: {article.hits}</span>
                                                        <span>
                                                        <i className="fa-regular fa-comment"></i>{' '}
                                                            {article.extra__sumReplies}
                                                    </span>
                                                        <span>
                                                        <i className="fa-regular fa-heart"></i>{' '}
                                                            {article.extra__sumReaction}
                                                    </span>
                                                    </div>
                                                </div>

                                                {/* 이미지 */}
                                                <div
                                                    className="w-[30%] h-[100%] bg-gray-200 dark:bg-neutral-700
                                                    rounded-xl flex items-center justify-center overflow-hidden">
                                                    {imgSrc ? (
                                                        <img
                                                            src={imgSrc}
                                                            alt="thumbnail"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span
                                                            className="dark:text-neutral-400 text-gray-400">No Image</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div>게시글 검색 결과가 없습니다.</div>
                            )
                        ) : members.length > 0 ? (
                            members.map((m) => (
                                <li
                                    key={m.id}
                                    className="border-b dark:border-neutral-700"
                                >
                                        <Link href={`/DiFF/member/profile?nickName=${encodeURIComponent(
                                            m.nickName)}`}
                                        className="flex items-center gap-4 p-6">
                                        {/* 프로필 이미지 */}
                                        {m.profileUrl ? (
                                            <img
                                                src={m.profileUrl}
                                                alt={m.nickName}
                                                className="w-16 h-16 rounded-full object-cover border"
                                            />
                                        ) : (
                                            <div
                                                className="w-16 h-16 rounded-full flex items-center justify-center text-4xl
                                            bg-gray-100 dark:text-neutral-500 dark:bg-neutral-600 dark:border-neutral-700">
                                                <i className="fa-solid fa-skull "></i>
                                            </div>
                                        )}

                                        {/* 닉네임 + 이메일 */}
                                        <div className="ml-4">
                                            <div
                                                className="text-xl font-bold dark:text-neutral-300"
                                            >
                                                {m.nickName}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-neutral-500">{m.email}</p>
                                        </div>
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <div>프로필 검색 결과가 없습니다.</div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}