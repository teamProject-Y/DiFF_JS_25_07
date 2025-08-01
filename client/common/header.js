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
        <header className="flex h-22 w-full p-4 m-2 text-neutral-600 border border-red-500">
            <div className="logo pl-4 border border-red-500">
                <Link href="/" className="block px-6 text-4xl border border-red-500">
                    DiFF
                </Link>
            </div>

            <div className="flex-grow" />
        </header>
    )
}