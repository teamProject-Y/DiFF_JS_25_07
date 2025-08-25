// src/common/CommonClientLayout.jsx
'use client';

import Header from '@/common/header';
import {useEffect, useMemo, useRef, useState} from "react";
import { useRouter, usePathname } from 'next/navigation';
import SidebarLayout from '@/common/sidebarLayout';
import LayMenu from '@/common/layMenu';

function isExpired(token, skewMs = 30_000) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload?.exp) return true;
        const now = Date.now() / 1000;
        return now >= (payload.exp - skewMs / 1000);
    } catch {
        return true;
    }
}

export default function CommonLayout({ children, modal, pageTitle = 'DiFF' }) {
    const router = useRouter();
    const pathname = usePathname();
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const accessToken = params.get("accessToken");
            const refreshToken = params.get("refreshToken");
            if (accessToken && refreshToken) {
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                setAccessToken(accessToken);
                router.replace("/DiFF/home/main");
            } else {
                // 초기 로드 시 localStorage에서 토큰 읽기
                const saved = localStorage.getItem("accessToken");
                setAccessToken(saved);
            }
        }
    }, [router]);

    // 다른 탭에서 로그인/로그아웃해도 동기화
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'accessToken') {
                setAccessToken(e.newValue);
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const isAuthed = useMemo(() => {
        return accessToken && !isExpired(accessToken);
    }, [accessToken]);

    const isHomeMain = pathname?.startsWith('/DiFF/home/main');
    const useDarkColor = isHomeMain && !isAuthed;
    const scrollRef = useRef(null);

    return (
        <>
            <div className="text-neutral-600 min-h-screen">
                {useDarkColor && <div className="fixed inset-0 -z-10 bg-black" />}
                <Header scrollRef={scrollRef} />
                <div ref={scrollRef} className="h-20 bg-inherit">
                    <div className="flex gap-0 pt-20">
                        {/* 로그인 상태일 때만 항상 보이는 전역 메뉴 */}
                        <SidebarLayout>
                            <LayMenu />
                        </SidebarLayout>

                        {/* 메인 컨텐츠 영역 */}
                        <main className="flex-1 min-w-0">
                            {children}
                            {modal}
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
