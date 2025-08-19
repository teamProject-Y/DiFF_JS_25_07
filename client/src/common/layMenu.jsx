'use client';
import Link from 'next/link';
import {useEffect, useState} from "react";
import {getFollowingList} from "@/lib/UserAPI";

export default function LayMenu() {
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



    const Item = ({ href, children }) => (
        <Link
            href={href}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
        >
            {children}
        </Link>
    );

    return (
        <nav className=" top-20 h-[calc(100vh-80px)] p-3 mx-auto max-w-7xl px-6 py-8 flex justify-around">
            {/* Header 높이가 80px 가정(top-20) */}
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
        </nav>
    );
}
