// src/common/CommonClientLayout.jsx
'use client';

import Head from 'next/head';
import Header from '@/common/header';
import { useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function CommonClientLayout({ children, pageTitle = 'DiFF' }) {
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get("accessToken");
            const refreshToken = params.get("refreshToken");
            if (accessToken && refreshToken) {
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                router.replace("/DiFF/home/main");
            }
        }
    }, [router]);

    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <title>{pageTitle}</title>
                <link rel="stylesheet" href="/resource/common.css" />
                <script src="/resource/common.js" defer />
            </Head>
            <div className="text-neutral-600">
                <Header />
                <main>{children}</main>
            </div>
        </>
    );
}
