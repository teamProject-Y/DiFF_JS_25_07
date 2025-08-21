// pages/usr/home/page.js
'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import { trendingArticle } from '@/lib/ArticleAPI';

// 동적 import (Swiper)
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
const SwiperWrapper = dynamic(() => import('swiper/react').then(mod => mod.Swiper), { ssr: false });
const SwiperSlide   = dynamic(() => import('swiper/react').then(mod => mod.SwiperSlide), { ssr: false });
SwiperWrapper.displayName = 'SwiperWrapper';
SwiperSlide.displayName   = 'SwiperSlide';

// 외부 컴포넌트
const OverlayMenu     = dynamic(() => import('@/common/overlayMenu'), { ssr: false });
const HamburgerButton = dynamic(() => import('@/common/HamMenu'), { ssr: false });

// 로그인 분기용: 만료/리프레시 (페이지 내부 간단 버전)
function isExpired(token, skewMs = 30000) {
    try {
        const payload = JSON.parse(atob((token?.split?.('.')[1] || '')));
        if (!payload?.exp) return false; // exp 없으면 패스
        return payload.exp * 1000 <= Date.now() - skewMs;
    } catch {
        return true;
    }
}
async function tryRefresh() {
    if (typeof window === 'undefined') return false;
    const rt = localStorage.getItem('refreshToken');
    if (!rt) return false;
    try {
        const res = await fetch('/DiFF/auth/refresh', {
            method: 'GET',
            headers: { 'REFRESH_TOKEN': rt },
            credentials: 'include',
        });
        if (!res.ok) return false;
        const data = await res.json().catch(() => ({}));
        const newAccess = data.accessToken || data.data1 || data?.data?.accessToken;
        if (!newAccess) return false;
        localStorage.setItem('accessToken', newAccess);
        window.dispatchEvent(new Event('auth-changed'));
        return true;
    } catch {
        return false;
    }
}
function useMountedLogin() {
    const [mounted, setMounted] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    useEffect(() => {
        setMounted(true);
        const compute = async () => {
            const t = localStorage.getItem('accessToken');
            if (t && !isExpired(t)) { setLoggedIn(true); return; }
            const ok = await tryRefresh();
            setLoggedIn(ok); // ✅ 오타 수정: setLoggedIn(오케이) → setLoggedIn(ok)
        };
        compute();
        const onChange = () => compute();
        window.addEventListener('auth-changed', onChange);
        window.addEventListener('storage', onChange);
        return () => {
            window.removeEventListener('auth-changed', onChange);
            window.removeEventListener('storage', onChange);
        };
    }, []);
    return { mounted, loggedIn };
}

// JWT payload 파싱 (사용자 코드 유지)
function parseJwt(token) {
    if (!token) return {};
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return {};
    }
}

// 분기용 컴포넌트 import (2개만)
import BeforeMainPage from './BeforeMainPage';
import AfterMainPage   from './AfterMainPage';

export default function Page() {
    const [log, setLog] = useState([]);               // (PreLoginTerminal 내부로 이동됨 — 여기선 유지해도 무해)
    const [step, setStep] = useState(0);              // ↑ 같은 이유로 그대로 둬도 동작에는 영향 없음
    const [input, setInput] = useState('');           // (필요시 제거 가능)
    const [showInput, setShowInput] = useState(false);
    const inputRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [accessToken, setAccessToken] = useState(null);
    const [user, setUser] = useState({ email: '', blogName: '' });
    const [currentResultText, setCurrentResultText] = useState(null);
    const [showResultAnim, setShowResultAnim] = useState(false);
    const [lastDoneStep, setLastDoneStep] = useState(-1);
    const [trendingArticles, setTrendingArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    const { mounted, loggedIn } = useMountedLogin();

    const [isClient, setIsClient] = useState(false);

    useEffect(() => setIsClient(true), []);

    useEffect(() => {
        trendingArticle(10, 7)
            .then(res => {
                setTrendingArticles(res.articles || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            setAccessToken(token);
            if (token) {
                const userInfo = parseJwt(token);
                setUser({ email: userInfo.memberEmail, blogName: userInfo.blogName });
            }
        }
    }, []);

    if (!mounted) return null; // 마운트 전 렌더 방지

    /* ───────────────── 분기: JWT 토큰만 보고 결정 ───────────────── */
    if (loggedIn) {
        return <AfterMainPage me={user} trendingArticles={trendingArticles} />;
    }

    // 로그인 전 화면 + 트렌딩 + 메뉴 (사용자 UI 유지)
    return (
        <div className="w-full min-h-screen bg-[#161616]">
            <div className="h-screen">
                <BeforeMainPage />
            </div>

            {/* trending */}
            <div className="w-full h-screen bg-blue-500 px-36 py-10">
                <div className="text-5xl text-black font-bold">Trending</div>
                <div className="article-slider h-2/3 w-full mt-16 flex bg-blue-300">
                    {loading ? (
                        <div className="flex justify-between w-full items-start">
                            <div className="w-[30.446%] h-[90%] p-4 bg-white shadow-md rounded-md"></div>
                            <div className="w-[30.446%] h-[90%] p-4 bg-white shadow-md rounded-md"></div>
                            <div className="w-[30.446%] h-[90%] p-4 bg-white shadow-md rounded-md"></div>
                        </div>
                    ) : (
                        isClient && (
                            <SwiperWrapper
                                modules={[Navigation, Pagination, A11y, Autoplay]}
                                spaceBetween={50}
                                loop={true}
                                autoplay={{ delay: 3000 }}
                                slidesPerView={3}
                                navigation
                                pagination={{ clickable: true }}
                                allowTouchMove={true}
                                observer={true}
                                observeParents={true}
                                resizeObserver={true}
                            >
                                {trendingArticles.length > 0 ? (
                                    trendingArticles.map((article, index) => (
                                        <SwiperSlide key={index}>
                                            <div className="article-card h-[90%] p-4 bg-white shadow-md rounded-md">
                                                <h3 className="text-xl font-semibold">{article.title}</h3>
                                                <p>{article.extra_writer}</p>
                                                <p className="text-sm text-gray-600">조회수: {article.hits}</p>
                                                <p className="text-sm text-gray-600">작성일: {article.regDate}</p>
                                            </div>
                                        </SwiperSlide>
                                    ))
                                ) : (
                                    <div>트렌딩 게시물이 없습니다.</div>
                                )}
                            </SwiperWrapper>
                        )
                    )}
                </div>
            </div>

            {/* overlay menu */}
            <OverlayMenu open={menuOpen} onClose={() => setMenuOpen(false)} userEmail={user.email} blogName={user.blogName} />
            <div className="pointer-events-none">
                <div className="fixed right-8 bottom-20 z-50 pointer-events-auto">
                    <Link href="/DiFF/member/profile">
                        <i className="fa-solid fa-power-off text-white text-3xl hover:text-red-500"></i>
                    </Link>
                </div>
                <div className="fixed right-6 bottom-6 z-50 pointer-events-auto">
                    <HamburgerButton open={menuOpen} onClick={() => setMenuOpen(v => !v)} />
                </div>
            </div>
        </div>
    );
}

Page.pageTitle = 'MAIN PAGE';
