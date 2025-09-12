/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            { source: '/', destination: '/DiFF/home/main', permanent: false },
            {
                source: '/login/github',
                destination: `${process.env.NEXT_PUBLIC_BACKEND}/oauth2/authorization/github`,
                permanent: false,
            },
            {
                source: '/login/google',
                destination: `${process.env.NEXT_PUBLIC_BACKEND}/oauth2/authorization/google`,
                permanent: false,
            },
            { source: '/home', destination: '/DiFF/home/main', permanent: false },
        ];
    },

    async rewrites() {
        return [
            // API 프록시
            {
                source: '/api/DiFF/:path*',
                destination: `${process.env.NEXT_PUBLIC_API_BASE}/:path*`,
            },
            {
                source: '/DiFF/:path*',
                destination: `${process.env.NEXT_PUBLIC_API_BASE}/:path*`,
            },

            // OAuth2 콜백
            {
                source: '/login/oauth2/code/:provider',
                destination: `${process.env.NEXT_PUBLIC_BACKEND}/login/oauth2/code/:provider`,
            },

            // 회원 API
            {
                source: '/DiFF/member/:path*',
                destination: `${process.env.NEXT_PUBLIC_BACKEND}/api/v1/DiFF/member/:path*`,
            },

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
