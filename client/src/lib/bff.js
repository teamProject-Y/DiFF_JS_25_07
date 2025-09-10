// src/lib/bff.js
const ORIGIN = process.env.BACKEND_ORIGIN || 'http://localhost:8080';

export async function bff(path, opts) {
    // FE에서 쓰던 '/DiFF/...' 경로를 BE의 '/api/DiFF/...'로 변환
    const apiPath = path.replace(/^\/DiFF\//, '/api/DiFF/');

    if (typeof window === 'undefined') {
        // ✅ 서버(SSR/RSC): 절대 URL로 직접 호출 → 상대경로 금지
        return fetch(`${ORIGIN}${apiPath}`, opts);
    }
    // ✅ 브라우저: /_bff 프록시(Next rewrites가 백엔드로 전달)
    const proxied = apiPath.replace(/^\/api\//, '/_bff/');
    return fetch(proxied, opts);
}
