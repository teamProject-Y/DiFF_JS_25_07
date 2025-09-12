// lib/FirebaseAPI.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export async function requestFCMToken() {
    if (typeof window === "undefined") return null;

    try {
        const { getMessaging, getToken } = await import("firebase/messaging/sw");
        const messaging = getMessaging(app);

        const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        console.log("✅ FCM Token:", token);
        return token;
    } catch (err) {
        console.error("❌ FCM 토큰 발급 실패:", err);
        return null;
    }
}

export async function initOnMessageListener() {
    if (typeof window === "undefined") return;

    try {
        const { getMessaging, onMessage } = await import("firebase/messaging");
        const messaging = getMessaging(app);

        onMessage(messaging, (payload) => {
            try {
                const title = payload.data?.title || payload.notification?.title || "알림";
                const body  = payload.data?.body  || payload.notification?.body  || "내용 없음";

                new Notification(title, { body });
            } catch (e) {
                console.warn("❌ 알림 띄우기 실패:", e.message);
            }
        });
    } catch (err) {
        console.error("❌ onMessage 등록 실패:", err);
    }
}

export async function saveFcmTokenToServer() {
    const token = await requestFCMToken();
    if (!token) {
        console.warn("❌ FCM 토큰 발급 실패");
        return;
    }

    localStorage.setItem("fcmToken", token);

    const accessToken = localStorage.getItem("accessToken"); // JWT
    const BACKEND = process.env.NEXT_PUBLIC_API_BASE;

    const res = await fetch(`${BACKEND}/member/saveFcmToken`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ fcmToken: token }),
    });

    if (!res.ok) {
        console.error("❌ 서버 저장 실패:", await res.text());
    }
}
