// lib/ArticleAPI.js
import axios from "axios";
import {DraftAPI} from "@/lib/DraftAPI";
import { UserAPI } from "@/lib/UserAPI";
import {ReflectAdapter as RepositoryAPI} from "next/dist/server/web/spec-extension/adapters/reflect";

/** 커스텀 Axios 인스턴스 */
export const ArticleAPI = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json"
    }
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

/** 헤더 토큰 설정 */
export const setAuthHeader = () => {
    if (typeof window !== "undefined") {
        const TOKEN_TYPE = localStorage.getItem("tokenType") || 'Bearer';
        const ACCESS_TOKEN = localStorage.getItem("accessToken");
        const REFRESH_TOKEN = localStorage.getItem("refreshToken");

        // accessToken이 있을 때만 Authorization 헤더 설정
        if (ACCESS_TOKEN) {
            ArticleAPI.defaults.headers['Authorization'] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
        } else {
            delete ArticleAPI.defaults.headers['Authorization'];  // 없으면 제거
        }

        // refreshToken도 마찬가지
        if (REFRESH_TOKEN) {
            ArticleAPI.defaults.headers['REFRESH_TOKEN'] = REFRESH_TOKEN;
        } else {
            delete ArticleAPI.defaults.headers['REFRESH_TOKEN'];  // 없으면 제거
        }
    }
};

/** 토큰 자동 재발급 (Refresh) */
const refreshAccessToken = async () => {
    if (typeof window !== "undefined") {
        const REFRESH_TOKEN = localStorage.getItem("refreshToken");
        const response = await axios.get(`http://localhost:8080/api/DiFF/auth/refresh`, {
            headers: { 'REFRESH_TOKEN': REFRESH_TOKEN }
        });
        const ACCESS_TOKEN = response.data.accessToken;
        const TOKEN_TYPE = localStorage.getItem("tokenType");
        localStorage.setItem('accessToken', ACCESS_TOKEN);
        ArticleAPI.defaults.headers['Authorization'] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
    }
};

/** 인터셉터로 토큰 만료 자동 처리 */
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

/** 게시물 정규화 */
function normalizeArticlePayload(data) {
    const payload = { ...(data || {}) };

    // 숫자 필드 정규화
    if (payload.repositoryId != null) payload.repositoryId = Number(payload.repositoryId);
    if (payload.draftId != null) payload.draftId = Number(payload.draftId);

    // checksum 동의어 흡수 → payload.checksum 으로 고정
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
    // 중복 키 제거(백엔드가 checksum만 받게 깔끔히)
    delete payload.commitHash;
    delete payload.commit_id;
    delete payload.commitId;
    delete payload.latestCommit;

    return payload;
}

/** Auth/회원 관련 API들 */
export const fetchArticles = async ({ repositoryId, repoId, searchItem = 0, keyword = "", page = 1 }) => {
    const rid = repositoryId ?? repoId;
    const res = await ArticleAPI.get('/api/DiFF/article/list', {
        params: { repositoryId: rid, searchItem, keyword, page }

    });
    return res.data;
};

/** 인기글 */
export const trendingArticle = async ({ count, days }) => {
    const response = await ArticleAPI.get(`/api/DiFF/article/trending`, {
        params: { count, days }
    });
    return response.data;
}

/** 글 작성 */
export const writeArticle = async (data) => {
    if (data?.repositoryId != null) {
        data = { ...data, repositoryId: Number(data.repositoryId) };
    }
    if (data?.draftId != null) {
        data = { ...data, draftId: Number(data.draftId) };
    }

    const res = await ArticleAPI.post('/api/DiFF/article/doWrite', normalizeArticlePayload(data));
    const result = res.data;

    return result;
};

/** 리포 불러오기 */
export const getMyRepositories = async () => {
    const res = await ArticleAPI.get('/api/DiFF/repository/my');
    const repos =
        res.data?.data1?.repositories ??
        res.data?.repositories ??
        [];
    return Array.isArray(repos) ? repos : [];
};

/** 글 상세보기 */
export async function getArticle(id) {
    const res = await ArticleAPI.get(`/api/DiFF/article/detail`, {
        params: { id }
    });
    return res.data.data1;
}

/** 글 수정 */
export async function modifyArticle(article, token) {
    const res = await axios.post(`/api/DiFF/article/modify`, normalizeArticlePayload(article), {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
    return res.data;
}

/** 글 삭제 */
export const deleteArticle = async (id) => {
    const url = `/article/${id}`;
    const res = await DraftAPI.delete(url);
    return { status: res.status, data: res.data };
};

/** 팔로잉의 글 */
export const followingArticleList = async ({ repositoryId, searchItem = 0, keyword = "", page = 1 }) => {
    const res = await ArticleAPI.get('/api/DiFF/article/followingArticleList', {
        params: { repositoryId, searchItem, keyword, page }
    });
    return res.data;
};

/** 댓글 작성 */
export const postReply = async (articleId, comment) => {
    const response = await UserAPI.post(`/api/DiFF/reply/doWrite`, {
        articleId: articleId,
        body: comment
    });
    return response.data;
};

/** 댓글 리스트 */
export const fetchReplies = async (articleId) => {
    const response = await UserAPI.get(`/api/DiFF/reply/list`, {
        params: { articleId },
    });

    return response.data;
};

/** 조회수 */
export async function increaseArticleHits(articleId) {
    const res = await fetch(`/api/DiFF/article/hits/${articleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
    return res.json();
}

/** 검색 */
export const searchArticles = async (keyword) => {
    const res = await ArticleAPI.get(`/api/DiFF/article/search`, {
        params: { keyword }
    });
    return res.data;
};