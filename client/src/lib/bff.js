// src/lib/bff.js
const ORIGIN = process.env.BACKEND_ORIGIN || 'http://44.206.130.144:8080';

// 브라우저에서 토큰 가져오기 (cookie > localStorage)
function getClientToken() {
    if (typeof document === 'undefined') return '';
    const m = document.cookie.match(/(?:^|;\s*)(Authorization|accessToken|jwt)=([^;]+)/i);
    let token = m ? decodeURIComponent(m[2]) : '';
    if (!token && typeof localStorage !== 'undefined') {
        token =
            localStorage.getItem('Authorization') ||
            localStorage.getItem('accessToken') ||
            localStorage.getItem('jwt') || '';
    }
    if (token && !/^Bearer\s/i.test(token)) token = `Bearer ${token}`;
    return token;
}

export async function bff(path, opts = {}) {
    // FE: /DiFF/...  →  BE: /api/DiFF/...
    const apiPath = path.replace(/^\/DiFF\//, '/api/DiFF/');

    // 서버/브라우저 공통 헤더 병합
    const h = new Headers(opts.headers);

    if (typeof window === 'undefined') {
        // ✅ 서버(SSR/RSC): 절대 URL로 직접 호출
        // next/headers는 서버 분기에서만 동적 import
        const { cookies, headers: nextHeaders } = await import('next/headers');
        const cookieStr = cookies().toString();
        if (cookieStr && !h.has('cookie')) h.set('cookie', cookieStr);

        // Authorization 전파 (요 프로젝트 쿠키/헤더 키에 맞춰 자동 탐색)
        const incomingAuth = nextHeaders().get('authorization');
        const cookieAuth =
            cookies().get('Authorization')?.value ||
            cookies().get('accessToken')?.value ||
            cookies().get('jwt')?.value || '';
        const bearer =
            h.get('authorization') ||
            incomingAuth ||
            (cookieAuth ? (cookieAuth.startsWith('Bearer ') ? cookieAuth : `Bearer ${cookieAuth}`) : '');

        if (bearer && !h.has('authorization')) h.set('authorization', bearer);

        return fetch(`${ORIGIN}${apiPath}`, {
            ...opts,
            headers: h,
            cache: 'no-store',
            redirect: 'manual',     // ★ 302 자동 추적 금지
        });
    }
    // ✅ 브라우저: /_bff 프록시(Next rewrites가 백엔드로 전달)
    const proxied = apiPath.replace(/^\/api\//, '/_bff/');

    // 브라우저 토큰 주입
    const clientBearer = h.get('authorization') || getClientToken();
    if (clientBearer && !h.has('authorization')) h.set('authorization', clientBearer);

    return fetch(proxied, {
        ...opts,
        headers: h,
        cache: 'no-store',
        credentials: 'include',   // 프록시 경유 시 쿠키 포함
        redirect: 'manual',       // ★ 302 자동 추적 금지
    });
}