'use client';

import Link from 'next/link';
import {useEffect, useMemo, useRef, useState} from 'react';
import {MessageCircle, Bell, FileText, ThumbsUp, UserPlus, BookmarkCheck} from "lucide-react";
import styled from 'styled-components';
import {motion, useMotionValue, useTransform} from 'framer-motion';
import {fetchUser} from '@/lib/UserAPI';
import {searchArticles} from "@/lib/ArticleAPI";
import {useRouter} from 'next/navigation';
import {usePathname, useSearchParams} from 'next/navigation';
import {hasUnread, getNotifications, markAllAsRead} from "@/lib/NotificationAPI";
import ModalLayout from "@/app/@modal/layout";

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
    const [mode, setMode] = useState(null);

    const isEditMode = useMemo(() => {
        if (!pathname) return false;
        return pathname.startsWith('/DiFF/article/write') ||
            pathname.startsWith('/DiFF/article/modify');
    }, [pathname]);

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
        setResults([]);
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

    const iconFor = (t = '') => {
        switch (t.toUpperCase()) {
            case 'REPLY':
            case 'COMMENT':
                return <MessageCircle className="h-6 w-6" strokeWidth={2} aria-hidden="true"/>;
            case 'LIKE':
                return <ThumbsUp className="h-6 w-6" strokeWidth={2} aria-hidden="true"/>;
            case 'FOLLOW':
                return <UserPlus className="h-6 w-6" strokeWidth={2} aria-hidden="true"/>;
            case 'DRAFT':
                return <BookmarkCheck className="h-6 w-6" strokeWidth={2} aria-hidden="true"/>;
            case 'ARTICLE':
                return <FileText className="h-6 w-6" strokeWidth={2} aria-hidden="true"/>;
            default:
                return <Bell className="h-6 w-6" strokeWidth={2} aria-hidden="true"/>;
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
                return `/DiFF/article/write?draftId=${n.relId}`;
            case "REPLY":
                return `/DiFF/article/detail?id=${n.relId}`;
            default:
                return "#";
        }
    }

    if (isEditMode) return null;

    return (
        <>
            <HeaderWrap
                className={`
                    ${hide && 'hide'}
                    bg-[${background}] h-[${height}]
                    dark:text-white
                  `}
                style={{backgroundColor: background, height}}
            >
                <div className="pl-4">
                    <Link
                        href="/DiFF/home/main"
                        className="block text-3xl p-4 font-semibold dark:text-neutral-300"
                    >
                        DiFF
                    </Link>
                </div>

                {/* 검색창 */}
                {accessToken && (
                    <form onSubmit={handleSearch} className="relative flex items-center gap-2 rounded-full border overflow-hidden
                    text-neutral-500 bg-white dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-500">
                        <div
                            className="px-3 flex overflow-hidden"
                        >
                            <input
                                type="text"
                                placeholder="Search anything"
                                value={keyword}
                                autoComplete="on"
                                onChange={(e) => setKeyword(e.target.value)}
                                className="p-2 w-64 focus:outline-none dark:bg-neutral-800 dark:placeholder-neutral-500"
                            />
                            <button type="submit">
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </button>
                        </div>
                    </form>
                )}

                <ul className="flex items-center gap-8 text-xl font-semibold pr-8 dark:text-neutral-300">
                    {accessToken ? (
                        <>
                            {/* 알림 */}
                            <li className="relative" ref={dropdownRef}>
                                <button onClick={handleBellClick}
                                        className="bell-button relative">
                                    <svg viewBox="0 0 448 512" className="bell-svg">
                                        <path
                                            d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"></path>
                                    </svg>

                                    {unread && (
                                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"/>
                                    )}
                                </button>

                                {/* 드롭다운 */}
                                {open && (
                                    <div
                                        role="menu"
                                        aria-label="Notifications"
                                        className="absolute right-0 mt-2 w-80 z-50"
                                    >

                                        <span
                                            className="pointer-events-none absolute right-4 -top-1.5 h-3 w-3 rotate-45 rounded-sm z-20
                                                       border border-neutral-200 bg-white
                                                       dark:border-neutral-700 dark:bg-neutral-800"
                                        ></span>

                                        <div
                                            className="rounded-2xl border border-neutral-200 bg-white p-2 shadow z-30
                                                       dark:border-neutral-700 dark:bg-neutral-800"
                                        >

                                            <div className="mb-2 flex items-center justify-between px-2">
                                                  <span
                                                      className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                    Notifications
                                                  </span>
                                                <button
                                                    onClick={() => setOpen(false)}
                                                    className="text-xs rounded-lg border px-2 py-1 transition
                                                               hover:bg-neutral-200 border-neutral-300 text-neutral-600
                                                               dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-950"
                                                >
                                                    Close
                                                </button>
                                            </div>

                                            {/* 리스트 */}
                                            {notifications && notifications.length > 0 ? (
                                                <ul className="max-h-80 overflow-y-auto">
                                                    {notifications.slice(0, 50).map((n) => {
                                                        const link = getNotificationLink(n);
                                                        return (
                                                            <li
                                                                key={n.id}
                                                                onClick={() => (window.location.href = link)}
                                                                className="group flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 transition
                                                                           hover:bg-neutral-100/70 dark:hover:bg-neutral-900/50"
                                                            >
                                                                  <span
                                                                      className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full
                                                                                 border border-neutral-300 text-neutral-500
                                                                                 dark:border-neutral-700 dark:text-neutral-400"
                                                                  >
                                                                    {iconFor(n.type)}
                                                                  </span>

                                                                <div className="min-w-0 flex-1">
                                                                    <div
                                                                        className="truncate text-sm text-neutral-800 dark:text-neutral-300"
                                                                        title={n.message}
                                                                    >
                                                                        {n.message}
                                                                    </div>
                                                                    {n.type && (
                                                                        <div
                                                                            className="mt-0.5 text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                                                                            {n.type === 'ARTICLE' ? 'POST' : n.type}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-400">No notifications</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                            </li>
                        </>
                    )}
                </ul>
            </HeaderWrap>
            <ModalLayout mode={mode} onClose={() => setMode(null)}/>
        </>
    );
}