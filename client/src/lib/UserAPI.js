import axios from "axios";

/** 1. 커스텀 Axios 인스턴스 */
export const UserAPI = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json"
    }
});

/** 2. 요청 인터셉터: AccessToken 자동 추가 */
UserAPI.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const TOKEN_TYPE = localStorage.getItem("tokenType") || "Bearer";
            const ACCESS_TOKEN = localStorage.getItem("accessToken");
            if (ACCESS_TOKEN) {
                config.headers['Authorization'] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/** 3. AccessToken 자동 갱신 (Refresh) */
const refreshAccessToken = async () => {
    if (typeof window === "undefined") return null;

    const REFRESH_TOKEN = localStorage.getItem("refreshToken");
    if (!REFRESH_TOKEN) {
        console.warn("❌ refreshToken 없음 → 다시 로그인 필요");
        return null;
    }

    try {
        // ✅ POST + body 로 맞춤
        const res = await axios.post("http://localhost:8080/api/DiFF/auth/refresh", {
            refreshToken: REFRESH_TOKEN
        });

        const ACCESS_TOKEN = res.data.accessToken;
        const TOKEN_TYPE = localStorage.getItem("tokenType") || "Bearer";

        // ✅ 새 토큰 저장
        localStorage.setItem("accessToken", ACCESS_TOKEN);
        UserAPI.defaults.headers['Authorization'] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;

        console.log("🔑 새 AccessToken 갱신:", ACCESS_TOKEN);
        return ACCESS_TOKEN;
    } catch (err) {
        console.error("❌ 토큰 갱신 실패:", err.response?.data || err.message);
        // refreshToken도 무효화 → 재로그인 필요
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/DiFF/member/login";
        return null;
    }
};

/** 4. 응답 인터셉터: 토큰 만료 시 자동 재시도 */
UserAPI.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;
            const newToken = await refreshAccessToken();
            if (newToken) {
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return UserAPI(originalRequest);
            }
        }
        return Promise.reject(error);
    }
);

/** 5. Auth/회원 관련 API들 */

// 로그인
export const login = async ({ email, loginPw }) => {
    const res = await UserAPI.post("/api/DiFF/auth/login", { email, loginPw });
    const { accessToken, refreshToken } = res.data;


    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("tokenType", "Bearer");

    console.log("✅ 로그인 성공 → 토큰 저장 완료");
    return res.data;
};

// 회원가입
export const signUp = async ({ loginPw, checkLoginPw, nickName, email }) => {
    const res = await UserAPI.post("/api/DiFF/auth/join", { loginPw, checkLoginPw, nickName, email });
    const { accessToken, refreshToken } = res.data;


    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("tokenType", "Bearer");

    console.log("✅ 회원가입 + 자동 로그인 성공 → 토큰 저장 완료");
    return res.data;
};

// 5-3. 회원 페이지
export const fetchUser = async (nickName) => {
    const response = await UserAPI.get(`/api/DiFF/member/profile`, {
        params: nickName ? { nickName } : {}
    });
    return response.data;
};

// 5-4. 회원 수정
export const modifyNickName = async ({nickName}) => {
    const data = {nickName };
    const response = await UserAPI.put(`api/DiFF/member/doModifyNickName`, data);
    return response.data;
};

export const modifyIntroduce = async ({introduce}) => {
    const data = {introduce };
    const response = await UserAPI.put(`api/DiFF/member/doModifyIntroduce`, data);
    return response.data;
};

export const checkPwUser = async (data) => {
    const response = await UserAPI.put(`/api/DiFF/member/checkPw`, data);
    return response.data;
}

// 5-5. 회원 탈퇴
export const deleteUser = async () => {
    await UserAPI.delete(`/DiFF/member`);
};

export const getFollowingList = async () => {
    const response = await UserAPI.get(`/api/DiFF/member/followingList`);
    return response.data;
}

export const getFollowerList = async () => {
    const response = await UserAPI.get(`/api/DiFF/member/followerList`);
    return response.data;
}

// 상대방을 팔로우
export const followMember = async (fromMemberId) => {
    const response = await UserAPI.post(`/api/DiFF/member/follow`, null, {
        params: { fromMemberId },
    });
    return response.data;
};

// 상대방을 언팔로우
export const unfollowMember = async (fromMemberId) => {
    const response = await UserAPI.delete(`/api/DiFF/member/unfollow`, {
        params: { fromMemberId },
    });
    return response.data;
};

// 5-6. 로그아웃 (필요하면 추가 구현)
// export const logout = async () => { ... };

// 5-7. 토큰 수동 갱신 (필요하면 직접 사용)
// export const manualRefreshToken = refreshAccessToken;

export const uploadProfileImg = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await axios.post(`/api/DiFF/member/uploadProfileImg`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });
        return res.data;
    } catch (err) {
        console.error("업로드 실패:", err);
        throw err;
    }
};