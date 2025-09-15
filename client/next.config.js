// next.config.js
const BACKEND = 'https://api.diff.io.kr';

// 🔍 빌드 타임 로그 (빌드 중에만 출력됨)
console.log("🚀 BUILD TIME ENV");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("GITHUB_ID:", process.env.GITHUB_ID);
console.log("GITHUB_SECRET:", process.env.GITHUB_SECRET);
console.log("NEXT_PUBLIC_HOMEPAGE_URL:", process.env.NEXT_PUBLIC_HOMEPAGE_URL);
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("NEXTAUTH_COOKIE_SECURE:", process.env.NEXTAUTH_COOKIE_SECURE);
console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET);
console.log("NEXT_PUBLIC_API_BASE:", process.env.NEXT_PUBLIC_API_BASE);
console.log("BACKEND (computed):", BACKEND);

module.exports = {
    env: {
        NEXT_PUBLIC_API_BASE: BACKEND,
    },

    async redirects() {
        return [
            { source: '/', destination: '/DiFF/home/main', permanent: false },
            { source: '/login/github', destination: `${BACKEND}/oauth2/authorization/github`, permanent: false },
            { source: '/login/google', destination: `${BACKEND}/oauth2/authorization/google`, permanent: false },
            { source: '/home', destination: '/DiFF/home/main', permanent: false },
        ];
    },

    async rewrites() {
        return [
            { source: '/api/DiFF/:path*', destination: `${BACKEND}/api/DiFF/:path*` },
            { source: '/_bff/DiFF/:path*', destination: `${BACKEND}/api/DiFF/:path*` },
            { source: '/login/oauth2/code/:provider', destination: `${BACKEND}/login/oauth2/code/:provider` },
            { source: '/resource/:path*', destination: '/resource/:path*' },
        ];
    },

    compiler: { styledComponents: true },
};
