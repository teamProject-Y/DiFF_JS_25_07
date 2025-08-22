'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { login } from '@/lib/UserAPI';

export default function LoginModal({ open, onClose, callbackUrl = '/DiFF/home/main', afterLoginUriFromPage }) {
    // ===== 폼 상태 =====
    const [values, setValues] = useState({ email: '', loginPw: '' });
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const afterLoginUri = useMemo(() => {
        if (afterLoginUriFromPage) return afterLoginUriFromPage;
        if (typeof window !== 'undefined') return window.location.pathname + window.location.search;
        return callbackUrl;
    }, [afterLoginUriFromPage, callbackUrl]);

    const handleChange = (e) => setValues(v => ({ ...v, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!values.email || !values.loginPw) {
            setError('이메일와 비밀번호를 입력하세요.');
            return;
        }
        try {
            setSubmitting(true);
            const result = await login(values);
            if (result.resultCode !== 'S-1') {
                setError(result.msg || '로그인 실패');
                setSubmitting(false);
                return;
            }
            if (!result.data1) {
                setError('토큰 없음');
                setSubmitting(false);
                return;
            }
            localStorage.setItem('tokenType', result.dataName || 'Bearer');
            localStorage.setItem('accessToken', result.data1);
            localStorage.setItem('refreshToken', result.data2 || '');
            window.dispatchEvent(new Event('auth-changed'));
            window.location.replace(afterLoginUri || callbackUrl);
        } catch (err) {
            console.error('로그인 axios error', err, err?.response);
            setError('로그인 실패: 아이디/비밀번호를 확인하세요.');
            setSubmitting(false);
        }
    };

    // ===== 애니메이션 컨트롤 =====
    const logoCtrl  = useAnimationControls(); // 로딩(문자) 폴딩
    const loadCtrl  = useAnimationControls(); // 로딩 레이어 페이드
    const coverCtrl = useAnimationControls(); // 커버 마스크 열림
    const formCtrl  = useAnimationControls(); // 폼 페이드인

    // Variants
    const letterVariants = {
        initial: { rotateX: 0, opacity: 1 },
        fold:    { rotateX: 90, opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } },
    };
    const logoWrapperVariants = {
        initial: {},
        fold: { transition: { staggerChildren: 0.06 } },
    };
    const loadingLayerVariants = {
        shown: { opacity: 1 },
        hidden:{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    };

    // 라운드 유지: translate 대신 clip-path로 왼→오 열기
    const coverVariants = {
        initial: { clipPath: 'inset(0% 0% 0% 0% round 24px)' },          // 전부 덮힘
        slide:   {
            clipPath: 'inset(0% 0% 0% 100% round 24px)',                   // 왼쪽부터 100% 열림
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
            transitionEnd: { display: 'none', visibility: 'hidden' },
        },
    };
    const formVariants = {
        hidden: { opacity: 0, y: 8 },
        show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    };

    // 모달 열릴 때마다 내부 시퀀스 실행
    useEffect(() => {
        if (!open) return;
        (async () => {
            await logoCtrl.set('initial');
            await loadCtrl.set('shown');
            await coverCtrl.set('initial');
            await formCtrl.set('hidden');

            await new Promise(r => setTimeout(r, 1300));
            await logoCtrl.start('fold');
            await loadCtrl.start('hidden');

            await new Promise(r => setTimeout(r, 200));
            await coverCtrl.start('slide');

            await new Promise(r => setTimeout(r, 300));
            await formCtrl.start('show');
        })();
    }, [open, logoCtrl, loadCtrl, coverCtrl, formCtrl]);

    // ESC 닫기, 바깥 클릭 닫기
    const overlayRef = useRef(null);
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    const onOverlayClick = useCallback((e) => {
        if (e.target === overlayRef.current) onClose?.();
    }, [onClose]);

    // Backdrop & Modal variants
    const backdrop = {
        hidden: { opacity: 0 },
        show:   { opacity: 1, transition: { duration: 0.25 } },
        exit:   { opacity: 0, transition: { duration: 0.2 } },
    };

    const modal = {
        hidden: { opacity: 0, scale: 0.98, y: 10, filter: 'blur(6px)' },
        show:   { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
        exit:   { opacity: 0, scale: 0.98, y: 10, transition: { duration: 0.2 } },
    };

    return (
        <AnimatePresence>
            {open && (
                // Backdrop
                <motion.div
                    ref={overlayRef}
                    className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
                    variants={backdrop}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    onMouseDown={onOverlayClick}
                >
                    {/* Modal Card */}
                    <motion.div
                        className="relative w-[min(980px,92vw)] h-[min(620px,84vh)]"
                        variants={modal}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                    >
                        {/* 콘텐츠 레이어 */}
                        <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.35)] bg-white">
                            <div className="flex w-full h-full">
                                {/* 좌측 아이콘 영역 */}
                                <div className="w-1/2 bg-black flex items-center justify-center relative">
                                    <svg viewBox="0 0 24 24" className="w-36 h-36 text-white fill-current" aria-hidden="true">
                                        <path d="M10 3a1 1 0 1 0 0 2h7v14h-7a1 1 0 1 0 0 2h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-8z"/>
                                        <path d="M11.707 8.293a1 1 0 0 0-1.414 1.414L12.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L15.414 12l-3.707-3.707z"/>
                                        <path d="M3 11a1 1 0 1 0 0 2h9a1 1 0 1 0 0-2H3z"/>
                                    </svg>
                                    <button
                                        onClick={onClose}
                                        className="absolute top-3 right-3 text-white/80 hover:text-white transition"
                                        aria-label="Close"
                                    >
                                        ✕
                                    </button>
                                    <a href="/DiFF/member/join" className="absolute bottom-5 right-5 text-white underline font-semibold">
                                        SIGN UP
                                    </a>
                                </div>

                                {/* 우측 폼 */}
                                <div className="w-1/2 flex items-center justify-center">
                                    <motion.div
                                        className="w-full flex flex-col items-center"
                                        variants={formVariants}
                                        initial="hidden"
                                        animate={formCtrl}
                                    >
                                        <div className="w-5/6">
                                            <h1 className="text-2xl md:text-3xl font-semibold text-black text-center mb-8">Login</h1>

                                            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

                                            <form name="login" className="flex flex-col items-center" onSubmit={handleSubmit}>
                                                <input
                                                    type="text"
                                                    name="email"
                                                    id="email"
                                                    value={values.email}
                                                    onChange={handleChange}
                                                    placeholder="email"
                                                    className="mb-4 bg-white border border-black text-black text-sm rounded-lg w-[min(420px,90%)] p-3"
                                                    autoComplete="username"
                                                    required
                                                    disabled={submitting}
                                                />
                                                <input
                                                    type="password"
                                                    name="loginPw"
                                                    id="loginPw"
                                                    value={values.loginPw}
                                                    onChange={handleChange}
                                                    placeholder="Password"
                                                    className="mb-6 bg-white border border-black text-black text-sm rounded-lg w-[min(420px,90%)] p-3"
                                                    autoComplete="current-password"
                                                    required
                                                    disabled={submitting}
                                                />
                                                <button
                                                    type="submit"
                                                    className="py-3 w-[min(420px,90%)] text-sm font-medium bg-black text-white rounded-lg hover:bg-neutral-800 transition disabled:opacity-50"
                                                    disabled={submitting}
                                                >
                                                    {submitting ? 'LOGGING IN…' : 'Login'}
                                                </button>
                                            </form>

                                            <div className="text-center my-6 flex justify-center gap-6 text-black">
                                                <a href="/DiFF/member/join" className="hover:underline">Join</a>
                                                <a href="/DiFF/member/findLoginId" className="hover:underline">Find ID</a>
                                                <a href="/DiFF/member/findLoginPw" className="hover:underline">Find PW</a>
                                            </div>

                                            <div className="space-y-4">
                                                <a
                                                    href="/login/github"
                                                    className="flex items-center justify-center gap-3 bg-black text-white py-2.5 px-4 rounded hover:bg-neutral-800 transition w-[min(420px,90%)] mx-auto"
                                                >
                                                    <svg viewBox="0 0 16 16" aria-hidden="true" className="w-5 h-5 fill-current">
                                                        <path d="M8 0C3.58 0 0 3.64 0 8.13c0 3.6 2.29 6.65 5.47 7.73.4.08.55-.18.55-.39 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.5-2.69-.96-.09-.23-.48-.96-.82-1.16-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.22 1.87.87 2.33.66.07-.53.28-.87.51-1.07-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.84A7.5 7.5 0 0 1 8 3.88c.68 0 1.36.09 2 .26 1.53-1.06 2.2-.84 2.2-.84.44 1.1.16 1.92.08 2.12.51.57.82 1.3.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.25.54.74.54 1.5 0 1.08-.01 1.95-.01 2.22 0 .21.15.47.55.39A8.14 8.14 0 0 0 16 8.13C16 3.64 12.42 0 8 0z"/>
                                                    </svg>
                                                    <span>GitHub로 로그인</span>
                                                </a>

                                                <a
                                                    href="/login/google"
                                                    className="flex items-center justify-center gap-3 border border-black text-black bg-white py-2.5 px-4 rounded w-[min(420px,90%)] mx-auto"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                                        <path fill="none" d="M0 0h48v48H0z" />
                                                    </svg>
                                                    <span>Sign in with Google</span>
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Loading Layer (흰 카드 + DiFF) */}
                        <motion.div
                            className="absolute inset-0 z-50 flex items-center justify-center rounded-3xl bg-white pointer-events-none"
                            variants={loadingLayerVariants}
                            initial="shown"
                            animate={loadCtrl}
                        >
                            <motion.div
                                className="text-[64px] md:text-[88px] text-black select-none"
                                variants={logoWrapperVariants}
                                initial="initial"
                                animate={logoCtrl}
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                {'DiFF'.split('').map((ch, i) => (
                                    <motion.span
                                        key={i}
                                        className="inline-block"
                                        variants={letterVariants}
                                        style={{ transformOrigin: '50% 50% -12px' }}
                                    >
                                        {ch}
                                    </motion.span>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Cover Layer (clip-path로 좌→우 열림, 라운드 유지) */}
                        <motion.div
                            className="absolute inset-0 z-40 rounded-3xl bg-white pointer-events-none"
                            variants={coverVariants}
                            initial="initial"
                            animate={coverCtrl}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
