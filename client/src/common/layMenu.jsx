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
        { href: "/DiFF/member/inquiry", label: "Contact" }
    ];

    return (
        <nav className="top-20 h-[calc(100vh-80px)] mx-auto max-w-7xl flex justify-around">
            {/* 왼쪽 메뉴 */}
            <aside className="py-3 w-64">
                <nav className=" text-gray-600 mb-6">
                    {menuItems.map(({ href, label }) => {
                        const isActive =
                            pathname === href || pathname?.startsWith(href + "/");

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={[
                                    "block py-3 px-8 transition-colors hover:bg-gray-100",
                                    isActive
                                        ? "text-black font-semibold"
                                        : ""
                                ].join(" ")}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>
                <hr/>

                {/* Following 목록 */}
                <div className="pt-6 text-sm text-gray-500">
                    <div className="font-semibold mb-3 px-8 text-gray-600">Following</div>
                    {following.length > 0 ? (
                        <ul className="space-y-2">
                            {following.map((f, idx) => (
                                <li key={idx}
                                    role="link"
                                    tabIndex={0}
                                    onClick={() => router.push(href)}
                                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && router.push(href)}
                                    className="px-9 py-2 rounded-md hover:underline hover:bg-muted
                                    cursor-pointer focus-visible:outline-none
                                    focus-visible:ring-2 focus-visible:ring-offset-2">
                                        {f.nickName}
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