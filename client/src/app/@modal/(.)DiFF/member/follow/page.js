'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getFollowingList, getFollowerList } from "@/lib/UserAPI";

export default function FollowModal() {
    const searchParams = useSearchParams();
    const type = searchParams.get("type"); // follower | following
    const [list, setList] = useState([]);

    useEffect(() => {
        const fetchList = async () => {
            try {
                if (type === "follower") {
                    const res = await getFollowerList();
                    setList(res.data1 || []);
                } else {
                    const res = await getFollowingList();
                    setList(res.data1 || []);
                }
            } catch (err) {
                console.error("❌ 목록 조회 실패:", err);
            }
        };
        fetchList();
    }, [type]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-96 max-h-[70vh] flex flex-col">
                {/* 헤더 */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">
                        {type === "follower" ? "팔로워 목록" : "팔로잉 목록"}
                    </h2>
                    <button
                        onClick={() => window.history.back()} // 닫기
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✖
                    </button>
                </div>

                {/* 리스트 */}
                <div className="overflow-y-auto p-4 flex-1">
                    {list.length > 0 ? (
                        <ul className="space-y-2">
                            {list.map((m, idx) => (
                                <li key={idx} className="p-2 border-b">
                                    {m.nickName} <span className="text-xs text-gray-500">{m.email}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500">
                            {type === "follower" ? "팔로워가 없습니다." : "팔로잉한 사용자가 없습니다."}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
