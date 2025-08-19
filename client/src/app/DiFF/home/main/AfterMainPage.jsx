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


    return (
        <div className="w-full min-h-screen bg-white text-black">
            <div className="h-screen pt-20">
                {/* 3열 */}
                <div className="mx-auto max-w-7xl px-6 py-8 flex justify-around">
                    {/* 왼쪽 */}
                    <aside className="mr-10">
                        <nav className="space-y-3 text-gray-700 mb-6">
                            <Link href="/DiFF/home/main" className="block hover:underline">
                                Home
                            </Link>
                            <Link href="/DiFF/member/myPage" className="block hover:underline">
                                Profile
                            </Link>
                            <Link href="/DiFF/member/repository" className="block hover:underline">
                                Repositories
                            </Link>
                            <Link href="/DiFF/docs/intro" className="block hover:underline">
                                Docs
                            </Link>
                        </nav>

                        {/* Following 목록 */}
                        <div className="pt-4 text-sm text-gray-500">
                            <div className="font-semibold mb-2">Following</div>
                            {following.length > 0 ? (
                                <ul className="space-y-2">
                                    {following.map((f, idx) => {
                                        console.log("팔로잉 유저:", f);
                                        return (
                                            <li key={idx}>
                                                <Link
                                                    href={`/DiFF/member/profile?id=${f.id}`}
                                                    className="hover:underline text-gray-700"
                                                >
                                                    {f.nickName}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p>팔로잉한 사용자가 없습니다.</p>
                            )}
                        </div>


                    </aside>
                    {/* 센터 피드 */}
                    <main className="flex-grow-1 mr-20">
                        {/* 탭 버튼 */}
                        <div className="flex items-center gap-6 border-b">
                            {["Trending", "Following"].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setActiveTab(t)}
                                    className={`py-4 -mb-px ${
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
                                            className="flex gap-6 border-b pb-8 p-2 hover:bg-gray-50 rounded-lg transition">
                                            <div className="flex-1 space-y-2">
                                                <div className="text-sm text-gray-500">
                                                    in Trending · by {article.extra__writer || "Unknown"}
                                                </div>
                                                <h2 className="text-2xl font-extrabold">{article.title}</h2>
                                                <p className="text-gray-600">
                                                    {article.body?.slice(0, 100) || "내용 미리보기 없음"}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>{article.regDate}</span>
                                                    <span>👀 {article.hits}</span>
                                                </div>
                                            </div>
                                            <div className="w-[220px] h-[150px] bg-gray-200 rounded-xl"/>
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
                                    <Link
                                        key={idx}
                                        href={`/DiFF/article/detail?id=${article.id}`} // ✅ 상세 페이지 이동
                                        className="block"
                                    >
                                        <div className="flex gap-6 border-b pb-8 p-2 hover:bg-gray-50 rounded-lg transition">
                                            <div className="flex-1 space-y-2">
                                                <div className="text-sm text-gray-500">
                                                    in Following · by {article.extra_writer || "Unknown"}
                                                </div>
                                                <h2 className="text-2xl font-extrabold">{article.title}</h2>
                                                <p className="text-gray-600">
                                                    {article.body?.slice(0, 100) || "내용 미리보기 없음"}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>{article.regDate}</span>
                                                    <span>👀 {article.hits}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault(); // ✅ 상세 이동 막지 않고 저장 기능만 동작
                                                            console.log("Save clicked for article:", article.id);
                                                        }}
                                                        className="ml-auto px-3 py-1 rounded-full border"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="w-[220px] h-[150px] bg-gray-200 rounded-xl"/>
                                        </div>
                                    </Link>
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
