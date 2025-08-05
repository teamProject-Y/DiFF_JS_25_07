import {UserApi} from "@/lib/UserAPI";

export async function fetchArticles({ searchItem, keyword, page }) {
    const res = await UserApi.post('/api/DiFF/article/list', {
        searchItem,
        keyword,
        page,
    });

    return res.data;
}