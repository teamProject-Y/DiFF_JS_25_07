import { UserAPI } from "@/lib/UserAPI";
import { ArticleAPI } from "@/lib/ArticleAPI";
import axios from "axios";

export const RepositoryAPI = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json"
    }
});

RepositoryAPI.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const type = localStorage.getItem("tokenType") || "Bearer";
        const at = localStorage.getItem("accessToken");
        if (at) config.headers.Authorization = `${type} ${at}`;
    }
    return config;
});

// GitHub 리포 목록 가져오기
export const getGithubRepos = async () => {
    const response = await UserAPI.get(`/api/DiFF/github/repos`);
    return response.data;
};

// 리포 생성
export const createRepository = async (data) => {
    console.log("repo create 요청:", data);
    try {
        const res = await ArticleAPI.post("/api/DiFF/repository/createRepository", data);
        console.log("[API][createRepository] status:", res.status, "data:", res.data);
        return res.data;
    } catch (err) {
        console.error("[API][createRepository] error:", err);
        throw err;
    }
};

// 리포 이름 변경
export const renameRepository = async (id, name) => {
    const res = await ArticleAPI.post("/api/DiFF/repository/rename", { id, name });
    return res.data;
};


// 분석 히스토리 조회
export const getAnalysisHistory = async (repoId) => {
    console.log("[API] 요청 시작: /api/DiFF/repository/" + repoId + "/history");
    const res = await ArticleAPI.get(`/api/DiFF/repository/${repoId}/history`);
    console.log("[API] 응답:", res.data);
    return res.data?.data1 || [];
};

// 언어 비율 조회
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

// GitHub Repo → DB로 가져오기
export const importGithubRepo = async (ghRepo) => {
    const payload = {
        name: ghRepo?.name ?? ghRepo?.full_name ?? "",
        aPrivate: ghRepo?.aPrivate ?? !!ghRepo?.private ?? false,
        url: ghRepo?.url ?? ghRepo?.html_url ?? "",
        defaultBranch: ghRepo?.defaultBranch ?? ghRepo?.default_branch ?? "",
        githubOwner: ghRepo?.githubOwner ?? null,
        githubName: ghRepo?.githubName ?? null,
    };
    return await createRepository(payload);
};

// 커밋 리스트 조회
export const getGithubCommitList = async (repo, opts = {}) => {
    if (!repo?.name || !repo?.url) {
        throw new Error("Missing repository");
    }

    const owner = repo.githubOwner ?? repo.url.split("/")[3];
    const repoName = repo.githubName ?? repo.url.split("/")[4];

    const params = {
        owner: repo.owner ?? owner,
        repoName: repoName,
        branch: opts.branch ?? repo.defaultBranch ?? null,
        page: opts.page ?? null,
        perPage: opts.perPage ?? null,
    };

    const res = await UserAPI.get(`/api/DiFF/github/commits`, { params });
    const data = res?.data ?? {};
    const code = data.resultCode || data.code || "";
    if (code && !String(code).startsWith("S-")) {
        throw new Error(data.msg || data.message || "커밋 조회 실패");
    }

    const raw =
        data.data1 ??
        (Array.isArray(data.data) ? data.data : data.data?.commits) ??
        [];

    const normalize = (c) => ({
        sha: c.sha,
        htmlUrl: c.htmlUrl || c.html_url,
        message: (c.message || "").split("\n")[0],
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

// GitHub Repo URL 검증
export const connectRepository = async (repoUrl) => {
    const res = await UserAPI.get(`/api/DiFF/github/validate`, { params: { url: repoUrl } });
    return res.data;
};

// 특정 커밋으로 Draft 생성
export const mkDraft = async (owner, repoName, sha) => {
    if (!owner || !repoName || !sha) {
        throw new Error(
            `mkDraft: missing required fields. owner=${owner}, repoName=${repoName}, sha=${sha}`
        );
    }
    const res = await UserAPI.get(`/api/DiFF/github/commit/${owner}/${repoName}/${sha}`);
    return res.data;
};

export const deleteRepository = async (id) => {
    try {
        const res = await ArticleAPI.delete(`/api/DiFF/repository/${id}`); // ✅ 인스턴스 사용
        console.log("[API][deleteRepository] status:", res.status, "data:", res.data);
        return res.data;
    } catch (err) {
        console.error("[API][deleteRepository] error:", err);
        throw err;
    }
}
