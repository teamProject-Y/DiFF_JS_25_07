// pages/DiFF/member/page.js
"use client";

import { useEffect } from "react";

export default function Page() {
    useEffect(() => {
        (async () => {
            // 1) theme 백업 (LS + 쿠키)
            const keepTheme =
                (typeof window !== "undefined" && localStorage.getItem("theme")) ||
                (document.cookie.match(/(?:^|; )theme=([^;]+)/) || [])[1] ||
                null;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (refreshToken) {
                    await fetch("/api/DiFF/member/logout", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "REFRESH_TOKEN": refreshToken,
                        },
                        // 쿠키 쓰는 환경이면 포함
                        credentials: "include",
                    }).catch(() => {});
                }
            } finally {
                // 2) 토큰 등 민감 정보만 제거 (theme 보존)
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("tokenType");

                // 3) theme 복구 (LS + 쿠키)
                if (keepTheme) {
                    localStorage.setItem("theme", keepTheme);
                    document.cookie = `theme=${keepTheme}; path=/; max-age=31536000; samesite=lax`;
                    // 즉시 DOM에도 적용(리다이렉트 전 화면 깜빡임 방지)
                    const root = document.documentElement;
                    const isDark = keepTheme === "dark";
                    root.classList.toggle("dark", isDark);
                    root.setAttribute("data-theme", isDark ? "dark" : "light");
                }

                // 4) 전역 알림(선택: ThemeGuard 같은 곳에서 듣게)
                window.dispatchEvent(new Event("auth-changed"));

                // 5) 이동
                window.location.replace("/DiFF/home/main");
            }
        })();
    }, []);

    return null;
}
