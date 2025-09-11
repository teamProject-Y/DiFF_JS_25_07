'use client';
import Link from 'next/link';
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getFollowingList } from "@/lib/UserAPI";
import { useRouter } from "next/navigation"
import LoginSpeedDial from "@/common/toogle/loginSpeedDial";


export default function LayMenu() {
    const [following, setFollowing] = useState([]);
    const pathname = usePathname();
    const router = useRouter();

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
        <nav className="content top-20 h-[calc(100vh-80px)] mx-auto max-w-7xl flex justify-around">
            {/* 왼쪽 메뉴 */}
            <aside className="py-3 w-64 relative"> {/* relative 추가 */}
                <nav className=" text-gray-600 mb-6">
                    {menuItems.map(({ href, label }) => {
                        const isActive =
                            pathname === href || pathname?.startsWith(href + "/");

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={[
                                    "block py-3 px-8 transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800",
                                    isActive
                                        ? "font-semibold text-black dark:text-neutral-200"
                                        : "dark:text-neutral-500"
                                ].join(" ")}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>
                <hr className="dark:border-neutral-700 mx-5" />

                {/* Following 목록 */}
                <div className="pt-6 text-sm text-gray-500">
                    <div className="font-semibold mb-3 px-8 text-gray-600 dark:text-neutral-200">
                        Following
                    </div>

                    {following.length > 0 ? (
                        <ul className="max-h-64 overflow-y-auto">
                            {following.map((f, idx) => (
                                <li key={idx} className="cursor-pointer">
                                    <Link
                                        href={`/DiFF/member/profile?nickName=${f.nickName}`}
                                        className="flex items-center gap-3 px-9 py-2"
                                    >
                                        {f.profileUrl ? (
                                            <img
                                                src={f.profileUrl}
                                                className="w-8 h-8 rounded-full object-cover border"
                                                alt={f.nickName}
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center border
                                                bg-gray-100 dark:bg-neutral-700 dark:border-neutral-700">
                                                <i className="fa-solid fa-skull text-gray-400 dark:text-neutral-300" />
                                            </div>
                                        )}
                                        <span className="dark:text-neutral-300">{f.nickName}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="px-8">No users followed.</p>
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
            </aside>
        </nav>
    );
}
