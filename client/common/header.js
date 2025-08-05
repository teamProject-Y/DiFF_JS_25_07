// common/header.js

'use client';

import Link from 'next/link'
import { useEffect, useState } from 'react';
import {fetchUser } from '@/lib/UserAPI';

export default function Header() {
    const [user, setUser] = useState({});
    const [accessToken, setAccessToken] = useState(null);
    // const ACCESS_TOKEN = localStorage.getItem('accessToken');

    useEffect(() => {
        if (typeof window !== "undefined") {
            // 소셜
            const url = new URL(window.location.href);
            const urlAccessToken = url.searchParams.get("access_token");
            const urlRefreshToken = url.searchParams.get("refresh_token");
            if (urlAccessToken && urlRefreshToken) {
                localStorage.setItem("accessToken", urlAccessToken);
                localStorage.setItem("refreshToken", urlRefreshToken);
                localStorage.setItem("tokenType", "Bearer");
                window.history.replaceState({}, document.title, url.pathname); // URL 정리
            }

            // 로컬
            const token = localStorage.getItem('accessToken');
            setAccessToken(token);

            if (token) {
                fetchUser()
                    .then(setUser)
                    .catch(console.log);
            }
        }
    }, []);

    const handleLogout = async () => {
        if (typeof window !== "undefined") {
            localStorage.clear();
            setAccessToken(null); // 로그아웃 반영
        }
    }

    return (
        <header className="flex h-22 w-full p-4 m-2 text-neutral-600">
            <div className="logo pl-4">
                {/* 아이콘도 이렇게 */}
                <Link href="/" className="block px-6">
                    <i className="fa-solid fa-star"></i>
                </Link>
            </div>

            <div className="flex-grow" />

            <nav className="items-center mr-6 text-4xl text-neutral-800">
                <ul className="flex">
                    <li className="hover:underline hover:text-neutral-400">
                        <Link href="/DiFF/home/main" className="block px-6">
                            HOME
                        </Link>
                    </li>
                    <li className="hover:underline hover:text-neutral-400">
                        <Link href="/DiFF/home/faq" className="block px-6">
                            FAQ
                        </Link>
                    </li>
                    <li className="relative group">
                        <Link href="/DiFF/article/list" className="block px-6">
                            LIST
                        </Link>
                        <ul className="absolute hidden group-hover:block w-full top-full py-5 text-center text-lg whitespace-nowrap bg-white shadow-lg">
                            {['전체 게시판','공지사항','자유 게시판','QnA'].map((label, id) => (
                                <li key={id}>
                                    <Link href={`/DiFF/article/list`} className="block h-full p-1 hover:underline hover:text-neutral-400">
                                        {label}
                                    </Link>

                                </li>
                            ))}
                        </ul>
                    </li>

                    {accessToken ? (
                        <>
                        <Link href="/DiFF/member/logout" onClick={handleLogout}>LOGOUT</Link>
                        <Link href="/DiFF/member/myPage">MYPAGE</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/DiFF/member/login">LOGIN</Link>
                            &nbsp;
                            &nbsp;
                            <Link href="/DiFF/member/join">JOIN</Link>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    )
}