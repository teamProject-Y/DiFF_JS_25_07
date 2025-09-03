// src/lib/DraftAPI.js
import axios from "axios";

export const DraftAPI = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080/api/DiFF",
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
});

DraftAPI.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const TOKEN_TYPE = localStorage.getItem("tokenType") || "Bearer";
            const ACCESS_TOKEN = localStorage.getItem("accessToken");
            const REFRESH_TOKEN = localStorage.getItem("refreshToken");

            if (ACCESS_TOKEN) {
                config.headers["Authorization"] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
            } else {
                delete config.headers["Authorization"];
            }

            if (REFRESH_TOKEN) {
                // 백엔드가 기대하는 헤더명이 이거라면 유지
                config.headers["REFRESH_TOKEN"] = REFRESH_TOKEN;
            } else {
                delete config.headers["REFRESH_TOKEN"];
            }

            // 디버그
            console.log("🚀 [REQ]", config.method?.toUpperCase(), config.baseURL + (config.url || ""));
            console.log("🧾 headers:", config.headers);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/** 2) 토큰 재발급도 같은 인스턴스로 (baseURL 중복 방지) */
const refreshAccessToken = async () => {
    if (typeof window === "undefined") return;
    const REFRESH_TOKEN = localStorage.getItem("refreshToken");
    const res = await DraftAPI.get("/auth/refresh", {
        headers: { REFRESH_TOKEN }, // 필요 시 유지
    });
    const ACCESS_TOKEN = res.data.accessToken;
    const TOKEN_TYPE = localStorage.getItem("tokenType") || "Bearer";
    localStorage.setItem("accessToken", ACCESS_TOKEN);
    DraftAPI.defaults.headers["Authorization"] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
};

/** 3) 401/403 자동 재시도 */
DraftAPI.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config || {};
        if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403) &&
            !original._retry
        ) {
            original._retry = true;
            try {
                await refreshAccessToken();
                return DraftAPI(original);
            } catch (e) {
            }
        }
        return Promise.reject(error);
    }
);

/** 4) Draft 관련 API */
export const deleteDraft = async (id) => {
    const url = `/draft/${id}`;
    const res = await DraftAPI.delete(url);
    console.log('[API][deleteDraft] status:', res.status, 'data:', res.data);
    // 상태/바디 둘 다 넘겨서 상위에서 정확히 판단
    return { status: res.status, data: res.data };
};

export const DraftsArticle = async () => {
    const response = await DraftAPI.get('/draft/drafts');
    return response.data;
};

export const getDraftById = async (id) => {
    const res = await DraftAPI.get(`/draft/${id}`);
    return res.data.data1;
};

export const saveDraft = async (data) => {
    const res = await DraftAPI.post('/draft/save', data);
    console.log('[API][saveDraft] response:', res.data1);
    return res.data;
};


