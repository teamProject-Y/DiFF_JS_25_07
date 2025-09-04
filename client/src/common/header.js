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
    const background = useTransform(y, [0, 100], ['rgba(0,183,255,0)', 'rgba(0,0,0,0)']);
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
            document.getElementById('pageScroll') ||
            document.getElementById('appScroll') ||
            Array.from(document.querySelectorAll('*')).find(isScrollable) ||
            window;

        let target = null;
        let last = 0;

        const getTop = () => (target === window ? window.scrollY : target.scrollTop);

        const onScroll = () => {
            const cur = getTop();
            y.set(cur);
            setHide(cur > last && cur > 60);
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

        retarget(findRoot());

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
        if (!pathname?.startsWith('/DiFF/article/search')) {
            setKeyword('');
            setResults([]);
            return;
        }
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
                await markAllAsRead();
                setUnread(false);
            } catch (err) {
                console.error("알림 목록 가져오기 실패:", err);
            }
        }
        setOpen(!open);
    };

    const iconFor = (t) => {
        switch ((t || '').toLowerCase()) {
            case 'comment': return 'fa-regular fa-comment';
            case 'like':    return 'fa-regular fa-thumbs-up';
            case 'follow':  return 'fa-solid fa-user-plus';
            case 'system':  return 'fa-regular fa-bell';
            case 'draft':  return 'fa-solid fa-pen';
            default:        return 'fa-regular fa-bell';
        }
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

    function getNotificationLink(n) {
        switch (n.type) {
            case "ARTICLE":
                return `/DiFF/article/detail?id=${n.relId}`;
            case "FOLLOW":
                return `/DiFF/member/profile?nickName=${(n.extra__nickName)}`;
            case "DRAFT":
                return `/DiFF/draft/detail?id=${n.relId}`;
            default:
                return "#";
        }
    }



    return (
        <HeaderWrap className={`
                        ${hide ? 'hide' : ''}
                        bg-[${background}] h-[${height}]
                        dark:text-white
                        `}
        >

            <div className="pl-4">
                <Link href="/DiFF/home/main" className="block text-3xl p-4 font-semibold dark:text-neutral-300">DiFF</Link>
            </div>

            {/* 검색창 */}
            {accessToken &&
                <form onSubmit={handleSearch} className="relative flex items-center gap-2">
                    <div className="px-3 flex rounded-full border overflow-hidden text-neutral-500
                     dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-500">
                        <input
                            type="text"
                            placeholder="Search anything"
                            value={keyword}
                            autoComplete="on"
                            onChange={(e) => setKeyword(e.target.value)}
                            className="p-2 w-64 focus:outline-none dark:bg-neutral-800 dark:placeholder-neutral-500"
                        />
                        <button type="submit" className="">
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </div>
                </form>
            }

            <ul className="flex items-center gap-8 text-xl font-semibold pr-8 dark:text-neutral-300">
                {accessToken ? (
                    <>
                        <li className="relative" ref={dropdownRef}>

                            <button onClick={handleBellClick} className="relative rounded-full p-2 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60">
                                <i className="fa-solid fa-bell" />
                                {unread && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />}
                            </button>

                            {/* 드롭다운 */}
                            {open && (
                                <div
                                    role="menu"
                                    aria-label="Notifications"
                                    className="absolute right-0 mt-2 w-80 z-50"
                                >
                                    {/* 말풍선 꼬리 */}
                                    <span className="pointer-events-none absolute right-4 -top-1.5 h-3 w-3 rotate-45 rounded-sm
                                       border border-neutral-200 bg-white/80
                                       dark:border-neutral-700 dark:bg-neutral-950/40"></span>

                                    {/* 카드 */}
                                    <div className="rounded-2xl border border-neutral-200 bg-white/80 p-2 shadow-lg backdrop-blur
                                                    dark:border-neutral-700 dark:bg-neutral-950/40">
                                        {/* 헤더 */}
                                        <div className="mb-1 flex items-center justify-between px-2">
                                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Notifications</span>
                                            <button
                                                onClick={() => setOpen(false)}
                                                className="text-xs rounded-lg border border-neutral-300 px-2 py-1 text-neutral-600 transition
                                                            hover:bg-neutral-100/70 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900/60"
                                            >
                                                Close
                                            </button>
                                        </div>

                                        {/* 리스트 */}
                                        {notifications && notifications.length > 0 ? (
                                            <ul className="max-h-80 overflow-y-auto">
                                                {notifications.map((n) => {
                                                    console.log("📌 알림 데이터:", n);
                                                    const link = getNotificationLink(n);

                                                    return (
                                                        <li
                                                            key={n.id}
                                                            onClick={() => (window.location.href = link)}
                                                            className="group flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 transition
                                                                       hover:bg-neutral-100/70 dark:hover:bg-neutral-900/50"
                                                                                                            >
                                                            <span
                                                                className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                                                                         border border-neutral-300 bg-neutral-100 text-neutral-600
                                                                         dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                                                            >
                                                              <i className={iconFor(n.type)} aria-hidden />
                                                            </span>

                                                            <div className="min-w-0 flex-1">
                                                                <div
                                                                    className="truncate text-sm text-neutral-800 dark:text-neutral-200"
                                                                    title={n.message}
                                                                >
                                                                    {n.message}
                                                                </div>
                                                                {n.type && (
                                                                    <div className="mt-0.5 text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                                                        {n.type}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        ) : (
                                            <div className="px-3 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                                                No notifications yet.
                                            </div>
                                        )}
                                    </div>
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