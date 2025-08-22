'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { signUp } from '@/lib/UserAPI';

export default function JoinModalPage() {
    const router = useRouter();
    const sp = useSearchParams();

    const callbackUrl = sp?.get('callbackUrl') || '/DiFF/home/main';
    const afterLoginUri = useMemo(() => {
        const p = sp?.get('afterLoginUri');
        if (p) return p;
        if (typeof window !== 'undefined') return window.location.pathname + window.location.search;
        return callbackUrl;
    }, [sp, callbackUrl]);

    const [form, setForm] = useState({
        name: '', birthday: '', loginId: '', loginPw: '',
        checkLoginPw: '', nickName: '', email: '',
    });
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const onChange = (e) => setForm(v => ({ ...v, [e.target.name]: e.target.value }));

    const validate = (s = step) => {
        if (s === 0) {
            if (!form.name.trim()) return '이름을 입력하세요.';
            if (!form.birthday) return '생년월일을 입력하세요.';
            return '';
        }
        if (s === 1) {
            if (!form.loginId.trim()) return '아이디를 입력하세요.';
            if (!form.loginPw.trim()) return '비밀번호를 입력하세요.';
            if (form.loginPw !== form.checkLoginPw) return '비밀번호가 일치하지 않습니다.';
            return '';
        }
        if (s === 2) {
            if (!form.nickName.trim()) return '닉네임을 입력하세요.';
            if (!form.email.trim() || !form.email.includes('@')) return '유효한 이메일을 입력하세요.';
            return '';
        }
        return '';
    };

    const goNext = () => {
        const msg = validate(step);
        if (msg) return setError(msg);
        setError('');
        setDir(1);
        if (step < 2) setStep(s => s + 1);
    };
    const goPrev = () => {
        setError('');
        setDir(-1);
        if (step > 0) setStep(s => s - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const msg = validate(2);
        if (msg) return setError(msg);
        setError('');
        try {
            setSubmitting(true);
            const { loginId, loginPw, checkLoginPw, name, nickName, email } = form;
            const res = await signUp({ loginId, loginPw, checkLoginPw, name, nickName, email });
            if (res?.resultCode === 'S-1') {
                router.push('/DiFF/home/main');
            } else {
                setError(res?.msg || '회원가입에 실패했습니다');
                setSubmitting(false);
            }
        } catch (err) {
            setError(err?.response?.data?.msg || '서버 요청 중 오류가 발생했습니다');
            setSubmitting(false);
        }
    };

    // ===== 인트로 애니메이션 =====
    const logoCtrl = useAnimationControls();
    const loadCtrl = useAnimationControls();
    const coverCtrl = useAnimationControls();
    const formCtrl = useAnimationControls();

    const letterVariants = {
        initial: { rotateX: 0, opacity: 1 },
        fold: { rotateX: 90, opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } },
    };
    const logoWrapperVariants = { initial: {}, fold: { transition: { staggerChildren: 0.06 } } };
    const loadingLayerVariants = { shown: { opacity: 1 }, hidden: { opacity: 0, transition: { duration: 0.35 } } };
    const coverVariants = {
        initial: { clipPath: 'inset(0% 0% 0% 0% round 24px)' },
        slide: {
            clipPath: 'inset(0% 0% 0% 100% round 24px)',
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
            transitionEnd: { display: 'none', visibility: 'hidden' },
        },
    };
    const formVariants = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

    useEffect(() => {
        (async () => {
            await logoCtrl.set('initial');
            await loadCtrl.set('shown');
            await coverCtrl.set('initial');
            await formCtrl.set('hidden');
            await new Promise(r => requestAnimationFrame(r));
            await new Promise(r => setTimeout(r, 900));
            await logoCtrl.start('fold');
            await loadCtrl.start('hidden');
            await new Promise(r => setTimeout(r, 150));
            await coverCtrl.start('slide');
            await new Promise(r => setTimeout(r, 250));
            await formCtrl.start('show');
        })();
    }, [logoCtrl, loadCtrl, coverCtrl, formCtrl]);

    // 스텝 전환
    const stepVariants = {
        enter: (d) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
        center: { x: 0, opacity: 1, transition: { duration: 0.25 } },
        exit: (d) => ({ x: d > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.2 } }),
    };

    // 모달 래퍼
    const overlayVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.2 } }, exit: { opacity: 0, transition: { duration: 0.15 } } };
    const panelVariants   = { hidden: { y: 24, opacity: 0, scale: 0.98 }, show: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.25 } }, exit: { y: 24, opacity: 0, scale: 0.98, transition: { duration: 0.2 } } };

    return (
        <AnimatePresence>
            {/* overlay */}
            <motion.div
                key="overlay"
                className="fixed inset-0 z-[100] bg-black/50"
                variants={overlayVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                onClick={() => router.back()}
            />

            {/* panel */}
            <motion.div
                key="panel"
                className="fixed inset-0 z-[101] flex items-center justify-center p-6"
                variants={panelVariants}
                initial="hidden"
                animate="show"
                exit="exit"
            >
                <div
                    className="relative w-[min(1100px,92vw)] h-[min(640px,78vh)] rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.35)] bg-white"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 닫기 */}
                    <button
                        onClick={() => router.back()}
                        className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full bg-black text-white text-lg"
                        aria-label="close"
                    >
                        ×
                    </button>

                    <div className="flex w-full h-full">
                        {/* 📝 왼쪽: 가입 폼  ←←← 여기로 이동 */}
                        <div className="relative w-1/2 flex items-center justify-center">
                            <motion.div className="w-full h-full flex flex-col items-center" variants={formVariants} initial="hidden" animate={formCtrl}>
                                <div className="w-5/6 h-full flex flex-col items-center relative">
                                    <h1 className="text-2xl md:text-3xl font-semibold text-black text-center mt-6 mb-4">Join</h1>

                                    <div className="relative w-full flex-1 overflow-hidden">
                                        <AnimatePresence custom={dir} mode="wait">
                                            {step === 0 && (
                                                <motion.div
                                                    key="step-0"
                                                    custom={dir}
                                                    variants={stepVariants}
                                                    initial="enter"
                                                    animate="center"
                                                    exit="exit"
                                                    className="absolute inset-0 flex flex-col items-center justify-center"
                                                >
                                                    <label className="w-3/4 self-start ml-6 my-2 font-medium">이름</label>
                                                    <input
                                                        name="name"
                                                        value={form.name}
                                                        onChange={onChange}
                                                        placeholder="이름"
                                                        className="bg-white w-3/4 text-sm rounded-lg block p-4 mb-4 border border-black"
                                                    />
                                                    <label className="w-3/4 self-start ml-6 my-2 font-medium">생년월일</label>
                                                    <input
                                                        type="date"
                                                        name="birthday"
                                                        value={form.birthday}
                                                        onChange={onChange}
                                                        className="bg-white w-3/4 text-sm rounded-lg block p-4 border border-black"
                                                    />
                                                </motion.div>
                                            )}

                                            {step === 1 && (
                                                <motion.div
                                                    key="step-1"
                                                    custom={dir}
                                                    variants={stepVariants}
                                                    initial="enter"
                                                    animate="center"
                                                    exit="exit"
                                                    className="absolute inset-0 flex flex-col items-center justify-center"
                                                >
                                                    <label className="w-3/4 self-start ml-6 my-2 font-medium">아이디</label>
                                                    <input
                                                        name="loginId"
                                                        value={form.loginId}
                                                        onChange={onChange}
                                                        placeholder="아이디"
                                                        className="bg-white w-3/4 text-sm rounded-lg block p-4 mb-3 border border-black"
                                                    />
                                                    <label className="w-3/4 self-start ml-6 my-2 font-medium">비밀번호</label>
                                                    <input
                                                        type="password"
                                                        name="loginPw"
                                                        value={form.loginPw}
                                                        onChange={onChange}
                                                        placeholder="비밀번호"
                                                        className="bg-white w-3/4 text-sm rounded-lg block p-4 mb-3 border border-black"
                                                    />
                                                    <label className="w-3/4 self-start ml-6 my-2 font-medium">비밀번호 확인</label>
                                                    <input
                                                        type="password"
                                                        name="checkLoginPw"
                                                        value={form.checkLoginPw}
                                                        onChange={onChange}
                                                        placeholder="비밀번호 확인"
                                                        className="bg-white w-3/4 text-sm rounded-lg block p-4 border border-black"
                                                    />
                                                </motion.div>
                                            )}

                                            {step === 2 && (
                                                <motion.div
                                                    key="step-2"
                                                    custom={dir}
                                                    variants={stepVariants}
                                                    initial="enter"
                                                    animate="center"
                                                    exit="exit"
                                                    className="absolute inset-0 flex flex-col items-center justify-center"
                                                >
                                                    <label className="w-3/4 self-start ml-6 my-2 font-medium">닉네임</label>
                                                    <input
                                                        name="nickName"
                                                        value={form.nickName}
                                                        onChange={onChange}
                                                        placeholder="닉네임"
                                                        className="bg-white w-3/4 text-sm rounded-lg block p-4 mb-3 border border-black"
                                                    />
                                                    <label className="w-3/4 self-start ml-6 my-2 font-medium">이메일</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={form.email}
                                                        onChange={onChange}
                                                        placeholder="E-mail"
                                                        className="bg-white w-3/4 text-sm rounded-lg block p-4 border border-black"
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {error && <div className="text-red-500 text-sm mt-3">{error}</div>}

                                    <form onSubmit={handleSubmit} className="mt-auto w-3/4 pb-8 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={goPrev}
                                            className={`bg-neutral-500 text-white font-bold py-2 px-4 rounded ${step === 0 ? 'invisible' : ''}`}
                                        >
                                            이전
                                        </button>
                                        {step < 2 ? (
                                            <button type="button" onClick={goNext} className="bg-black text-white font-bold py-2 px-4 rounded">
                                                다음
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                className="bg-black hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                                disabled={submitting}
                                            >
                                                {submitting ? '처리 중…' : '회원가입'}
                                            </button>
                                        )}
                                    </form>
                                </div>
                            </motion.div>
                        </div>

                        {/* 🔳 오른쪽: 블랙 패널 + SIGN IN */}
                        <div className="w-1/2 relative bg-black flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-40 h-40 text-white fill-current" aria-hidden="true">
                                <path d="M10 3a1 1 0 1 0 0 2h7v14h-7a1 1 0 1 0 0 2h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-8z"/>
                                <path d="M11.707 8.293a1 1 0 0 0-1.414 1.414L12.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L15.414 12l-3.707-3.707z"/>
                                <path d="M3 11a1 1 0 1 0 0 2h9a1 1 0 1 0 0-2H3z"/>
                            </svg>
                            <Link
                                href="/DiFF/member/login"
                                scroll={false}
                                className="absolute left-5 bottom-5 text-white underline font-semibold"
                            >
                                SIGN IN
                            </Link>
                        </div>
                    </div>

                    {/* 로딩 레이어 */}
                    <motion.div
                        className="absolute inset-0 z-50 flex items-center justify-center rounded-3xl bg-white pointer-events-none"
                        variants={loadingLayerVariants}
                        initial="shown"
                        animate={loadCtrl}
                        style={{ perspective: 1000 }}
                    >
                        <motion.div
                            className="text-[72px] md:text-[96px] text-black select-none"
                            variants={logoWrapperVariants}
                            initial="initial"
                            animate={logoCtrl}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {'CERTIFY'.split('').map((ch, i) => (
                                <motion.span
                                    key={i}
                                    className="inline-block"
                                    variants={letterVariants}
                                    style={{ transformOrigin: '50% 50% -12px', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                                >
                                    {ch}
                                </motion.span>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* 커버 레이어 (clip-path) */}
                    <motion.div
                        className="absolute inset-0 z-40 rounded-3xl bg-white pointer-events-none"
                        variants={coverVariants}
                        initial="initial"
                        animate={coverCtrl}
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
