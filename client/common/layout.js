// common/layout.js
"use client"

import Head from 'next/head'
import Header from '../common/header'
import { useEffect } from "react";
import {useRouter} from 'next/router';

export default function Layout({ children, pageTitle = 'DiFF' }) {
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get("accessToken");
            const refreshToken = params.get("refreshToken");
            if (accessToken && refreshToken) {
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                // 필요하다면, 토큰 파라미터를 URL에서 제거:
                router.replace("/DiFF/home/main", undefined, { shallow: true });
            }
        }
    }, [router]);

    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <title>{pageTitle}</title>
                <link rel="stylesheet" href="/resource/common.css" />
                {/* public/resource/common.js 를 불러오려면 */}
                <script src="/resource/common.js" defer />
            </Head>
            {/* 이 안에서만 렌더링 */}
            <div className="text-neutral-600">
                <Header />
                <main>{children}</main>
            </div>
        </>
    )
}