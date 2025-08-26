'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
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

    color: rgba(25, 25, 200, 1);
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
    const y = useMotionValue(0);
    const background = useTransform(y, [0,100], ['rgba(0,183,255,0)', 'rgba(0,183,255,1)']);
    const height     = useTransform(y, [0,100], [120, 60]);

    /** 아래로 스크롤 시 숨김 */
    // Header.jsx 안에서 기존 window-only onScroll effect 를 지우고 이걸로 교체
    useEffect(() => {
        const getEl = () => document.getElementById('pageScroll');

        let target = window;            // 현재 리스너가 붙어있는 대상 (window 또는 엘리먼트)
        let last = 0;

        const getTop = () =>
            target instanceof Window ? window.scrollY : (target?.scrollTop ?? 0);

        const onScroll = () => {
            const cur = getTop();
            // 아래로 스크롤 중 + 어느 정도 내려왔으면 숨김
            setHide(cur > last && cur > 60);
            last = cur;
        };

        const attach = (elOrWin) => {
            // 현재 타깃과 같으면 패스
            if (target === elOrWin) return;
            // 이전 타깃 정리
            if (target) target.removeEventListener?.('scroll', onScroll);
            target = elOrWin || window;
            last = getTop(); // 기준점 리셋
            target.addEventListener('scroll', onScroll, { passive: true });
        };

        // 1) 처음엔 window에 붙여둠
        attach(window);

        // 2) #pageScroll 나타나면 갈아타기 (route 전환/동적 렌더링 대비)
        const mo = new MutationObserver(() => {
            const el = getEl();
            if (el) attach(el);
        });
        mo.observe(document.body, { childList: true, subtree: true });

        // 혹시 이미 있을 수도 있으니 한 번 즉시 체크
        const first = getEl();
        if (first) attach(first);

        y.set(getTop());

        return () => {
            target?.removeEventListener?.('scroll', onScroll);
            mo.disconnect();
        };

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

            // ✅ 초기 상태 동기화
            const token = localStorage.getItem('accessToken');
            setAccessToken(token);
            if (token) {
                fetchUser()
                    .then(setUser)
                    .catch(console.log);
            }

            // ✅ auth-changed 이벤트 핸들러 등록
            const handler = () => {
                const newToken = localStorage.getItem('accessToken');
                setAccessToken(newToken);
                if (newToken) {
                    fetchUser()
                        .then(setUser)
                        .catch(console.log);
                } else {
                    setUser({});
                }
            };
            window.addEventListener('auth-changed', handler);

            return () => window.removeEventListener('auth-changed', handler);
        }
    }, []);

    const handleLogout = async () => {
        if (typeof window !== "undefined") {
            localStorage.clear();
            setAccessToken(null);
        }
    }

    return (
        <HeaderWrap className={hide ? 'hide' : ''} style={{ backgroundColor: background, height }} >
            <div className="logo pl-4">
                <Link href="/DiFF/home/main" className="block text-3xl p-4 text-red-400 font-semibold">
                    DiFF
                </Link>
            </div>
            <div className="flex-grow" />
            <ul className="flex gap-8 text-xl font-semibold pr-8 text-red-400">
                {accessToken ? (
                    <>
                        <li>
                            <i className="fa-solid fa-bell"></i>
                        </li>
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
                            <Link href="/DiFF/member/login" scroll={false} prefetch={false}>LOGIN</Link>
                        </li>
                        <li>
                            <Link href="/DiFF/member/join" scroll={false} prefetch={false}>JOIN</Link>
                        </li>
                    </>
                )}
            </ul>
        </HeaderWrap>
    );
}
