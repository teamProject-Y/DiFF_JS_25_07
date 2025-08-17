// next.config.js
const BACKEND = 'http://localhost:8080/DiFF';

module.exports = {
    // 1) 브라우저 URL 자체를 바꿀 필요가 있을 때 redirects 사용
    async redirects() {
        return [
            // 루트 → 메인 페이지
            {
                source: '/',              // 브라우저가 / 로 들어오면
                destination: '/DiFF/home/main', // main으로
                permanent: false,
            },
            // OAuth2 로그인 라우트
            {
                source: '/login/github',
                destination: 'http://localhost:8080/oauth2/authorization/github',
                permanent: false
            },
            {
                source: '/login/google',
                destination: 'http://localhost:8080/oauth2/authorization/google',
                permanent: false
            },
            // 메인 페이지를 바로 열고 싶으면
            {
                source: '/home',          // /home → /home/main
                destination: '/DiFF/home/main',
                permanent: false,
            },
        ];
    },

    // 2) API 호출처럼 내부 경로만 프록시하고 싶을 때 rewrites 사용
    async rewrites() {
        return [
            { source: '/api/DiFF/:path*', destination: 'http://localhost:8080/api/DiFF/:path*' },

            // 1) NextAuth 엔드포인트는 Next.js가 처리
            { source: '/DiFF/:path*', destination: 'http://localhost:8080/api/DiFF/:path*' },

            // // 2) OAuth2 콜백은 백엔드로
            { source: '/login/oauth2/code/:provider', destination: `${BACKEND}/login/oauth2/code/:provider` },

            // // 3) 회원 관련 API는 백엔드로
            { source: '/DIFF/member/:path*', destination: `${BACKEND}/api/v1/DiFF/member/:path*` },

            // // 4) 정적 리소스
            { source: '/resource/:path*', destination: '/resource/:path*' },

            // // 5) 프론트 라우팅 (직접 렌더링할 페이지)
            { source: '/home/main', destination: '/home/main' },

        ];
    },

    compiler: {
        styledComponents: true
    }
};