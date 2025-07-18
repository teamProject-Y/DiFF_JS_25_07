// next.config.js (프로젝트 루트)
const path = require('path');

module.exports = {
    // (앱 디렉터리 사용 시)
    // experimental: { appDir: true },

    // 1) 내부 프록시 설정: rewrites
    async rewrites() {
        return [
            {
                source: '/login/github',
                destination: 'http://localhost:8080/oauth2/authorization/github',
            },
            {
                source: '/login/google',
                destination: 'http://localhost:8080/oauth2/authorization/google',
            },
            {
                source: '/api/:path*',
                destination: 'http://localhost:8080/usr/:path*',
            },
        ];
    },

    // 2) (필요 시) CSS 로더 커스터마이징
    webpack(config) {
        config.module.rules.unshift({
            test: /\.css$/,
            // 실제 CSS가 있는 폴더 경로로 바꿔주세요
            include: path.resolve(__dirname, 'src/styles'),
            use: ['style-loader', 'css-loader'],
        });
        return config;
    },
};
