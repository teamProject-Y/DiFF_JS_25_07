// lib/ArticleAPI.js
import axios from "axios";
import {DraftAPI} from "@/lib/DraftAPI";
import { UserAPI } from "@/lib/UserAPI";

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
            console.log("📦 accessToken:", ACCESS_TOKEN);

            if (ACCESS_TOKEN) {
                config.headers['Authorization'] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
            }

            const REFRESH_TOKEN = localStorage.getItem("refreshToken");
            console.log("📦 refreshToken:", REFRESH_TOKEN);

            console.log("🚀 최종 요청 헤더:", config.headers);
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


/** 3. 토큰 자동 재발급 (Refresh) */
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

/** 4. 인터셉터로 토큰 만료 자동 처리 */
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

/** 5. Auth/회원 관련 API들 */
export const fetchArticles = async ({ repositoryId, searchItem = 0, keyword = "", page = 1 }) => {
    const res = await ArticleAPI.get('/api/DiFF/article/list', {
        params: { repositoryId, searchItem, keyword, page }
    });
    return res.data;
};

export const trendingArticle = async ({ count, days }) => {
    const response = await ArticleAPI.get(`/api/DiFF/article/trending`, {
        params: { count, days }
    });
    return response.data;
}


// lib/ArticleAPI.js
export const writeArticle = async (data) => {
    // repositoryId 숫자 변환
    if (data?.repositoryId != null) {
        data = { ...data, repositoryId: Number(data.repositoryId) };
    }

    // draftId 숫자 변환
    if (data?.draftId != null) {
        data = { ...data, draftId: Number(data.draftId) };
    }

    const res = await ArticleAPI.post('/api/DiFF/article/doWrite', data);
    const result = res.data;

    // (디버깅 로그)
    console.log('📦 doWrite 응답:', result);
    console.log('📦 repository:', result?.data?.repository);
    console.log('📦 draft:', result?.data?.draft);
    console.log('📦 articleId:', result?.data?.articleId);

    return result; // ResultData
};


export const getMyRepositories = async () => {
    const res = await ArticleAPI.get('/api/DiFF/repository/my');
    const repos =
        res.data?.data?.repositories ??
        res.data?.repositories ??
        [];
    // 타입 보정
    return Array.isArray(repos) ? repos : [];
};

export async function getAverageMetrics(repositoryId) {
    const res = await ArticleAPI.get(`/api/DiFF/repository/average/${repositoryId}`);
    return res.data;
}


// ArticleAPI.js
export async function getArticle(id) {
    const res = await ArticleAPI.get(`/api/DiFF/article/detail`, {
        params: { id }
    });
    return res.data.data;
};

// 게시글 수정
export async function modifyArticle(article, token) {
    const res = await axios.post(`/api/DiFF/article/modify`, article, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // 🔑 토큰 추가
        }
    });
    return res.data;
}

export const deleteArticle = async (id) => {
    const url = `/article/${id}`;
    const res = await DraftAPI.delete(url);
    console.log('[API][deleteArticle] status:', res.status, 'data:', res.data);
    return { status: res.status, data: res.data };
};

export const followingArticleList = async ({ repositoryId, searchItem = 0, keyword = "", page = 1 }) => {
    const res = await ArticleAPI.get('/api/DiFF/article/followingArticleList', {
        params: { repositoryId, searchItem, keyword, page }
    });
    return res.data;
};

// 댓글 작성
export const postReply = async (articleId, comment) => {
    const response = await UserAPI.post(`/api/DiFF/reply/doWrite`, {
        articleId: articleId,
        body: comment
    });
    return response.data;
};

// 댓글 목록 불러오기
export const fetchReplies = async (articleId) => {
    const response = await UserAPI.get(`/api/DiFF/reply/list`, {
        params: { articleId },
    });
    console.log(response.data.replies);

    return response.data;
};




