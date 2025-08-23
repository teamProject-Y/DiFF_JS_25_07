import axios from "axios";

/** 1. 커스텀 Axios 인스턴스 */
export const UserAPI = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json"
    }
});

UserAPI.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const TOKEN_TYPE = localStorage.getItem("tokenType") || "Bearer";
            const ACCESS_TOKEN = localStorage.getItem("accessToken");
            console.log("📦 accessToken:", ACCESS_TOKEN);

            if (ACCESS_TOKEN) {
                config.headers['Authorization'] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
            }

            const REFRESH_TOKEN = localStorage.getItem("refreshToken");
            console.log("📦 refreshToken:", REFRESH_TOKEN);

            console.log("🚀 최종 요청 헤더:", config.headers);
        }
        return config;
    },
    (error) => Promise.reject(error)
);


export const setAuthHeader = () => {
    if (typeof window !== "undefined") {
        const TOKEN_TYPE = localStorage.getItem("tokenType") || 'Bearer';
        const ACCESS_TOKEN = localStorage.getItem("accessToken");
        const REFRESH_TOKEN = localStorage.getItem("refreshToken");

        // accessToken이 있을 때만 Authorization 헤더 설정
        if (ACCESS_TOKEN) {
            UserAPI.defaults.headers['Authorization'] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
        } else {
            delete UserAPI.defaults.headers['Authorization'];  // 없으면 제거
        }

        // refreshToken도 마찬가지
        if (REFRESH_TOKEN) {
            UserAPI.defaults.headers['REFRESH_TOKEN'] = REFRESH_TOKEN;
        } else {
            delete UserAPI.defaults.headers['REFRESH_TOKEN'];  // 없으면 제거
        }
    }
};


/** 3. 토큰 자동 재발급 (Refresh) */
const refreshAccessToken = async () => {
    if (typeof window === "undefined") return;

    const REFRESH_TOKEN = localStorage.getItem("refreshToken");
    if (!REFRESH_TOKEN) {
        console.warn("refreshToken이 없습니다. 재로그인이 필요합니다.");
        return;
    }

    try {
        const response = await axios.get(`http://localhost:8080/api/DiFF/auth/refresh`, {
            headers: { 'REFRESH_TOKEN': REFRESH_TOKEN }
        });

        const ACCESS_TOKEN = response.data.accessToken;
        const TOKEN_TYPE = localStorage.getItem("tokenType") || "Bearer";

        localStorage.setItem('accessToken', ACCESS_TOKEN);
        window.dispatchEvent(new Event('auth-changed'));
        UserAPI.defaults.headers['Authorization'] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;

        console.log("액세스 토큰 갱신 성공:", ACCESS_TOKEN);
        return ACCESS_TOKEN; // 필요하면 반환
    } catch (error) {
        if (error.response) {
            console.error("토큰 갱신 실패:", error.response.status, error.response.data);
        } else {
            console.error("토큰 갱신 요청 자체 실패:", error.message);
        }
        return null;
    }
};

/** 4. 인터셉터로 토큰 만료 자동 처리 */
UserAPI.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (
            error.response &&
            (error.response.status === 403 || error.response.status === 401) &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            await refreshAccessToken();
            setAuthHeader();
            return UserAPI(originalRequest);
        }
        return Promise.reject(error);
    }
);

/** 5. Auth/회원 관련 API들 */

// 5-1. 로그인
export const login = async ({ email, loginPw }) => {
    const data = { email, loginPw };
    const response = await UserAPI.post(`http://localhost:8080/api/DiFF/member/login`, data);
    return response.data;
};

// 5-2. 회원가입
export const signUp = async ({ loginPw, checkLoginPw, nickName, email }) => {
    const data = { loginPw, checkLoginPw, nickName, email };

    console.log("📤 회원가입 요청:", data);
    const response = await UserAPI.post('http://localhost:8080/api/DiFF/member/doJoin', data);
    console.log("📥 서버 응답:", response.data);
    return response.data;
};

// 5-3. 회원 페이지
export const fetchUser = async (nickName) => {
    const response = await UserAPI.get(`/api/DiFF/member/profile`, {
        params: nickName ? { nickName } : {}
    });
    return response.data;
};

// 5-4. 회원 수정
export const modifyUser = async ({ id, loginId, name, nickName, email }) => {
    const data = { id, loginId, name, nickName, email };
    const response = await UserAPI.put(`api/DiFF/member/modify`, data);
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

// 상대방을 팔로우
export const followMember = async (fromMemberId) => {
    const response = await UserAPI.post(`/api/DiFF/member/follow`, null, {
        params: { fromMemberId },  // ✅ 서버가 요구하는 이름 맞추기
    });
    return response.data;
};

// 상대방을 언팔로우
export const unfollowMember = async (fromMemberId) => {
    const response = await UserAPI.delete(`/api/DiFF/member/unfollow`, {
        params: { fromMemberId },  // ✅ 동일하게 수정
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