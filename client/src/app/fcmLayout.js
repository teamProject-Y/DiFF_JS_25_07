'use client';
import { useEffect } from "react";
import { requestFCMToken, initOnMessageListener } from "@/lib/FirebaseAPI";

export default function RootLayout({ children }) {
    useEffect(() => {
        // 토큰 발급
        requestFCMToken();

        // 포그라운드 알림 리스너
        initOnMessageListener();

        // 서비스워커 등록
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/firebase-messaging-sw.js")
                .then((reg) => console.log("✅ 서비스워커 등록 성공:", reg))
                .catch((err) => console.error("❌ 서비스워커 등록 실패:", err));
        }
    }, []);

    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    );
}
