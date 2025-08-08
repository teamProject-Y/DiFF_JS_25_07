// lib/ArticleAPI.js

// 게시글 가져오기

import { UserApi } from './UserAPI';

// lib/ArticleAPI.js

export const fetchArticles = async ({ searchItem = 0, keyword = "", page = 1 }) => {
    const res = await UserApi.get(`/api/DiFF/article/list`, {
        params: { searchItem, keyword, page }
    });
    return res.data;
};

export const trendingArticle = async ({ count }) => {
    const res = await UserApi.get(`/api/DiFF/article/trending`, {
        params: { count }
    })
    return res.data;
}

