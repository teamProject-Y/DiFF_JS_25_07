import {UserAPI} from "@/lib/userAPI";
import {ArticleAPI} from "@/lib/ArticleAPI";

// fetch github repository
export const getGithubRepos = async () => {
    const response = await UserAPI.get(`/api/DiFF/github/repos`, {
    });
    return response.data;
};

export const createRepository = async (data) => {
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
        name: ghRepo?.name || ghRepo?.full_name || '',
        description: ghRepo?.description || '',
        aPrivate: !!ghRepo?.private,
        upstreamUrl: ghRepo?.html_url || ghRepo?.url || '',
        defaultBranch: ghRepo?.default_branch || '',
        source: 'github',
        externalId: String(ghRepo?.id ?? ''),
    };

    return await createRepository(payload); // { resultCode, msg, data(newRepoId) ... }
};