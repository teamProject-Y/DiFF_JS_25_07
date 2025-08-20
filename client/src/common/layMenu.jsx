'use client';
import Link from 'next/link';
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getFollowingList } from "@/lib/UserAPI";

export default function LayMenu() {
    const [following, setFollowing] = useState([]);
    const pathname = usePathname();

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

    const menuItems = [
        { href: "/DiFF/home/main", label: "Home" },
        { href: "/DiFF/member/profile", label: "Profile" },
        { href: "/DiFF/member/repository", label: "Repositories" },
        { href: "/DiFF/docs/intro", label: "Docs" },
    ];

    return (
        <nav className="top-20 h-[calc(100vh-80px)] mx-auto max-w-7xl flex justify-around">
            {/* 왼쪽 메뉴 */}
            <aside className="py-3 w-full">
                <nav className="space-y-2 text-gray-700 font-bold mb-6">
                    {menuItems.map(({ href, label }) => {
                        const isActive =
                            pathname === href || pathname?.startsWith(href + "/");

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={[
                                    "block px-8 py-2 transition-colors",
                                    isActive
                                        ? "border-l font-semibold text-black"
                                        : "hover:bg-gray-100 hover:text-black"
                                ].join(" ")}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Following 목록 */}
                <div className="pt-4 text-sm text-gray-500">
                    <div className="font-semibold mb-3 px-8">Following</div>
                    {following.length > 0 ? (
                        <ul className="space-y-2">
                            {following.map((f, idx) => (
                                <li key={idx}>
                                    <Link
                                        href={`/DiFF/member/profile?nickName=${encodeURIComponent(f.nickName)}`}
                                        className="hover:underline px-8"
                                    >
                                        {f.nickName}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>팔로잉한 사용자가 없습니다.</p>
                    )}
                </div>
            </aside>
        </nav>
    );
}
