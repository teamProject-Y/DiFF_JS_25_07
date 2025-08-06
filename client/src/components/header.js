// src/components/common/Header.js
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchUser } from "@/lib/UserAPI";
import { useRouter } from "next/navigation";

export default function Header() {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const url = new URL(window.location.href);
        const access = url.searchParams.get("access_token");
        const refresh = url.searchParams.get("refresh_token");

        if (access && refresh) {
            localStorage.setItem("accessToken", access);
            localStorage.setItem("refreshToken", refresh);
            localStorage.setItem("tokenType", "Bearer");
            window.history.replaceState({}, document.title, url.pathname);
        }

        const token = localStorage.getItem("accessToken");
        setAccessToken(token);

        if (token) {
            fetchUser()
                .then(setUser)
                .catch(console.log);
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setAccessToken(null);
        setUser(null);
        router.push("/DiFF/member/login"); // 로그아웃 후 이동
    };

    return (
        <header className="flex h-22 w-full p-4 m-2 text-neutral-600">
            <div className="logo pl-4">
                <Link href="/" className="block px-6">
                    <i className="fa-solid fa-star" />
                </Link>
            </div>

            <div className="flex-grow" />

            <nav className="items-center mr-6 text-4xl text-neutral-800">
                <ul className="flex items-center gap-6">
                    <li className="hover:underline hover:text-neutral-400">
                        <Link href="/DiFF/home/main">HOME</Link>
                    </li>
                    <li className="hover:underline hover:text-neutral-400">
                        <Link href="/DiFF/home/faq">FAQ</Link>
                    </li>
                    <li className="relative group">
                        <Link href="/DiFF/article/list">LIST</Link>
                        <ul className="absolute hidden group-hover:block top-full py-5 text-center text-lg bg-white shadow-lg z-10">
                            {["전체 게시판", "공지사항", "자유 게시판", "QnA"].map((label, idx) => (
                                <li key={idx}>
                                    <Link href="/DiFF/article/list" className="block px-4 py-1 hover:underline hover:text-neutral-400">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>

                    {accessToken ? (
                        <>
                            <li className="hover:underline hover:text-neutral-400 cursor-pointer" onClick={handleLogout}>
                                LOGOUT
                            </li>
                            <li className="hover:underline hover:text-neutral-400">
                                <Link href="/DiFF/member/myPage">MYPAGE</Link>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="hover:underline hover:text-neutral-400">
                                <Link href="/DiFF/member/login">LOGIN</Link>
                            </li>
                            <li className="hover:underline hover:text-neutral-400">
                                <Link href="/DiFF/member/join">JOIN</Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}
