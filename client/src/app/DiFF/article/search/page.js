'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {increaseArticleHits, searchArticles} from '@/lib/ArticleAPI';
import Link from 'next/link';

// ✅ 본문에서 첫 번째 이미지 추출
function extractFirstImage(markdown) {
    if (!markdown) return null;
    const regex = /!\[.*?\]\((.*?)\)/; // ![alt](url)
    const match = regex.exec(markdown);
    return match ? match[1] : null;
}

// ✅ 마크다운 제거 (간단 버전)
function removeMd(md) {
    if (!md) return '';
    return md
        .replace(/!\[.*?\]\(.*?\)/g, '') // 이미지 제거
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 링크 텍스트만
        .replace(/[#>*`~\-+_=]/g, '') // 불필요한 마크다운 기호 제거
        .trim();
}

export default function SearchPage() {
    const sp = useSearchParams();
    const router = useRouter();
    const keyword = sp.get('keyword') || '';
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleArticleClick = async (id) => {
        try {
            await increaseArticleHits(id); // 👈 조회수 insert API 호출
            router.push(`/DiFF/article/detail?id=${id}`);
        } catch (e) {
            console.error("조회수 증가 실패", e);
            router.push(`/DiFF/article/detail?id=${id}`);
        }
    };

    useEffect(() => {
        if (!keyword) return;
        (async () => {
            try {
                setLoading(true);
                const res = await searchArticles(keyword);

                // ✅ 전체 응답 구조 확인
                console.log("검색 API 응답:", res);

                if (res?.resultCode?.startsWith('S-')) {
                    console.log("검색된 articles:", res.data1); // ✅ 기사 리스트 로그
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
                    {articles.map((article) => {
                        const imgSrc = extractFirstImage(article.body);
                        return (
                            <div
                                key={article.id}
                                className="block cursor-pointer"
                                onClick={() => handleArticleClick(article.id)}
                            >
                                <div className="flex h-52 border-b p-4 justify-center items-center hover:bg-gray-50 transition">
                                    {/* 왼쪽: 텍스트 */}
                                    <div className="h-full w-[70%] pr-8 flex flex-col">
                                        <div className="text-sm text-gray-500">
                                            in Search · by{" "}
                                            {article.extra__writer ? (
                                                <Link
                                                    href={`/DiFF/member/profile?nickName=${encodeURIComponent(article.extra__writer)}`}
                                                    className="hover:underline hover:text-black cursor-pointer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {article.extra__writer}
                                                </Link>
                                            ) : (
                                                "Unknown"
                                            )}
                                        </div>
                                        <div className="py-2 flex-grow">
                                            <h2 className="text-2xl py-2 font-black">{article.title}</h2>
                                            <p className="clamp-2 text-sm text-gray-600 overflow-hidden">
                                                {article.body ? removeMd(article.body) : ""}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>
                                                {new Date(article.regDate).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                            <span>view: {article.hits}</span>
                                            <span>
                                                <i className="fa-solid fa-comments"></i> {article.extra__sumReplies}
                                            </span>
                                            <span>
                                                <i className="fa-solid fa-heart"></i> {article.extra__sumReaction}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 오른쪽: 이미지 */}
                                    <div className="w-[30%] h-[100%] bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
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
                    })}
                </ul>
            )}
        </div>
    );
}
