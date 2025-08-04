// common/header.js

'use client';

import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {fetchUser} from '@/lib/UserAPI';
import styled from 'styled-components';

const HeaderArea = styled.div`
    position: relative;
    width: 100%;
    height: 80px;`

const HeaderWrap = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100%;
    height: 80px;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
    background-color: black;
    display: flex;
    align-items: center;

    &.hide {
        transform: translateY(-80px);
        opacity: 0;
        pointer-events: none;
    }`;

export default function Header() {
    const [user, setUser] = useState({});
    const [accessToken, setAccessToken] = useState(null);

    // 헤더 UI 관련
    const [hide, setHide] = useState(false);

    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY;

            if (currentScroll > lastScrollY.current && currentScroll > 100) {
                setHide(true);
            }
            // 올릴 때 또는 최상단(0)에 도달하면 다시 보이기
            else {
                setHide(false);
            }

            lastScrollY.current = currentScroll;
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        }
    }, []);




    // 토큰 관련
    useEffect(() => {
        if (typeof window !== "undefined") {
            // 소셜
            const url = new URL(window.location.href);
            const urlAccessToken = url.searchParams.get("access_token");
            const urlRefreshToken = url.searchParams.get("refresh_token");
            if (urlAccessToken && urlRefreshToken) {
                localStorage.setItem("accessToken", urlAccessToken);
                localStorage.setItem("refreshToken", urlRefreshToken);
                localStorage.setItem("tokenType", "Bearer");
                window.history.replaceState({}, document.title, url.pathname); // URL 정리
            }

            // 로컬
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
            setAccessToken(null); // 로그아웃 반영
        }
    }

    return (
        <HeaderArea>
            <HeaderWrap className={hide ? 'hide' : ''}>
                <div className="logo pl-4">
                    <Link href="/" className="block text-5xl p-4 text-white">
                        DiFF
                    </Link>
                </div>
                <div className="flex-grow"/>

                <ul className="flex gap-4 text-lg font-bold">
                    {accessToken ? (
                        <>
                            <Link href="/DiFF/member/logout" onClick={handleLogout}>LOGOUT</Link>
                            <Link href="/DiFF/member/myPage">MYPAGE</Link>
                        </>
                    ) : (
                        <>
                            <div className="text-white">
                            <Link href="/DiFF/member/login">LOGIN</Link>
                            &nbsp;
                            &nbsp;
                            <Link href="/DiFF/member/join">JOIN</Link>
                            </div>
                        </>
                    )}
                </ul>
            </HeaderWrap>
        </HeaderArea>
    )
}