import axios from "axios";

const BACKEND = "https://api.diff.io.kr/api/DiFF";

export const NotificationAPI = axios.create({
    baseURL: BACKEND,
    headers: {"Content-Type": "application/json"},
});

NotificationAPI.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const type = localStorage.getItem("tokenType") || "Bearer";
        const at = localStorage.getItem("accessToken");
        if (at) config.headers.Authorization = `${type} ${at}`;
    }
    return config;
});

export async function hasUnread() {
    const res = await NotificationAPI.get("/notification/unread");
    return res.data; // true / false
}

export async function getNotifications() {
    const res = await NotificationAPI.get("/notification/list");
    return res.data; // [{id, type, message, isRead, regDate}, ...]
}

export async function markAllAsRead() {
    const res = await NotificationAPI.post("/notification/readAll");
    return res.data;
}

export async function updateNotificationSetting(type, enabled) {
    const res = await NotificationAPI.post("/notification/updateNotificationSetting", null, {
            params: {type, enabled},
        }
    );
    return res.data;
}
