// next.config.js (프로젝트 루트)
const path = require('path');

module.exports = {
    async rewrites() {
        return [
            // NextAuth 기본 엔드포인트 프록시
            {
                source: '/api/auth/session',
                destination: 'http://localhost:8080/session',
            },
            {
                source: '/api/auth/_log',
                destination: 'http://localhost:8080/log',
            },

            // 여러분이 직접 만든 세션/로그 API
            {
                source: '/session',
                destination: 'http://localhost:8080/session',
            },
            {
                source: '/_log',
                destination: 'http://localhost:8080/log',
            },

            // OAuth2 로그인 라우트
            {
                source: '/login/github',
                destination: 'http://localhost:8080/oauth2/authorization/github',
            },
            {
                source: '/login/google',
                destination: 'http://localhost:8080/oauth2/authorization/google',
            },

            // /usr/** API 프록시
            {
                source: '/DiFF/:path*',
                destination: 'http://localhost:8080/DiFF/:path*',
            },

            // /DiFF/** 페이지용 프로토타입 (필요하다면)
            {
                source: '/DiFF/:path*',
                destination: 'http://localhost:8080/DiFF/:path*',
            },
            {
                source: '/',
                destination: '/DiFF/home/main',
            },
        ];
    },

    webpack(config) {
        config.module.rules.unshift({
            test: /\.css$/,
            include: path.resolve(__dirname, 'public'),  // common.css/js는 public으로 옮겨두세요
            use: ['style-loader', 'css-loader'],
        });
        return config;
    },
};
