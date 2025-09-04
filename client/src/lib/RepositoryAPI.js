import {UserAPI} from "@/lib/UserAPI";
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

export const getAnalysisHistory = async (repoId) => {
    console.log("[API] 요청 시작: /api/DiFF/repository/" + repoId + "/history");
    const res = await ArticleAPI.get(`/api/DiFF/repository/${repoId}/history`);
    console.log("[API] 응답:", res.data);
    return res.data?.data1 || [];
};

export const getLanguageDistribution = async (repoId) => {
    try {
        console.log("[API] 요청 시작: /api/DiFF/repository/" + repoId + "/languages");
        const res = await ArticleAPI.get(`/api/DiFF/repository/${repoId}/languages`);
        console.log("[API] 응답:", res.data);

        return res.data?.data1 ?? [];
    } catch (err) {
        console.error("[API] getLanguageDistribution error:", err);
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

export const deleteRepository = async (ghRepo) => {

}

export const modifyRepository = async (ghRepo) => {

}