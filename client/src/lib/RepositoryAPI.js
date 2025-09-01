import {UserAPI} from "@/lib/userAPI";
import {ArticleAPI} from "@/lib/ArticleAPI";

// fetch github repository
export const getGithubRepos = async () => {
    const response = await UserAPI.get(`/api/DiFF/github/repos`, {
    });
    return response.data;
};

export const createRepository = async (data) => {

    console.log("repo create 요청 : " + data);

    try {
        const res = await ArticleAPI.post("/api/DiFF/repository/createRepository", data);
        console.log("[API][createRepository] status:", res.status, "data:", res.data);
        return res.data;
    } catch (err) {
        console.error("[API][createRepository] error:", err);
        throw err;
    }
};

export const importGithubRepo = async (ghRepo) => {
    const payload = {
        name: ghRepo?.name ?? ghRepo?.full_name ?? '',
        aPrivate: ghRepo?.aPrivate ?? !!ghRepo?.private ?? false,
        url: ghRepo?.url ?? ghRepo?.html_url ?? ghRepo?.apiUrl ?? '',
        defaultBranch: ghRepo?.defaultBranch ?? ghRepo?.default_branch ?? '',
        owner: ghRepo?.owner ?? ghRepo?.ownerLogin ?? ghRepo?.owner?.login ?? '',
    };

    return await createRepository(payload); // 서버는 Repository로 바인딩
};