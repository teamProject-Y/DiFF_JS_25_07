'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { increaseArticleHits, searchArticles } from '@/lib/ArticleAPI';
import {searchMembers } from '@/lib/UserAPI';
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
        <div className="w-full min-h-screen overflow-auto">
            <div className="h-screen">
                <div className="mx-auto px-36 flex">
                    <main className="flex-grow">
                        {/* 타이틀 */}
                        <h1 className="text-2xl font-bold mb-4 text-gray-500">
                            Showing Results for <span className="text-black">"{keyword}"</span>
                        </h1>

                        {/* 탭 버튼 */}
                        <div className="flex items-center border-b ">
                            {['Article', 'Profile'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setActiveTab(t)}
                                    className={`p-4 -mb-px ${
                                        activeTab === t
                                            ? 'border-b-2 border-black font-semibold'
                                            : 'text-gray-500'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {/* 로딩 상태 */}
                        {loading ? (
                            <p>검색 중...</p>
                        ) : activeTab === 'Article' ? (
                            articles.length > 0 ? (
                                articles.map((article) => {
                                    const imgSrc = extractFirstImage(article.body);
                                    return (
                                        <div
                                            key={article.id}
                                            className="block cursor-pointer"
                                            onClick={() => handleArticleClick(article.id)}
                                        >
                                            <div
                                                className="flex h-52 border-b p-4 justify-center items-center hover:bg-gray-50 transition">
                                                {/* 왼쪽: 텍스트 */}
                                                <div className="h-full w-[70%] pr-8 flex flex-col">
                                                    <div className="text-sm text-gray-500">
                                                        in Search · by{' '}
                                                        {article.extra__writer ? (
                                                            <Link
                                                                href={`/DiFF/member/profile?nickName=${encodeURIComponent(
                                                                    article.extra__writer
                                                                )}`}
                                                                className="hover:underline hover:text-black cursor-pointer"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {article.extra__writer}
                                                            </Link>
                                                        ) : (
                                                            'Unknown'
                                                        )}
                                                    </div>
                                                    <div className="py-2 flex-grow text-black">
                                                        <h2 className="text-2xl py-2 font-black">
                                                            {article.title}
                                                        </h2>
                                                        <p className="clamp-2 text-sm text-gray-600 overflow-hidden">
                                                            {article.body ? removeMd(article.body) : ''}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>
                                                        {new Date(article.regDate).toLocaleDateString(
                                                            'en-US',
                                                            {year: 'numeric', month: 'short', day: 'numeric'}
                                                        )}
                                                    </span>
                                                        <span>view: {article.hits}</span>
                                                        <span>
                                                        <i className="fa-solid fa-comments"></i>{' '}
                                                            {article.extra__sumReplies}
                                                    </span>
                                                        <span>
                                                        <i className="fa-solid fa-heart"></i>{' '}
                                                            {article.extra__sumReaction}
                                                    </span>
                                                    </div>
                                                </div>

                                                {/* 오른쪽: 이미지 */}
                                                <div
                                                    className="w-[30%] h-[100%] bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                                                    {imgSrc ? (
                                                        <img
                                                            src={imgSrc}
                                                            alt="thumbnail"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-400">No Image</span>
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
                                    className="flex items-center gap-4 p-6 border-b"
                                >
                                    {/* 프로필 이미지 */}
                                    {m.profileUrl ? (
                                        <img
                                            src={m.profileUrl}
                                            alt={m.nickName}
                                            className="w-16 h-16 rounded-full object-cover border"
                                        />
                                    ) : (
                                        <div
                                            className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 text-4xl">
                                            <i className="fa-solid fa-skull"></i>
                                        </div>
                                    )}

                                    {/* 닉네임 + 이메일 */}
                                    <div className="ml-4">
                                        <Link
                                            href={`/DiFF/member/profile?nickName=${encodeURIComponent(
                                                m.nickName
                                            )}`}
                                            className="text-xl font-bold"
                                        >
                                            {m.nickName}
                                        </Link>
                                        <p className="text-sm text-gray-600">{m.email}</p>
                                    </div>
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