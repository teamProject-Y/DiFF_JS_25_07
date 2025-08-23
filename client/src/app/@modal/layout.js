'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

// ★ 폼만 렌더하는 컴포넌트 (아래 3번에서 만듭니다)
import LoginForm from '@/common/loginModal';
import JoinForm from '@/common/joinModal';

export default function ModalLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();

    // 현재 모드: /login → 'login', /join → 'join'
    const mode = useMemo(() => (
        pathname && pathname.endsWith('/login') ? 'login' : 'join'
    ), [pathname]);

    // 슬라이드 방향 관리
    const prevRef = useRef(mode);
    const [dir, setDir] = useState(1); // 1: →, -1: ←
    useEffect(() => {
        const prev = prevRef.current;
        if (prev !== mode) {
            setDir(mode === 'join' ? 1 : -1);
            prevRef.current = mode;
        }
    }, [mode]);

    const callbackUrl = sp?.get('callbackUrl') || '/DiFF/home/main';
    const afterLoginUri = sp?.get('afterLoginUri') || undefined;

    // 검은 패널 위치: join=오른쪽(0), login=왼쪽(-100%)
    const panelX = mode === 'join' ? 0 : '-100%';

    return (
        <>
            {/* overlay */}
            <motion.div
                className="fixed inset-0 z-[100] bg-black/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => router.back()}
            />

            {/* frame */}
            <motion.div
                className="fixed inset-0 z-[101] flex items-center justify-center p-6"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative w-[min(1100px,92vw)] h-[min(640px,78vh)] rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.35)] bg-white">
                    {/* 닫기 */}
                    <button
                        onClick={() => router.back()}
                        className="absolute right-3 top-3 z-20 h-9 w-9 rounded-full bg-black text-white text-lg"
                        aria-label="close"
                    >
                        ×
                    </button>

                    {/* 2컬럼 레이아웃: 내용만 교체 */}
                    <div className="relative grid grid-cols-2 w-full h-full">
                        {/* LEFT 컬럼 */}
                        <div className="relative z-10 flex items-center justify-center">
                            <div className="w-[82%] max-w-[460px]">
                                <AnimatePresence mode="wait" custom={dir}>
                                    {mode === 'join' ? (
                                        <motion.div
                                            key="join-left"
                                            initial={{ x: 40 * dir, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -40 * dir, opacity: 0 }}
                                            transition={{ duration: 0.22 }}
                                        >
                                            <JoinForm />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="login-left"
                                            initial={{ x: 40 * dir, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -40 * dir, opacity: 0 }}
                                            transition={{ duration: 0.22 }}
                                        >
                                            <a
                                                href="/DiFF/member/join"
                                                className="absolute bottom-5 right-5 text-white underline font-semibold"
                                                onClick={(e) => { e.preventDefault(); router.push('/DiFF/member/join'); }}
                                            >
                                                회원가입으로 이동
                                            </a>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* RIGHT 컬럼 */}
                        <div className="relative z-10 flex items-center justify-center">
                            <div className="w-[82%] max-w-[460px]">
                                <AnimatePresence mode="wait" custom={dir}>
                                    {mode === 'login' ? (
                                        <motion.div
                                            key="login-right"
                                            initial={{ x: -40 * dir, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: 40 * dir, opacity: 0 }}
                                            transition={{ duration: 0.22 }}
                                        >

                                            <LoginForm callbackUrl={callbackUrl} afterLoginUriFromPage={afterLoginUri} />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="join-right"
                                            initial={{ x: -40 * dir, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: 40 * dir, opacity: 0 }}
                                            transition={{ duration: 0.22 }}
                                        >
                                            <a
                                                href="/DiFF/member/login"
                                                className="absolute bottom-5 left-5 text-white underline font-semibold"
                                                onClick={(e) => { e.preventDefault(); router.push('/DiFF/member/login'); }}
                                            >
                                                로그인으로 이동
                                            </a>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* 🔳 슬라이딩 블랙 패널 */}
                        <motion.div
                            className="absolute inset-y-0 right-0 w-1/2 bg-black"
                            initial={false}
                            animate={{ x: panelX }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            aria-hidden
                        >
                            <div className="h-full flex items-center justify-center">
                                <svg viewBox="0 0 24 24" className="w-28 h-28 text-white fill-current" aria-hidden="true">
                                    <path d="M10 3a1 1 0 1 0 0 2h7v14h-7a1 1 0 1 0 0 2h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-8z"/>
                                    <path d="M11.707 8.293a1 1 0 0 0-1.414 1.414L12.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L15.414 12l-3.707-3.707z"/>
                                    <path d="M3 11a1 1 0 1 0 0 2h9a1 1 0 1 0 0-2H3z"/>
                                </svg>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* children은 라우팅 유지용(렌더 필요 없음) */}
            <div style={{ display: 'none' }}>{children}</div>
        </>
    );
}
