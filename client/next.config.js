// next.config.js
const BACKEND = 'https://api.diff.io.kr/api/DiFF';

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
