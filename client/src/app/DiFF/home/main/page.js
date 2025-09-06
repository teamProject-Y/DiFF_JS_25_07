// pages/usr/home/page.js
'use client';

import {useEffect, useRef, useState} from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {useRouter} from "next/navigation"

import {trendingArticle} from '@/lib/ArticleAPI';

// 동적 import (Swiper)
import {Navigation, Pagination, A11y, Autoplay} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const SwiperWrapper = dynamic(() => import('swiper/react').then(mod => mod.Swiper), {ssr: false});
const SwiperSlide = dynamic(() => import('swiper/react').then(mod => mod.SwiperSlide), {ssr: false});
SwiperWrapper.displayName = 'SwiperWrapper';
SwiperSlide.displayName = 'SwiperSlide';

// 외부 컴포넌트
const OverlayMenu = dynamic(() => import('@/common/overlayMenu'), {ssr: false});
const HamburgerButton = dynamic(() => import('@/common/hamMenu'), {ssr: false});

// background
const sections = [
    {id: 'terminal', color: '#161616'},
    {id: 'docs', color: '#fafafa'},
    {id: 'trending', color: '#fafafa'}
];

// 로그인 분기용: 만료/리프레시
function isExpired(token, skewMs = 30000) {
    try {
        const payload = JSON.parse(atob((token?.split?.('.')[1] || '')));
        if (!payload?.exp) return false;
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
            headers: {'REFRESH_TOKEN': rt},
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
            if (t && !isExpired(t)) {
                setLoggedIn(true);
                return;
            }
            const ok = await tryRefresh();
            setLoggedIn(ok);
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
    return {mounted, loggedIn};
}

// JWT payload 파싱
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

// 분기용 컴포넌트 import
import BeforeMainPage from './BeforeMainPage';
import AfterMainPage from './AfterMainPage';
import removeMd from "remove-markdown";
import BeforeExplain from "@/common/anime/beforeExplain";

function extractFirstImage(body) {
    if (!body) return null;
    const match = body.match(/!\[[^\]]*\]\(([^)]+)\)/);
    return match ? match[1] : null;
}

export default function Page() {
    const inputRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [accessToken, setAccessToken] = useState(null);
    const [user, setUser] = useState({email: '', blogName: ''});
    const [trendingArticles, setTrendingArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    const {mounted, loggedIn} = useMountedLogin();
    const router = useRouter();

    const [isClient, setIsClient] = useState(false);

    const [bgColor, setBgColor] = useState(sections[0].color);
    const sectionRefs = useRef([]);

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
                setUser({email: userInfo.memberEmail, blogName: userInfo.blogName});
            }
        }
    }, []);

     useEffect(() => {
           if (!mounted || loggedIn) return;
           const scroller = document.getElementById('pageScroll');
           if (!scroller || sectionRefs.current.length === 0) return;
           if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
           scroller.scrollTo({ top: 0, behavior: 'auto' });

               const io = new IntersectionObserver((entries) => {
                 let best = { ratio: 0, id: null };
                 entries.forEach(e => {
                       if (e.isIntersecting && e.intersectionRatio > best.ratio) {
                             best = { ratio: e.intersectionRatio, id: e.target.id };
                           }
                     });
                 if (best.id) {
                       const idx = sections.findIndex(s => s.id === best.id);
                       if (idx !== -1) setBgColor(sections[idx].color);
                     }
               }, { root: scroller, threshold: [0.25, 0.5, 0.75, 1] });

               sectionRefs.current.forEach(el => el && io.observe(el));
           return () => io.disconnect();
         }, [mounted, loggedIn]);


    if (!mounted) return null;

    if (loggedIn) {
        return <AfterMainPage me={user} trendingArticles={trendingArticles}/>;
    }

    // 로그인 전 화면
    return (
        <div
            id="pageScroll"
            data-scroll-root
            className="w-full transition-colors duration-700 h-screen overflow-y-scroll overscroll-none snap-y snap-proximity scroll-smooth"
            style={{backgroundColor: bgColor}}
        >
            <div id="terminal" className="is-dark-bg h-screen w-full pt-20 snap-start dark:is-light-bg"
                 ref={el => sectionRefs.current[0] = el}>
                <BeforeMainPage/>
            </div>

            <section id="docs" className="pin-section is-light-bg w-full snap-start min-h-screen pt-20 dark:is-dark-bg"
                     ref={el => sectionRefs.current[1] = el}>
                <style jsx>{`#docs, #docs * { transition: none !important; }`}</style>
                <BeforeExplain/>
            </section>

            {/* trending */}
            <div id="trending"
                 className="is-light-bg w-full h-screen snap-start bg-white px-20 pt-20 dark:is-dark-bg dark:bg-black"
                 ref={el => sectionRefs.current[2] = el}>
                <div className="text-3xl text-black font-bold">TRENDING</div>
                <div className="article-slider h-2/3 w-full mt-8 flex relative">
                    <div className="flex absolute right-0 -top-16  font-extralight text-3xl text-neutral-500 z-10">
                        <button
                            className="custom-prev rounded-full m-2 w-10 h-10 flex items-center justify-center bg-transparent hover:bg-neutral-800 hover:text-white transition duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8">
                                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1" fill="none"
                                      strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <button
                            className="custom-next rounded-full  m-2 w-10 h-10 flex items-center justify-center bg-transparent hover:bg-neutral-800 hover:text-white transition duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8">
                                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1" fill="none"
                                      strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>

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
                                spaceBetween={30}
                                loop={true}
                                autoplay={{delay: 3000}}
                                slidesPerView={4}
                                navigation={{
                                    prevEl: ".custom-prev",
                                    nextEl: ".custom-next",
                                }}
                                pagination={{clickable: true}}
                                allowTouchMove={true}
                                observer={true}
                                observeParents={true}
                                resizeObserver={true}
                            >
                                {trendingArticles.length > 0 ? (
                                    trendingArticles.slice(0, 10).map((article, index) => {
                                        const imgSrc = extractFirstImage(article.body);
                                        return (
                                            <SwiperSlide key={article.id ?? index}>
                                                {/*<Link href={`/DiFF/article/detail?id=${article.id}`}>*/}
                                                <div
                                                    className="article-card h-[90%] bg-white shadow-md rounded-b-lg overflow-hidden cursor-pointer hover:shadow-lg transition"
                                                    onClick={() => router.push(`/DiFF/article/detail?id=${article.id}`)}
                                                    role="link"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && router.push(`/DiFF/article/detail?id=${article.id}`)}
                                                >
                                                    <div className="h-1/2 w-full bg-gray-200 flex items-center justify-center">
                                                        {imgSrc ? (
                                                            <img
                                                                src={imgSrc}
                                                                alt="thumbnail"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-400">No Image</span>
                                                        )}
                                                    </div>
                                                    <div className="h-1/2 p-5 flex flex-col">
                                                        <h3 className="text-xl font-semibold clamp-1 mb-2">{article.title}</h3>
                                                        <p className="clamp-3 text-sm text-gray-600">
                                                            {article.body ? removeMd(article.body) : ""}
                                                        </p>
                                                        <div className="flex-grow"></div>
                                                        <hr/>
                                                        <div className="text-sm flex justify-between mt-3">
                                                            <div>by {article.extra__writer ? (
                                                                <Link
                                                                    href={`/DiFF/member/profile?nickName=${encodeURIComponent(article.extra__writer)}`}
                                                                    className="hover:underline hover:text-black cursor-pointer font-bold"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {article.extra__writer}
                                                                </Link>
                                                            ) : (
                                                                "Unknown"
                                                            )} · {new Date(article.regDate).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric"
                                                            })}</div>
                                                            <div className="text-sm text-gray-600">
                                                                <i className="fa-solid fa-heart"></i> {article.extra__sumReaction}
                                                                &nbsp;&nbsp;&nbsp;&nbsp;
                                                                <i className="fa-solid fa-comments"></i> {article.extra__sumReplies}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/*</Link>*/}
                                            </SwiperSlide>
                                        );
                                    })
                                ) : (
                                    <div>트렌딩 게시물이 없습니다.</div>
                                )}
                            </SwiperWrapper>
                        )
                    )}
                </div>
            </div>

            <br/>
            <br/>
            <br/>
            <br/>
            <br/>

            {/* toggle menu */}
            <OverlayMenu open={menuOpen} onClose={() => setMenuOpen(false)} userEmail={user.email}
                         blogName={user.blogName}/>
            <div className="pointer-events-none">
                <div className="fixed right-8 bottom-20 z-50 pointer-events-auto">
                    <Link href="/DiFF/member/profile">
                        <i className="fa-solid fa-power-off text-white text-3xl hover:text-red-500"></i>
                    </Link>
                </div>
                <div className="fixed right-6 bottom-6 z-50 pointer-events-auto">
                    <HamburgerButton open={menuOpen} onClick={() => setMenuOpen(v => !v)}/>
                </div>
            </div>
        </div>
    );
}

Page.pageTitle = 'MAIN PAGE';