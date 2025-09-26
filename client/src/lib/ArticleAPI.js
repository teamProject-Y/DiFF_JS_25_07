// lib/ArticleAPI.js

import axios from "axios";
import {DraftAPI} from "@/lib/DraftAPI";
import { UserAPI } from "@/lib/UserAPI";

const BACKEND = "https://api.diff.io.kr/api/DiFF";

export const ArticleAPI = axios.create({
    baseURL: BACKEND,
    headers: { "Content-Type": "application/json" },
});

ArticleAPI.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const TOKEN_TYPE = localStorage.getItem("tokenType") || "Bearer";
            const ACCESS_TOKEN = localStorage.getItem("accessToken");

            if (ACCESS_TOKEN) {
                config.headers['Authorization'] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
            }

            const REFRESH_TOKEN = localStorage.getItem("refreshToken");
        }
        return config;
    },
    (error) => Promise.reject(error)
);


export const setAuthHeader = () => {
    if (typeof window !== "undefined") {
        const TOKEN_TYPE = localStorage.getItem("tokenType") || 'Bearer';
        const ACCESS_TOKEN = localStorage.getItem("accessToken");
        const REFRESH_TOKEN = localStorage.getItem("refreshToken");

        if (ACCESS_TOKEN) {
            ArticleAPI.defaults.headers['Authorization'] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
        } else {
            delete ArticleAPI.defaults.headers['Authorization'];
        }

        if (REFRESH_TOKEN) {
            ArticleAPI.defaults.headers['REFRESH_TOKEN'] = REFRESH_TOKEN;
        } else {
            delete ArticleAPI.defaults.headers['REFRESH_TOKEN'];
        }
    }
};

const refreshAccessToken = async () => {
    if (typeof window !== "undefined") {
        const REFRESH_TOKEN = localStorage.getItem("refreshToken");
        const response = await axios.get(`${BACKEND}/auth/refresh`, {
            headers: { 'REFRESH_TOKEN': REFRESH_TOKEN }
        });
        const ACCESS_TOKEN = response.data.accessToken;
        const TOKEN_TYPE = localStorage.getItem("tokenType");
        localStorage.setItem('accessToken', ACCESS_TOKEN);
        ArticleAPI.defaults.headers['Authorization'] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
    }
};

ArticleAPI.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (
            error.response &&
            (error.response.status === 403 || error.response.status === 401) &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            await refreshAccessToken();
            setAuthHeader();
            return ArticleAPI(originalRequest);
        }
        return Promise.reject(error);
    }
);

function normalizeArticlePayload(data) {
    const payload = { ...(data || {}) };

    if (payload.repositoryId != null) payload.repositoryId = Number(payload.repositoryId);
    if (payload.draftId != null) payload.draftId = Number(payload.draftId);

    const foundChecksum =
        payload.checksum ??
        payload.commitHash ??
        payload.commit_id ??
        payload.commitId ??
        payload.latestCommit ??
        null;

    if (typeof foundChecksum === "string" && foundChecksum.trim()) {
        payload.checksum = foundChecksum.trim();
    }

    delete payload.commitHash;
    delete payload.commit_id;
    delete payload.commitId;
    delete payload.latestCommit;

    return payload;
}

export const fetchArticles = async ({ repositoryId, repoId, searchItem = 0, keyword = "", page = 1 }) => {
    const rid = repositoryId ?? repoId;
    const res = await ArticleAPI.get('/article/list', {
        params: { repositoryId: rid, searchItem, keyword, page }

    });
    return res.data;
};

export const trendingArticle = async ({ count, days }) => {
    console.log("🛰 [trendingArticle] count:", count, "days:", days);
    const res = await ArticleAPI.get('/article/trending', {
        params: { count, days }
    });
    return res.data;
};

export const writeArticle = async (data) => {
    if (data?.repositoryId != null) data = { ...data, repositoryId: Number(data.repositoryId) };
    if (data?.draftId != null) data = { ...data, draftId: Number(data.draftId) };

    const res = await ArticleAPI.post('/article/doWrite', data);
    return res.data;
};

export const getMyRepositories = async () => {
    const res = await ArticleAPI.get('/repository/my');
    const repos = res.data?.data1?.repositories ?? res.data?.repositories ?? [];
    return Array.isArray(repos) ? repos : [];
};

export const getAverageMetrics = async (repositoryId) => {
    const res = await ArticleAPI.get(`/repository/average/${repositoryId}`);
    return res.data;
};

export const getArticle = async (id) => {
    const res = await ArticleAPI.get('/article/detail', { params: { id } });
    return res.data.data1;
}

export const modifyArticle = async (article, token) => {
    const res = await ArticleAPI.post('/article/modify', article, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
    return res.data;
}

export const deleteArticle = async (id) => {
    const url = `/article/${id}`;
    const res = await DraftAPI.delete(url);
    return { status: res.status, data: res.data };
};

export const followingArticleList = async ({ repositoryId, searchItem = 0, keyword = "", page = 1 }) => {
    const res = await ArticleAPI.get('/article/followingArticleList', {
        params: { repositoryId, searchItem, keyword, page }
    });
    return res.data;
};

/** 특정 레포의 글 목록 */
export const repositoryArticles = async ({ repositoryId }) => {
    const res = await ArticleAPI.get('/repository/articles', { params: { repositoryId } });
    return res.data;
};

/** 댓글 작성 */
export const postReply = async (articleId, comment) => {
    const res = await UserAPI.post('/reply/doWrite', { articleId, body: comment });
    return res.data;
};

/** 댓글 목록 조회 */
export const fetchReplies = async (articleId) => {
    const res = await UserAPI.get('/reply/list', { params: { articleId } });
    return res.data;
};

/** 조회수 증가 */
export const increaseArticleHits = async (articleId) => {
    const res = await ArticleAPI.post(`/article/hits/${articleId}`);
    return res.data;
};

export const searchArticles = async (keyword) => {
    const res = await ArticleAPI.get('/article/search', { params: { keyword } });
    return res.data;
};