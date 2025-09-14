const BACKEND = process.env.NEXT_PUBLIC_HOMEPAGE_URL || 'http://localhost:8080';

module.exports = {
    // 브라우저 URL 자체를 바꿀 필요가 있을 때 redirects 사용
    async redirects() {
        return [
            // 루트 → 메인 페이지
            {
                source: '/',
                destination: '/DiFF/home/main',
                permanent: false,
            },
            // OAuth2 로그인 라우트
            {
                source: '/login/github',
                destination: `${BACKEND}/oauth2/authorization/github`,
                permanent: false
            },
            {
                source: '/login/google',
                destination: `${BACKEND}/oauth2/authorization/google`,
                permanent: false
            },
            // 메인 페이지를 바로 열고 싶으면
            {
                source: '/home',
                destination: '/DiFF/home/main',
                permanent: false,
            },
        ];
    },

    // API 호출처럼 내부 경로만 프록시하고 싶을 때 rewrites 사용
    async rewrites() {
        return [
            { source: '/_bff/DiFF/:path*', destination: `${BACKEND}/api/DiFF/:path*` },

            // 1) NextAuth 엔드포인트는 Next.js가 처리
            { source: '/_bff/:path*', destination: `${BACKEND}/api/DiFF/:path*` },

            // // 2) OAuth2 콜백은 백엔드로
            { source: '/login/oauth2/code/:provider', destination: `${BACKEND}/login/oauth2/code/:provider` },

            // // 4) 정적 리소스
            { source: '/resource/:path*', destination: '/resource/:path*' },

        ];
    },

    compiler: {
        styledComponents: true
    }
};