// src/lib/DraftAPI.js

import axios from "axios";

const BACKEND = "https://api.diff.io.kr/api/DiFF";

export const DraftAPI = axios.create({
    baseURL: BACKEND,
    headers: {"Content-Type": "application/json"},
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
                config.headers["REFRESH_TOKEN"] = REFRESH_TOKEN;
            } else {
                delete config.headers["REFRESH_TOKEN"];
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const refreshAccessToken = async () => {
    if (typeof window === "undefined") return;
    const REFRESH_TOKEN = localStorage.getItem("refreshToken");
    const res = await DraftAPI.get("/auth/refresh", {
        headers: {REFRESH_TOKEN},
    });
    const ACCESS_TOKEN = res.data.accessToken;
    const TOKEN_TYPE = localStorage.getItem("tokenType") || "Bearer";
    localStorage.setItem("accessToken", ACCESS_TOKEN);
    DraftAPI.defaults.headers["Authorization"] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
};

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

export const deleteDraft = async (id) => {
    const url = `/draft/${id}`;
    const res = await DraftAPI.delete(url);

    return {status: res.status, data: res.data};
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
    return res.data;
}
