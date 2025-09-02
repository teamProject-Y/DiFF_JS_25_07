// src/common/CommonLayout.jsx
'use client';

import Header from '@/common/header';
import {useEffect, useMemo, useState} from "react";
import { useRouter, usePathname } from 'next/navigation';
import SidebarLayout from '@/common/sidebarLayout';
import LayMenu from '@/common/layMenu';
import clsx from 'clsx';

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

    const isAuthed = useMemo(() => accessToken && !isExpired(accessToken), [accessToken]);

    const isHomeMain = pathname?.startsWith('/DiFF/home/main');
    const useDarkColor = isHomeMain && !isAuthed;


    return (
        <>
            <div className="text-neutral-600">
                {useDarkColor && <div className="fixed inset-0 -z-10 bg-black" />}
                <Header />
                {/*<div className="h-20 bg-inherit">*/}
                <div
                    id={isAuthed ? 'appScroll' : undefined}
                    data-scroll-root={isAuthed ? '' : undefined}
                    className={clsx(
                        'flex gap-0',
                        isAuthed && 'overflow-y-auto h-screen'
                    )}>
                        {/* 로그인 상태 */}
                        <SidebarLayout>
                            <LayMenu />
                        </SidebarLayout>

                        {/* 메인 컨텐츠 영역 */}
                        <main className={clsx('flex-1 min-w-0',
                            isAuthed && 'pt-20'
                        )}>
                            {children}
                            {modal}
                        </main>
                    </div>
                {/*</div>*/}
            </div>
        </>
    );
}
