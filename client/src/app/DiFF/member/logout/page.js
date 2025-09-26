// pages/DiFF/member/page.js

"use client";

import { useEffect } from "react";

export default function Page() {
    useEffect(() => {
        (async () => {
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
                        credentials: "include",
                    }).catch(() => {});
                }
            } finally {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("tokenType");

                if (keepTheme) {
                    localStorage.setItem("theme", keepTheme);
                    document.cookie = `theme=${keepTheme}; path=/; max-age=31536000; samesite=lax`;

                    const root = document.documentElement;
                    const isDark = keepTheme === "dark";
                    root.classList.toggle("dark", isDark);
                    root.setAttribute("data-theme", isDark ? "dark" : "light");
                }

                window.dispatchEvent(new Event("auth-changed"));

                window.location.replace("/DiFF/home/main");
            }
        })();
    }, []);

    return null;
}
