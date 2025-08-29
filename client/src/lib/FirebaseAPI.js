// lib/FirebaseAPI.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyBrTgvnzTDErEcUYajR9yX6h8As8F2tT2s",
    authDomain: "diff-8b0c9.firebaseapp.com",
    projectId: "diff-8b0c9",
    storageBucket: "diff-8b0c9.firebasestorage.app",
    messagingSenderId: "604856083137",
    appId: "1:604856083137:web:229c1f85d8cbd87daeaa40",
    measurementId: "G-E6QDLRJE20"
};

const app = initializeApp(firebaseConfig);

// 🚨 SSR 방지
export async function requestFCMToken() {
    if (typeof window === "undefined") return null;

    try {
        const { getMessaging, getToken } = await import("firebase/messaging");
        const messaging = getMessaging(app);

        const token = await getToken(messaging, {
            vapidKey:
                "BLQ2UAfCF3FZRkouiNSd2na7cpbc24Tov1NZjf5UIALy6SbmkkewZ5QpShHtaXmGe2FjiA4Ouq-H1Umsq2L10_8",
        });

        console.log("✅ FCM Token:", token);
        return token;
    } catch (err) {
        console.error("❌ FCM 토큰 발급 실패:", err);
        return null;
    }
}

// ✅ 포그라운드 알림 수신
export async function initOnMessageListener() {
    if (typeof window === "undefined") return;

    try {
        const { getMessaging, onMessage } = await import("firebase/messaging");
        const messaging = getMessaging(app);

        onMessage(messaging, (payload) => {
            console.log("📩 포그라운드 알림 수신됨:", payload);

            try {
                // ✅ data 우선 → fallback 으로 notification
                const title = payload.data?.title || payload.notification?.title || "알림";
                const body  = payload.data?.body  || payload.notification?.body  || "내용 없음";

                const notification = new Notification(title, { body });
                console.log("✅ 브라우저 알림 표시됨:", notification);
            } catch (e) {
                console.warn("❌ 알림 띄우기 실패:", e.message);
            }
        });

    } catch (err) {
        console.error("❌ onMessage 등록 실패:", err);
    }
}
