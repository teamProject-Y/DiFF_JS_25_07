'use client';

import Link from "next/link";
import {useEffect, useState} from "react";
import {followingArticleList, increaseArticleHits} from "@/lib/ArticleAPI";
import {getFollowingList} from "@/lib/UserAPI";
import removeMd from "remove-markdown";
import {saveFcmTokenToServer} from "@/lib/FirebaseAPI";
import LoginSpeedDial from "@/common/toogle/loginSpeedDial";

// 게시물에 이미지 있는지 확인
function extractFirstImage(body) {
    if (!body) return null;
    const match = body.match(/!\[[^\]]*\]\(([^)]+)\)/);
    if (match) {
        console.log("이미지 URL:", match[1]);
    }

    match ? console.log(match[1]) : console.log("no match");
    return match ? match[1] : null;
}

export default function AfterMainPage({me, trendingArticles}) {
    const [activeTab, setActiveTab] = useState("Trending");
    const [followingArticles, setFollowingArticles] = useState(null);
    const [following, setFollowing] = useState([]);

    useEffect(() => {
        const run = async () => {
            try {
                console.log("🔔 MainPage 진입 → FCM 토큰 저장 시도");
                await saveFcmTokenToServer();
                console.log("✅ MainPage 진입 → FCM 토큰 저장 완료");
            } catch (err) {
                console.error("❌ MainPage 진입 → FCM 저장 실패:", err);
            }
        };
        run();
    }, []);

    // 팔로잉 유저 목록 불러오기 (최초 1번)
    useEffect(() => {
        getFollowingList()
            .then((res) => {
                console.log("팔로잉 API 응답:", res);
                setFollowing(res.data1 || []);
            })
            .catch((err) => {
                console.error("팔로잉 목록 로딩 오류:", err);
            });
    }, []);

    // Following 게시글 목록 불러오기 (최초 1번만)
    useEffect(() => {
        followingArticleList({page: 1, repositoryId: 0, searchItem: 0, keyword: ""})
            .then((res) => {
                setFollowingArticles(res.followingArticles || []);
            })
            .catch((err) => {
                console.error("팔로잉 로딩 오류:", err);
            });
    }, []); //

    const handleArticleClick = async (id) => {
        try {
            await increaseArticleHits(id);  // ✅ 조회수 증가 요청
            window.location.href = `/DiFF/article/detail?id=${id}`;
        } catch (err) {
            console.error("조회수 증가 실패:", err);
            window.location.href = `/DiFF/article/detail?id=${id}`;
        }
    };

    return (
        <div className="w-full h-screen overflow-hidden bg-white text-black dark:bg-neutral-900 dark:text-neutral-200">
            <div className="h-full pb-20">
                <div className="mx-auto px-32 flex h-full">
                    <main className="flex-1 flex flex-col min-h-0">
                        {/* 탭: 고정 영역 */}
                        <div className="flex items-center border-b dark:border-neutral-700">
                            {["Trending", "Following"].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setActiveTab(t)}
                                    className={`p-4 -mb-px ${
                                        activeTab === t
                                            ? "border-b-2 font-semibold border-black dark:border-neutral-400"
                                            : "text-gray-500 dark:text-neutral-600"
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
                            {activeTab === "Trending" ? (
                                trendingArticles && trendingArticles.length > 0 ? (
                                    trendingArticles.map((article, idx) => {
                                        const imgSrc = extractFirstImage(article.body);
                                        return (
                                            <div
                                                key={idx}
                                                className="block cursor-pointer text-gray-500 dark:text-neutral-400"
                                                onClick={() => handleArticleClick(article.id)}
                                            >
                                                <div className="flex h-52 border-b p-4 justify-center items-center transition hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
                                                    <div className="h-full w-[70%] pr-8 flex flex-col">
                                                        <div className="text-sm ">
                                                            in Trending · by{" "}
                                                            {article.extra__writer ? (
                                                                <Link
                                                                    href={`/DiFF/member/profile?nickName=${encodeURIComponent(article.extra__writer)}`}
                                                                    className="hover:underline cursor-pointer hover:text-black dark:hover:text-neutral-200"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {article.extra__writer}
                                                                </Link>
                                                            ) : (
                                                                "Unknown"
                                                            )}
                                                        </div>
                                                        <div className="py-2 flex-grow">
                                                            <h2 className="text-2xl py-2 font-black text-gray-900 dark:text-neutral-300">
                                                                {article.title}
                                                            </h2>
                                                            <p className="clamp-2 text-sm overflow-hidden">
                                                                {article.body ? removeMd(article.body) : ""}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm ">
                                                            <span>
                                                                {new Date(article.regDate).toLocaleDateString("en-US", {
                                                                      year: "numeric",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                })}
                                                            </span>
                                                            <span>view: {article.hits}</span>
                                                            <span><i className="fa-solid fa-comments"></i> {article.extra__sumReplies}</span>
                                                            <span><i className="fa-solid fa-heart"></i> {article.extra__sumReaction}</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-[30%] h-[100%] bg-gray-200 dark:bg-neutral-700 rounded-xl flex items-center justify-center overflow-hidden">
                                                        {imgSrc ? (
                                                            <img src={imgSrc} alt="thumbnail" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="dark:text-neutral-400 text-gray-400">No Image</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-4">No trending posts.</div>
                                )
                            ) : followingArticles === null ? (
                                <></>
                            ) : followingArticles.length > 0 ? (
                                followingArticles.map((article, idx) => {
                                    const imgSrc = extractFirstImage(article.body);
                                    return (
                                        <div
                                            key={idx}
                                            className="block cursor-pointer text-gray-500 dark:text-neutral-400"
                                            onClick={() => handleArticleClick(article.id)}
                                        >
                                            <div className="flex h-52 border-b p-4 justify-center items-center transition hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
                                                <div className="h-full w-[70%] pr-8 flex flex-col">
                                                    <div className="text-sm ">
                                                        in Following · by{" "}
                                                        {article.extra__writer ? (
                                                            <Link
                                                                href={`/DiFF/member/profile?nickName=${encodeURIComponent(article.extra__writer)}`}
                                                                className="hover:underline cursor-pointer hover:text-black dark:hover:text-neutral-200"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {article.extra__writer}
                                                            </Link>
                                                        ) : (
                                                            "Unknown"
                                                        )}
                                                    </div>
                                                    <div className="py-2 flex-grow">
                                                        <h2 className="text-2xl py-2 font-black text-gray-900 dark:text-neutral-300">
                                                            {article.title}
                                                        </h2>
                                                        <p className="clamp-2 text-sm overflow-hidden">
                                                            {article.body ? removeMd(article.body) : ""}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm ">
                                                        <span>
                                                            {new Date(article.regDate).toLocaleDateString("en-US", {
                                                             year: "numeric",
                                                             month: "short",
                                                             day: "numeric",
                                                            })}
                                                        </span>
                                                        <span>view: {article.hits}</span>
                                                        <span><i className="fa-solid fa-comments"></i> {article.extra__sumReplies}</span>
                                                        <span><i className="fa-solid fa-heart"></i> {article.extra__sumReaction}</span>
                                                    </div>
                                                </div>
                                                <div className="w-[30%] h-[100%] bg-gray-200 dark:bg-neutral-700 rounded-xl flex items-center justify-center overflow-hidden">
                                                    {imgSrc ? (
                                                        <img src={imgSrc} alt="thumbnail" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="dark:text-neutral-400 text-gray-400">No Image</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-4">No posts from people you follow.</div>
                            )}
                        </div>

                        <LoginSpeedDial
                            writeHref="/DiFF/article/write"
                            draftsHref="/DiFF/article/drafts"
                            onToggleTheme={() => {
                                document.documentElement.classList.toggle("dark");
                                localStorage.theme =
                                    document.documentElement.classList.contains("dark") ? "dark" : "";
                            }}
                        />
                    </main>
                </div>
            </div>
        </div>
    );

}

