'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { followingArticleList} from "@/lib/ArticleAPI";
import { getFollowingList } from "@/lib/UserAPI";

export default function AfterMainPage({ me, trendingArticles }) {
    const [activeTab, setActiveTab] = useState("Trending");
    const [followingArticles, setFollowingArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [following, setFollowing] = useState([]);
    const [member, setMember] = useState([]);

    useEffect(() => {
        getFollowingList()
            .then((res) => {
                console.log("팔로잉 API 응답:", res);
                setFollowing(res.data1 || []);   // 여기 수정
            })
            .catch((err) => {
                console.error("팔로잉 목록 로딩 오류:", err);
            });
    }, []);


    // 🔹 Following 탭 눌렀을 때 데이터 불러오기
    useEffect(() => {
        if (activeTab === "Following") {
            setLoading(true);
            followingArticleList({page: 1, repositoryId: 0, searchItem: 0, keyword: ""})
                .then((res) => {
                    setFollowingArticles(res.followingArticles || []);
                })
                .catch((err) => {
                    console.error("팔로잉 로딩 오류:", err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [activeTab]);
    // 🔹 Following 탭 눌렀을 때 데이터 불러오기
    useEffect(() => {
        if (activeTab === "Following") {
            setLoading(true);
            followingArticleList({page: 1, repositoryId: 0, searchItem: 0, keyword: ""})
                .then((res) => {
                    setFollowingArticles(res.followingArticles || []);
                })
                .catch((err) => {
                    console.error("팔로잉 로딩 오류:", err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [activeTab]);


    return (
        <div className="w-full min-h-screen bg-white text-black">
            <div className="h-screen">
                {/* 3열 */}
                <div className="mx-auto px-6 py-10 flex justify-around">
                    {/*</aside>*/}
                    {/* 센터 피드 */}
                    <main className="flex-grow-1 mr-10">
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

                        {/* 로딩 상태 */}
                        {loading && <div className="py-6">로딩 중...</div>}

                        {/* 🔹 Trending */}
                        {activeTab === "Trending" && !loading && (
                            trendingArticles && trendingArticles.length > 0 ? (
                                trendingArticles.map((article, idx) => (
                                    <Link
                                        key={idx}
                                        href={`/DiFF/article/detail?id=${article.id}`}
                                        className="block"
                                    >
                                        <div
                                            className="flex h-52 gap-6 border-b p-4 justify-center items-center hover:bg-gray-50 transition"
                                        >
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-500">
                                                    in Trending · by{" "}
                                                    {article.extra__writer ? (
                                                        <span
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // 부모 Link 클릭 막기
                                                                e.preventDefault();
                                                                window.location.href = `/DiFF/member/profile?nickName=${encodeURIComponent(
                                                                    article.extra__writer
                                                                )}`;
                                                            }}
                                                            className="hover:underline hover:text-black cursor-pointer "
                                                        >
                                                            {article.extra__writer}
                                                        </span>
                                                    ) : (
                                                        "Unknown"
                                                    )}
                                                </div>

                                                <div className="my-2">
                                                    <h2 className="text-2xl pt-2 font-black">{article.title}</h2>
                                                    <p className="h-12 text-gray-600">
                                                        {article.body?.slice(0, 100) || "내용 미리보기 없음"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>{article.regDate}</span>
                                                    <span>👀 {article.hits}</span>
                                                    <span><i className="fa-solid fa-comments"></i> {article.extra__sumReplies}</span>
                                                    <span><i className="fa-solid fa-heart"></i> {article.extra__sumReaction}</span>
                                                </div>
                                            </div>
                                            <div className="w-[30%] h-[100%] bg-gray-200 rounded-xl"/>
                                        </div>
                                    </Link>

                                ))
                            ) : (
                                <div>트렌딩 게시물이 없습니다.</div>
                            )
                        )}

                        {/* 🔹 Following */}
                        {activeTab === "Following" && !loading && (
                            followingArticles && followingArticles.length > 0 ? (
                                followingArticles.map((article, idx) => (
                                    <div
                                        key={idx}
                                        className="block cursor-pointer"
                                        onClick={() => (window.location.href = `/DiFF/article/detail?id=${article.id}`)}
                                    >
                                        <div
                                            className="flex h-52 gap-6 border-b p-4 justify-center items-center hover:bg-gray-50 transition"
                                        >
                                            <div className="flex-1">
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

                                                <div className="my-2">
                                                    <h2 className="text-2xl pt-2 font-black">{article.title}</h2>
                                                    <p className="h-12 text-gray-600">
                                                        {article.body?.slice(0, 100) || "내용 미리보기 없음"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>{article.regDate}</span>
                                                    <span>view: {article.hits}</span>
                                                    <span><i className="fa-solid fa-comments"></i> {article.extra__sumReplies}</span>
                                                    <span><i className="fa-solid fa-heart"></i> {article.extra__sumReaction}</span>
                                                </div>
                                            </div>
                                            <div className="w-[30%] h-[100%] bg-gray-200 rounded-xl" />
                                        </div>
                                    </div>
                                ))
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