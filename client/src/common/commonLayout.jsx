// src/common/CommonClientLayout.jsx
'use client';

import Header from '@/common/header';
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import SidebarLayout from '@/common/sidebarLayout';
import LayMenu from '@/common/layMenu';

export default function CommonLayout({ children, pageTitle = 'DiFF' }) {
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
            {/*<Head>*/}
            {/*    <meta charSet="UTF-8" />*/}
            {/*    <title>{pageTitle}</title>*/}
            {/*    <link rel="stylesheet" href="/resource/common.css" />*/}
            {/*    <script src="/resource/common.js" defer />*/}
            {/*</Head>*/}
            <div className="text-neutral-600 min-h-screen">
                <Header />
                <div className="h-20 bg-inherit">
                    <div className="flex gap-0">
                        {/* 로그인 상태일 때만 항상 보이는 전역 메뉴 */}
                        <SidebarLayout>
                            <LayMenu />
                        </SidebarLayout>

                        {/* 메인 컨텐츠 영역 */}
                        <main className="flex-1 min-w-0">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
