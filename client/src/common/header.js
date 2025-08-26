'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { fetchUser } from '@/lib/UserAPI';

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

    // ▲ 모션값
    const y = useMotionValue(0);
    const background = useTransform(y, [0, 100], ['rgba(0,183,255,0)', 'rgba(0,183,255,1)']);
    const height     = useTransform(y, [0, 100], [120, 60]);

    // ▲ 스크롤 루트 자동 탐지 + 라우트 전환 시 재연결
    // src/common/header.js (핵심 useEffect만)
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

    return (
        <HeaderWrap className={`
                        ${hide ? 'hide' : ''}
                        `}
                    style={{ backgroundColor: background, height }}>
            <div className="pl-4">
                <Link href="/DiFF/home/main" className="block text-3xl p-4 font-semibold">DiFF</Link>
            </div>
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
