// lib/ArticleAPI.js

import { UserApi } from './UserAPI';
import axios from "axios";

/** 커스텀 Axios 인스턴스 */
export const ArticleApi = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json"
    }
});

ArticleApi.interceptors.request.use(
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
            ArticleApi.defaults.headers['Authorization'] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
        } else {
            delete ArticleApi.defaults.headers['Authorization'];  // 없으면 제거
        }

        // refreshToken도 마찬가지
        if (REFRESH_TOKEN) {
            ArticleApi.defaults.headers['REFRESH_TOKEN'] = REFRESH_TOKEN;
        } else {
            delete ArticleApi.defaults.headers['REFRESH_TOKEN'];  // 없으면 제거
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
        ArticleApi.defaults.headers['Authorization'] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
    }
};

/** 4. 인터셉터로 토큰 만료 자동 처리 */
ArticleApi.interceptors.response.use(
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
            return ArticleApi(originalRequest);
        }
        return Promise.reject(error);
    }
);

/** 5. Auth/회원 관련 API들 */


export const fetchArticles = async ({ repositoryId, searchItem = 0, keyword = "", page = 1 }) => {
    const res = await ArticleApi.get('/api/DiFF/article/list', {
        params: { repositoryId, searchItem, keyword, page }
    });
    return res.data;
};

export const trendingArticle = async ({ count, days }) => {
    const response = await ArticleApi.get(`/api/DiFF/article/trending`, {
        params: { count, days }
    });
    return response.data;
}

export const DraftsArticle = async () => {
    const response = await ArticleApi.get('/api/DiFF/article/drafts');
    return response.data;
};
// lib/ArticleAPI.js
export const writeArticle = async (data) => {
    // data.repositoryId 는 숫자여야 하면 여기서 캐스팅
    if (data?.repositoryId != null) {
        data = { ...data, repositoryId: Number(data.repositoryId) };
    }

    const res = await ArticleApi.post('/api/DiFF/article/doWrite', data);
    const result = res.data;

    // (원하면) 여기서 로그
    console.log('📦 doWrite 응답:', result);
    console.log('📦 repository:', result?.data?.repository);
    console.log('📦 draft:', result?.data?.draft);
    console.log('📦 articleId:', result?.data?.articleId);

    return result; // ResultData
};

// 작성 폼용 리포 로드: GET /api/DiFF/article/write?repositoryId=...
export const showRepo = async (repositoryId) => {
    const res = await ArticleApi.get('/api/DiFF/article/write', {
        params: { repositoryId: Number(repositoryId) },
    });
    return res.data; // { resultCode, msg, data: { repository } }
};

export const getMyRepositories = async () => {
    const res = await ArticleApi.get('/api/DiFF/repository/my');

    // 백엔드에서 이런 구조로 올 가능성들 모두 안전하게 언래핑
    // { resultCode, msg, data: { repositories: [...] } }
    // { resultCode, msg, repositories: [...] }
    // { repositories: [...] }
    const repos =
        res.data?.data?.repositories ??
        res.data?.repositories ??
        [];

    // 타입 보정
    return Array.isArray(repos) ? repos : [];
};

export const dd = async (repositoryId, title, body) => {
    const data = { repositoryId, title, body};
    const response = await ArticleApi.post('http://localhost:8080/api/DiFF/article/doWrite', data)
        // {
        //     headers: {
        //         'Content-Type': 'application/json',
        //         Authorization: token ? `Bearer ${token}` : ''
    return response.data;
}
