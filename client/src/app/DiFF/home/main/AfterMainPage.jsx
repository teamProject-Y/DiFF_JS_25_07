'use client';

import Link from "next/link";
import {useEffect, useState} from "react";
import {followingArticleList} from "@/lib/ArticleAPI";
import {getFollowingList} from "@/lib/UserAPI";
import ToastViewer from "@/common/toastViewer";
import removeMd from "remove-markdown";

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
    const [member, setMember] = useState([]);

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

    return (
        <div className="w-full min-h-screen bg-white text-black">
            <div className="h-screen">
                <div className="mx-auto px-36 py-10 flex">
                    <main className="flex-grow">
                        {/* 탭 버튼 */}
                        <div className="flex items-center border-b">
                            {["Trending", "Following"].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setActiveTab(t)}
                                    className={`p-4 -mb-px ${
                                        activeTab === t
                                            ? "border-b-2 border-black font-semibold"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {/* 🔹 Trending */}
                        {activeTab === "Trending" && (
                            trendingArticles && trendingArticles.length > 0 ? (
                                trendingArticles.map((article, idx) => {
                                    const imgSrc = extractFirstImage(article.body);
                                    return (
                                        <div
                                            key={idx}
                                            className="block cursor-pointer"
                                            onClick={() => (window.location.href = `/DiFF/article/detail?id=${article.id}`)}
                                        >
                                            <div
                                                className="flex h-52 border-b p-4 justify-center items-center hover:bg-gray-50 transition">
                                                <div className="h-full w-[70%] pr-8 flex flex-col">
                                                    <div className="text-sm text-gray-500">
                                                        in Trending · by{" "}
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
                                                            <span>{new Date(article.regDate).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric"
                                                            })}</span>
                                                        <span>view: {article.hits}</span>
                                                        <span><i
                                                            className="fa-solid fa-comments"></i> {article.extra__sumReplies}</span>
                                                        <span><i
                                                            className="fa-solid fa-heart"></i> {article.extra__sumReaction}</span>
                                                    </div>
                                                </div>
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
                                <div>트렌딩 게시물이 없습니다.</div>
                            )
                        )}

                        {/* 🔹 Following */}
                        {activeTab === "Following" && (
                            followingArticles === null ? (
                                <></>
                            ) : followingArticles.length > 0 ? (
                                followingArticles.map((article, idx) => {
                                    const imgSrc = extractFirstImage(article.body);
                                    return (
                                        <div
                                            key={idx}
                                            className="block cursor-pointer"
                                            onClick={() => (window.location.href = `/DiFF/article/detail?id=${article.id}`)}
                                        >
                                            <div
                                                className="flex h-52 border-b p-4 justify-center items-center hover:bg-gray-50 transition">
                                                <div className="h-full w-[70%] pr-8 flex flex-col">
                                                    <div className="text-sm text-gray-500">
                                                        in Following · by{" "}
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
                                                            <span>{new Date(article.regDate).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric"
                                                            })}</span>
                                                        <span>view: {article.hits}</span>
                                                        <span><i
                                                            className="fa-solid fa-comments"></i> {article.extra__sumReplies}</span>
                                                        <span><i
                                                            className="fa-solid fa-heart"></i> {article.extra__sumReaction}</span>
                                                    </div>
                                                </div>
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
                                <div>팔로잉한 사람이 작성한 게시물이 없습니다.</div>
                            )
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

