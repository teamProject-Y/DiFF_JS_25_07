// lib/ArticleAPI.js

// 게시글 가져오기
import { UserApi } from './UserAPI';

export const fetchArticles = async ({ searchItem, keyword, page }) => {
    const response = await UserApi.get('/api/DiFF/article/list',{

        params: { searchItem, keyword, page }
    });
    return response.data;
};
