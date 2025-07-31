import axios from "axios";

/** 1. 커스텀 Axios 인스턴스 */
export const UserApi = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json"
    }
});

UserApi.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const TOKEN_TYPE = localStorage.getItem("tokenType") || "Bearer";
            const ACCESS_TOKEN = localStorage.getItem("accessToken");
            if (ACCESS_TOKEN) {
                config.headers['Authorization'] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
            }
            const REFRESH_TOKEN = localStorage.getItem("refreshToken");
            if (REFRESH_TOKEN) {
                config.headers['REFRESH_TOKEN'] = REFRESH_TOKEN;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// /** 2. 토큰/헤더 동적 세팅 */
// export const setAuthHeader = () => {
//     if (typeof window !== "undefined") {
//         const TOKEN_TYPE = localStorage.getItem("tokenType") || 'Bearer ';
//         const ACCESS_TOKEN = localStorage.getItem("accessToken");
//         UserApi.defaults.headers['Authorization'] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
//         const REFRESH_TOKEN = localStorage.getItem("refreshToken");
//         if (REFRESH_TOKEN) {
//             UserApi.defaults.headers['REFRESH_TOKEN'] = REFRESH_TOKEN;
//         }
//     }
// };

/** 3. 토큰 자동 재발급 (Refresh) */
const refreshAccessToken = async () => {
    if (typeof window !== "undefined") {
        const REFRESH_TOKEN = localStorage.getItem("refreshToken");
        const response = await UserApi.get(`/api/DiFF/auth/refresh`, {
            headers: { 'REFRESH_TOKEN': REFRESH_TOKEN }
        });
        const ACCESS_TOKEN = response.data;
        const TOKEN_TYPE = localStorage.getItem("tokenType");
        localStorage.setItem('accessToken', ACCESS_TOKEN);
        UserApi.defaults.headers['Authorization'] = `${TOKEN_TYPE} ${ACCESS_TOKEN}`;
    }
};

/** 4. 인터셉터로 토큰 만료 자동 처리 */
UserApi.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (
            error.response &&
            error.response.status === 403 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            await refreshAccessToken();
            setAuthHeader();
            return UserApi(originalRequest);
        }
        return Promise.reject(error);
    }
);

/** 5. Auth/회원 관련 API들 */

// 5-1. 로그인
export const login = async ({ loginId, loginPw }) => {
    const data = { loginId, loginPw };
    const response = await UserApi.post(`http://localhost:8080/api/DiFF/member/login`, data);
    return response.data;
};

// 5-2. 회원가입
export const signUp = async ({ loginId, loginPw, checkLoginPw, name, nickName, email }) => {
    const data = { loginId, loginPw, checkLoginPw, name, nickName, email };
    const response = await UserApi.post(`/DiFF/member/join`, data);
    return response.data;
};

// 5-3. 회원 조회
export const fetchUser = async () => {
    const response = await UserApi.get(`/api/DiFF/member/myInfo`);
    return response.data;
};

// 5-4. 회원 수정
export const updateUser = async (data) => {
    const response = await UserApi.put(`/DiFF/member`, data);
    return response.data;
};

// 5-5. 회원 탈퇴
export const deleteUser = async () => {
    await UserApi.delete(`/DiFF/member`);
};

// 5-6. 로그아웃 (필요하면 추가 구현)
// export const logout = async () => { ... };

// 5-7. 토큰 수동 갱신 (필요하면 직접 사용)
// export const manualRefreshToken = refreshAccessToken;

