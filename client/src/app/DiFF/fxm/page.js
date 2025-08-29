'use client';

import { useState, useEffect } from "react";
import { requestFCMToken, initOnMessageListener } from "@/lib/FirebaseAPI";

export default function FcmTestPage() {
    const [token, setToken] = useState(null);

    useEffect(() => {
        console.log("🔔 FcmTestPage 마운트됨 → onMessage 리스너 등록 시도");
        initOnMessageListener();

        // 🔥 서비스워커 등록 (백그라운드 알림용)
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/firebase-messaging-sw.js")
                .then((registration) => {
                    console.log("✅ 서비스워커 등록 성공:", registration);
                })
                .catch((err) => {
                    console.error("❌ 서비스워커 등록 실패:", err);
                });
        }
    }, []);


    const handleGetToken = async () => {
        console.log("🟢 토큰 발급 버튼 클릭");
        const newToken = await requestFCMToken();
        if (newToken) {
            localStorage.setItem("fcmToken", newToken);
            setToken(newToken);
            console.log("✅ 토큰 발급 성공:", newToken);
            alert("✅ 토큰 발급 성공!");
        } else {
            console.error("❌ 토큰 발급 실패");
            alert("❌ 토큰 발급 실패. 알림 권한 확인 필요!");
        }
    };

    const handleSendNotification = async () => {
        console.log("📨 알림 전송 버튼 클릭");

        const storedToken = localStorage.getItem("fcmToken");
        if (!storedToken) {
            console.warn("⚠️ fcmToken 없음");
            alert("⚠️ FCM 토큰이 없습니다. 먼저 토큰을 발급받으세요!");
            return;
        }

        const payload = {
            token: storedToken,
            title: "테스트 알림",
            body: "이 알림은 테스트 페이지에서 보낸 메시지입니다!",
        };

        try {
            console.log("📤 서버에 요청 보냄:", payload);
            const res = await fetch("http://localhost:8080/api/DiFF/notify/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const text = await res.text();
            console.log("📩 서버 응답:", res.status, text);

            if (res.ok) {
                alert("✅ 알림 전송 성공!");
            } else {
                alert("❌ 알림 전송 실패: " + text);
            }
        } catch (err) {
            console.error("❌ 요청 에러:", err);
            alert("알림 전송 중 에러 발생");
        }
    };

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-6">📡 FCM 테스트 페이지</h1>

            <button
                onClick={handleGetToken}
                className="w-full bg-green-500 text-white py-2 rounded-lg mb-4 hover:bg-green-600"
            >
                FCM 토큰 발급받기
            </button>

            <button
                onClick={handleSendNotification}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
                알림 테스트 보내기
            </button>

            {token && (
                <p className="mt-6 text-sm break-all text-gray-700">
                    현재 발급된 토큰: {token}
                </p>
            )}
        </div>
    );
}
