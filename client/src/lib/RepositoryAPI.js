import { UserAPI } from "@/lib/userAPI";

// fetch github repository
export const getGithubRepos = async () => {
    const response = await UserAPI.get(`/api/DiFF/github/repos`, {
    });
    return response.data;
};
