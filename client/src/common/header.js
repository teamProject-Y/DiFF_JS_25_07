'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { fetchUser } from '@/lib/UserAPI';
import {searchArticles} from "@/lib/ArticleAPI";
import { useRouter } from 'next/navigation';

const HeaderWrap = styled.div `
width: 100%; 
position: fixed; 
top: 0; 
right: 0; 
left: 0; 
z-index: 100; 
display: flex; 
flex-direction: row; 
align-items: center; 
justify-content: space-between; 
padding: 0 24px; 
font-weight: 700; font-size: 13px; 
letter-spacing: 0.02rem; 
backdrop-filter: blur(10px); 
-webkit-backdrop-filter: blur(10px); 
transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s; 
will-change: transform, height, background-color; 
&.hide { transform: translateY(-100%); 
opacity: 0; 
pointer-events: none; }`
;

export default function Header() {
    const [user, setUser] = useState({});
    const [accessToken, setAccessToken] = useState(null);
    const [hide, setHide] = useState(false);

    const y = useMotionValue(0);
    const background = useTransform(y, [0, 100], ['rgba(0,183,255,0)', 'rgba(0,183,255,1)']);
    const height     = useTransform(y, [0, 100], [120, 60]);
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const isScrollable = (el) => {
            if (!el || el === window) return false;
            const cs = getComputedStyle(el);
            return /(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight;
        };

        const findRoot = () =>
            document.getElementById('pageScroll') ||                 // 페이지가 우선
            document.getElementById('appScroll')  ||                 // 레이아웃 래퍼
            Array.from(document.querySelectorAll('*')).find(isScrollable) ||
            window;

        let target = null;
        let last = 0;

        const getTop = () => (target === window ? window.scrollY : target.scrollTop);

        const onScroll = () => {
            const cur = getTop();
            y.set(cur);                      // 배경/높이 보간
            setHide(cur > last && cur > 60); // 내릴 때 숨김
            last = cur;
        };

        const retarget = (next) => {
            if (!next) next = window;
            if (target === next) return;
            target?.removeEventListener?.('scroll', onScroll);
            target = next;
            last = getTop();
            y.set(last);
            target.addEventListener('scroll', onScroll, { passive: true });
        };

        // 최초 연결
        retarget(findRoot());

        // DOM/라우트 변경 시 새 루트로 갈아타기
        const mo = new MutationObserver(() => {
            const next = findRoot();
            if (next !== target) retarget(next);
            if (target !== window && !document.contains(target)) retarget(window);
        });
        mo.observe(document.body, { childList: true, subtree: true, attributes: true });

        return () => {
            target?.removeEventListener?.('scroll', onScroll);
            mo.disconnect();
        };
    }, [y]);


    // ▼ 토큰/유저 로직 (그대로)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        const a = url.searchParams.get('access_token');
        const r = url.searchParams.get('refresh_token');
        if (a && r) {
            localStorage.setItem('accessToken', a);
            localStorage.setItem('refreshToken', r);
            localStorage.setItem('tokenType', 'Bearer');
            window.history.replaceState({}, document.title, url.pathname);
        }
        const sync = () => {
            const token = localStorage.getItem('accessToken');
            setAccessToken(token);
            if (token) fetchUser().then(setUser).catch(console.log);
            else setUser({});
        };
        sync();
        const handler = () => sync();
        window.addEventListener('auth-changed', handler);
        window.addEventListener('storage', handler);
        return () => {
            window.removeEventListener('auth-changed', handler);
            window.removeEventListener('storage', handler);
        };
    }, []);

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.clear();
            setAccessToken(null);
            window.dispatchEvent(new Event('auth-changed'));
        }
    };

    useEffect(() => {
        if (!keyword.trim()) {
            setResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const res = await searchArticles(keyword);
                if (res?.resultCode?.startsWith('S-')) {
                    setResults(res.data1 || []);
                } else {
                    setResults([]);
                }
            } catch (err) {
                console.error('검색 실패:', err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [keyword]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!keyword.trim()) return;
        router.push(`/DiFF/article/search?keyword=${encodeURIComponent(keyword)}`);
        setResults([]); // 드롭다운 닫기
    };
    return (
        <HeaderWrap className={`
                        ${hide ? 'hide' : ''}
                        `}
                    style={{ backgroundColor: background, height }}>

            <div className="pl-4">
                <Link href="/DiFF/home/main" className="block text-3xl p-4 font-semibold">DiFF</Link>
            </div>

            {/* ✅ 검색창 */}
            <form onSubmit={handleSearch} className="relative flex items-center gap-2">
                <input
                    type="text"
                    placeholder="검색 (닉네임·제목·내용)"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm w-64 focus:outline-none"
                />
                <button type="submit" className="px-3 py-1 bg-black text-white rounded-md">
                    검색
                </button>

                {/* 🔽 드롭다운 결과 */}
                {keyword && results.length > 0 && (
                    <div className="absolute top-full mt-1 bg-white border rounded-md shadow-lg w-64 max-h-60 overflow-y-auto z-50">
                        {loading ? (
                            <p className="p-2 text-sm text-gray-500">검색 중...</p>
                        ) : (
                            <ul>
                                {results.map((a) => (
                                    <li key={a.id}>
                                        <Link
                                            href={`/DiFF/article/detail?id=${a.id}`}
                                            className="block px-3 py-2 hover:bg-gray-100"
                                            onClick={() => setKeyword('')}
                                        >
                                            <span className="font-semibold">{a.title}</span>
                                            <p className="text-xs text-gray-600">by {a.nickName}</p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </form>

            <ul className="flex gap-8 text-xl font-semibold pr-8">
                {accessToken ? (
                    <>
                        <li><i className="fa-solid fa-bell" /></li>
                        <li><Link href="/DiFF/member/logout" onClick={handleLogout}>LOGOUT</Link></li>
                        <li><Link href="/DiFF/member/profile">MYPAGE</Link></li>
                    </>
                ) : (
                    <>
                        <li><Link href="/DiFF/member/login" scroll={false} prefetch={false}>LOGIN</Link></li>
                        <li><Link href="/DiFF/member/join"  scroll={false} prefetch={false}>JOIN</Link></li>
                    </>
                )}
            </ul>
        </HeaderWrap>
    );
}
