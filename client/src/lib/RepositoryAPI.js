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

export const renameRepository = async (data) => {
    try {
        const res = await ArticleAPI.post("/api/DiFF/repository/rename", data);
        console.log("[API][renameRepository] status:", res.status, "data:", res.data);
        return res.data;
    } catch (err) {
        console.error("[API][renameRepository] error:", err);
        throw err;
    }
}

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
        url: ghRepo?.url ?? ghRepo?.html_url ?? '',
        defaultBranch: ghRepo?.defaultBranch ?? ghRepo?.default_branch ?? '',
        // owner: ghRepo?.owner ?? ghRepo?.ownerLogin ?? ghRepo?.owner?.login ?? '',
        githubOwner: ghRepo?.githubOwner ?? null,
        githubName: ghRepo?.githubName ?? null,
    };

    return await createRepository(payload);
};

export const getGithubCommitList = async (repo, opts = {}) => {

    if (!repo?.name || !repo?.url) {
        throw new Error('Missing repository');
    }

    // https://github.com/teamProject-Y/DiFF
    const owner = repo.githubOwner ?? repo.url.split('/')[3];
    const repoName = repo.githubName ?? repo.url.split('/')[4];

    const params = {
        owner: repo.owner ?? owner,
        repoName: repoName,
        branch: opts.branch ?? repo.defaultBranch ?? null,
        page: opts.page ?? null,
        perPage: opts.perPage ?? null,
    };

    const res = await UserAPI.get(`/api/DiFF/github/commits`, { params });

    const data = res?.data ?? {};
    const code = data.resultCode || data.code || '';
    if (code && !String(code).startsWith('S-')) {
        throw new Error(data.msg || data.message || '커밋 조회 실패');
    }

    const raw =
        data.data1 ??
        (Array.isArray(data.data) ? data.data : data.data?.commits) ??
        [];

    const normalize = (c) => ({
        sha: c.sha,
        htmlUrl: c.htmlUrl || c.html_url,
        message: (c.message || '').split('\n')[0],
        authorName: c.authorName ?? c.AuthorName,
        authorLogin: c.authorLogin ?? c.AuthorLogin,
        authorAvatarUrl: c.authorAvatarUrl ?? c.AuthorAvatarUrl,
        authoredAt: c.authoredAt ?? c.AuthoredAt,
        parentSha:
            c.parentSha ??
            (Array.isArray(c.parents) && c.parents.length > 0 ? c.parents[0]?.sha : null),
    });

    return Array.isArray(raw) ? raw.map(normalize) : [];
};
