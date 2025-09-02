'use client';

import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {motion, useMotionValue, useTransform} from 'framer-motion';
import {fetchUser} from '@/lib/UserAPI';
import {searchArticles} from "@/lib/ArticleAPI";
import {useRouter} from 'next/navigation';
import {usePathname, useSearchParams} from 'next/navigation';
import { hasUnread, getNotifications, markAllAsRead } from "@/lib/NotificationAPI";

const HeaderWrap = styled.div`
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
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.02rem;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
    will-change: transform, height, background-color;

    &.hide {
        transform: translateY(-100%);
        opacity: 0;
        pointer-events: none;
    }`
;

export default function Header() {
    const [user, setUser] = useState({});
    const [accessToken, setAccessToken] = useState(null);
    const [hide, setHide] = useState(false);

    const y = useMotionValue(0);
    const background = useTransform(y, [0, 100], ['rgba(0,183,255,0)', 'rgba(0,183,255,1)']);
    const height = useTransform(y, [0, 100], [120, 60]);
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [unread, setUnread] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const isScrollable = (el) => {
            if (!el || el === window) return false;
            const cs = getComputedStyle(el);
            return /(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight;
        };

        const findRoot = () =>
            document.getElementById('pageScroll') ||                 // 페이지가 우선
            document.getElementById('appScroll') ||                 // 레이아웃 래퍼
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
            target.addEventListener('scroll', onScroll, {passive: true});
        };

        // 최초 연결
        retarget(findRoot());

        // DOM/라우트 변경 시 새 루트로 갈아타기
        const mo = new MutationObserver(() => {
            const next = findRoot();
            if (next !== target) retarget(next);
            if (target !== window && !document.contains(target)) retarget(window);
        });
        mo.observe(document.body, {childList: true, subtree: true, attributes: true});

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

    useEffect(() => {
        // 검색 페이지가 아니면 비움 → placeholder 노출
        if (!pathname?.startsWith('/DiFF/article/search')) {
            setKeyword('');
            setResults([]);
            return;
        }
        // 검색 페이지면 URL 쿼리(keyword)로 입력창 채움 (없으면 빈 값)
        const q = searchParams.get('keyword') ?? '';
        setKeyword(q);
    }, [pathname, searchParams]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!keyword.trim()) return;
        router.push(`/DiFF/article/search?keyword=${encodeURIComponent(keyword)}`);
        setResults([]); // 드롭다운 닫기
    };

    useEffect(() => {
        if (!accessToken) return;
        hasUnread()
            .then(setUnread)
            .catch(err => console.error("알림 체크 실패:", err));
    }, [accessToken]);

    const handleBellClick = async () => {
        if (!open) {
            try {
                const list = await getNotifications();
                setNotifications(list);
                await markAllAsRead();  // 읽음 처리
                setUnread(false);       // 빨간 점 제거
            } catch (err) {
                console.error("알림 목록 가져오기 실패:", err);
            }
        }
        setOpen(!open);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <HeaderWrap className={`
                        ${hide ? 'hide' : ''}
                        `}
                    style={{backgroundColor: background, height}}>

            <div className="pl-4">
                <Link href="/DiFF/home/main" className="block text-3xl p-4 font-semibold">DiFF</Link>
            </div>

            {/* 검색창 */}
            {accessToken &&
                <form onSubmit={handleSearch} className="relative flex items-center gap-2">
                    <div className="px-3 flex rounded-full border text-neutral-500 overflow-hidden">
                        <input
                            type="text"
                            placeholder="Search anything"
                            value={keyword}
                            autoComplete="on"
                            onChange={(e) => setKeyword(e.target.value)}
                            className="p-2 w-64 focus:outline-none"
                        />
                        <button type="submit" className="">
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </div>
                </form>
            }

            <ul className="flex gap-8 text-xl font-semibold pr-8">
                {accessToken ? (
                    <>
                        <li className="relative" ref={dropdownRef}>
                            <button onClick={handleBellClick} className="relative">
                                <i className="fa-solid fa-bell"></i>
                                {unread && (
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>

                            {open && (
                                <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md p-2 z-50">
                                    {notifications.length > 0 ? (
                                        notifications.map((n) => (
                                            <div key={n.id} className="border-b py-2 text-sm">
                                                <span className="font-medium">{n.type}</span> - {n.message}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">알림이 없습니다.</p>
                                    )}
                                </div>
                            )}
                        </li>

                        <li><Link href="/DiFF/member/logout" onClick={handleLogout}>LOGOUT</Link></li>
                        <li><Link href="/DiFF/member/profile">MYPAGE</Link></li>
                    </>
                ) : (
                    <>
                        <li><Link href="/DiFF/member/login" scroll={false} prefetch={false}>LOGIN</Link></li>
                        <li><Link href="/DiFF/member/join" scroll={false} prefetch={false}>JOIN</Link></li>
                    </>
                )}
            </ul>
        </HeaderWrap>
    );
}