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

export const fetchArticles = async ({ repositoryId, searchItem = 0, keyword = "", page = 1 }) => {
    const res = await UserApi.get('/api/DiFF/article/list', {
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

