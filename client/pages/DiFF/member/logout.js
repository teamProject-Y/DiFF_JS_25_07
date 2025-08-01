// pages/DiFF/member/logout.js
"use client";
import { useEffect } from "react";

export default function Logout() {
    useEffect(() => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
            fetch('/api/DiFF/member/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'REFRESH_TOKEN': refreshToken
                }
            });
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("tokenType");
        window.location.replace("/DiFF/home/main");
    }, []);
}
