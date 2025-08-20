// src/lib/reactionAPI.js
import axios from "axios";

const BASE = "http://localhost:8080/api/DiFF";

/** 공개 GET (비로그인 허용) */
export const ReactionPublic = axios.create({
    baseURL: BASE,
    headers: { "Content-Type": "application/json" },
    withCredentials: false,
});

/** 인증 필요 (좋아요/취소) */
export const ReactionAPI = axios.create({
    baseURL: BASE,
    headers: { "Content-Type": "application/json" },
});

// JWT 자동 첨부
ReactionAPI.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const type = localStorage.getItem("tokenType") || "Bearer";
        const at = localStorage.getItem("accessToken");
        if (at) config.headers.Authorization = `${type} ${at}`;
    }
    return config;
});

/** 좋아요 ON */
export async function likeArticle(articleId) {
    const res = await ReactionAPI.put(`/article/like/${articleId}`);
    // { relType, relId, liked: true, count }
    return res.data;
}

/** 좋아요 OFF */
export async function unlikeArticle(articleId) {
    const res = await ReactionAPI.delete(`/article/like/${articleId}`);
    // { relType, relId, liked: false, count }
    return res.data;
}

/** 좋아요 상태/개수 조회 (비로그인 허용) */
export async function fetchArticleLikes(articleId) {
    const res = await ReactionPublic.get(`/article/like/${articleId}`);
    // { relType, relId, liked, count }
    return res.data;
}
