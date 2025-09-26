// src/lib/reactionAPI.js

import axios from "axios";

const BACKEND = "https://api.diff.io.kr/api/DiFF";

export const ReactionAPI = axios.create({
        baseURL: BACKEND,
        headers: {"Content-Type": "application/json"},
    }
);

ReactionAPI.interceptors.request.use((config) => {
        if (typeof window !== "undefined") {
            const type = localStorage.getItem("tokenType") || "Bearer";
            const at = localStorage.getItem("accessToken");
            if (at) config.headers.Authorization = `${type} ${at}`;
        }
        return config;
    }
);

export async function likeArticle(articleId) {
    const res = await ReactionAPI.post(`/article/like/${articleId}`);
    return res.data;
}

export async function unlikeArticle(articleId) {
    const res = await ReactionAPI.delete(`/article/like/${articleId}`);
    return res.data;
}

export async function fetchArticleLikes(articleId) {
    const res = await ReactionAPI.get(`/article/like/${articleId}`);
    return res.data;
}

export async function likeReply(replyId) {
    const res = await ReactionAPI.post(`/reply/like/${replyId}`);
    return res.data;
}

export async function unlikeReply(replyId) {
    const res = await ReactionAPI.delete(`/reply/like/${replyId}`);
    return res.data;
}

export async function fetchReplyLikes(replyId) {
    const res = await ReactionAPI.get(`/reply/like/${replyId}`);
    return res.data;
}