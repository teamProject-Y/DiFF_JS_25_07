const BACKEND = 'http://44.206.130.144:8080/DiFF';

/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            { source: '/', destination: '/DiFF/home/main', permanent: false },
            { source: '/login/github', destination: 'http://44.206.130.144:8080/oauth2/authorization/github', permanent: false },
            { source: '/login/google', destination: 'http://44.206.130.144:8080/oauth2/authorization/google', permanent: false },
            { source: '/home', destination: '/DiFF/home/main', permanent: false },
        ];
    },

    async rewrites() {
        return [
            // API 프록시
            { source: '/api/DiFF/:path*', destination: 'http://44.206.130.144:8080/api/DiFF/:path*' },
            { source: '/DiFF/:path*', destination: 'http://44.206.130.144:8080/api/DiFF/:path*' },

            // OAuth2 콜백
            { source: '/login/oauth2/code/:provider', destination: `${BACKEND}/login/oauth2/code/:provider` },

            // 회원 API
            { source: '/DIFF/member/:path*', destination: `${BACKEND}/api/v1/DiFF/member/:path*` },

            // 정적 리소스
            { source: '/resource/:path*', destination: '/resource/:path*' },

            // 프론트 라우트
            { source: '/home/main', destination: '/home/main' },
        ];
    },

    compiler: {
        styledComponents: true,
    },
};

module.exports = nextConfig;
