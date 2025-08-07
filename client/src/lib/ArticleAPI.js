// lib/ArticleAPI.js

// 게시글 가져오기

import { UserApi } from './UserAPI';

// lib/ArticleAPI.js

export const fetchArticles = async ({ repositoryId, searchItem = 0, keyword = "", page = 1 }) => {
    const res = await UserApi.get('/api/DiFF/article/list', {
        params: { repositoryId, searchItem, keyword, page }
    });
    return res.data;
};


