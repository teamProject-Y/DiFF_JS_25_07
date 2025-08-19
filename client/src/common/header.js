'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { fetchUser } from '@/lib/UserAPI';
import styled from 'styled-components';

const HeaderWrap = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100%;
    height: 55px;

    /* 부드러운 전환 */
    transition:
            transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
            opacity 0.3s,
            background-color 0.3s,
            backdrop-filter 0.3s;

    /* 반투명 + 유리 효과 */
    //background: rgba(255, 255, 255, 0.35);      /* #111 에서 55% 불투명 */
    //backdrop-filter: blur(8px) saturate(140%);
    //-webkit-backdrop-filter: blur(8px) saturate(140%);

    /* 살짝 경계감 주고 그림자 */
    border-bottom: 1px solid #c1c1c1;

    display: flex;
    align-items: center;

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

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            // 아래로 내릴 때만 hide
            if (currentScroll > lastScrollY.current && currentScroll > 60) {
                setHide(true);
            } else {
                setHide(false);
            }
            lastScrollY.current = currentScroll;
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
                <Link href="/DiFF/home/main" className="block text-2xl p-2 text-black font-bold">
                    DiFF
                </Link>
            </div>
            <div className="flex-grow" />
            <ul className="flex gap-8 text-lg font-bold pr-8">
                {accessToken ? (
                    <>
                        <li>
                            <Link href="/DiFF/member/logout" onClick={handleLogout}>LOGOUT</Link>
                        </li>
                        <li>
                            <Link href="/DiFF/member/myPage">MYPAGE</Link>
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
