'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';
import { fetchUser } from '@/lib/UserAPI';

const HeaderWrap = styled.div`
    width: 100%;
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 100;

    /* 높이/배경은 motion.style에서 제어 */
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;

    padding: 0 24px;

    color: rgba(255, 255, 255, 1);
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.02rem;

    /* 글래스 느낌 (원하면 유지/삭제) */
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);

    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
    will-change: transform, height, background-color;

    &.hide {
        transform: translateY(-100%);
        opacity: 0;
        pointer-events: none;
    }
`;

export default function Header() {
    const [user, setUser] = useState({});
    const [accessToken, setAccessToken] = useState(null);
    const [hide, setHide] = useState(false);
    const lastScrollY = useRef(0);

    /** 스크롤에 따른 배경/높이 보간 (SCSS의 rgba(0,183,255,0) → 1) */
    const { scrollY } = useScroll();
    const background = useTransform(
        scrollY,
        [0, 100],
        ['rgba(0, 183, 255, 0)', 'rgba(0, 183, 255, 1)']
    );
    const height = useTransform(scrollY, [0, 100], [120, 60]);

    /** 아래로 스크롤 시 숨김 */
    useEffect(() => {
        const onScroll = () => {
            const cur = window.scrollY;
            if (cur > lastScrollY.current && cur > 60) setHide(true);
            else setHide(false);
            lastScrollY.current = cur;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // 토큰 관련
    useEffect(() => {
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            const urlAccessToken = url.searchParams.get("access_token");
            const urlRefreshToken = url.searchParams.get("refresh_token");
            if (urlAccessToken && urlRefreshToken) {
                localStorage.setItem("accessToken", urlAccessToken);
                localStorage.setItem("refreshToken", urlRefreshToken);
                localStorage.setItem("tokenType", "Bearer");
                window.history.replaceState({}, document.title, url.pathname);
            }
            const token = localStorage.getItem('accessToken');
            setAccessToken(token);
            if (token) {
                fetchUser()
                    .then(setUser)
                    .catch(console.log);
            }
        }
    }, []);

    const handleLogout = async () => {
        if (typeof window !== "undefined") {
            localStorage.clear();
            setAccessToken(null);
        }
    }

    return (
        <HeaderWrap className={hide ? 'hide' : ''}>
            <div className="logo pl-4">
                <Link href="/DiFF/home/main" className="block text-4xl p-4 text-red-400 font-bold">
                    DiFF
                </Link>
            </div>
            <div className="flex-grow" />
            <ul className="flex gap-8 text-xl font-bold pr-8 text-red-400">
                {accessToken ? (
                    <>
                        <li>
                            <Link href="/DiFF/member/logout" onClick={handleLogout}>LOGOUT</Link>
                        </li>
                        <li>
                            <Link href="/DiFF/member/profile">MYPAGE</Link>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link href="/DiFF/member/login">List</Link>
                        </li>
                        <li>
                            <Link href="/DiFF/member/login">LOGIN</Link>
                        </li>
                        <li>
                            <Link href="/DiFF/member/join">JOIN</Link>
                        </li>
                    </>
                )}
            </ul>
        </HeaderWrap>
    );
}
