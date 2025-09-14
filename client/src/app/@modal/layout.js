"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, CheckCircle2, ShieldCheck, Zap, X, GitFork } from "lucide-react";

import LoginForm from "@/app/DiFF/member/login/loginModal";
import JoinForm from "@/app/DiFF/member/join/joinModal";
import ModalOpenIntro from "@/common/anime/modalOpenIntro";
import RepoLayoutSample from "@/app/DiFF/home/main/repository";

export default function ModalLayout({ children }) {
    // 'login' | 'join' | null
    const [mode, setMode] = useState(null);
    const isModalOpen = mode !== null;

    // slide direction
    const prevRef = useRef(mode);
    const [dir, setDir] = useState(1);

    useEffect(() => {
        const prev = prevRef.current;
        if (prev !== mode) {
            setDir(mode === "join" ? 1 : -1);
            prevRef.current = mode;
        }
    }, [mode]);

    const panelLeft = mode === "join" ? "40%" : "0%";

    // close
    const closeModal = () => setMode(null);

    // open via window event
    useEffect(() => {
        const handler = (e) => {
            setMode(e.detail); // 'login' | 'join'
        };
        window.addEventListener("open-modal", handler);
        return () => window.removeEventListener("open-modal", handler);
    }, []);

    useEffect(() => {
        if (!isModalOpen) return;

        const onKeyDown = (e) => {
            if (e.isComposing) return;
            if (e.key === "Escape" || e.keyCode === 27) {
                e.preventDefault();
                closeModal();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isModalOpen]);

    return (
        <AnimatePresence mode="wait">
            {isModalOpen && (
                <motion.div
                    key="modal-root"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* dim */}
                    <motion.div
                        className="fixed inset-0 z-[100] bg-black/60"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                    />

                    {/* frame */}
                    <motion.div
                        className="fixed inset-0 z-[101] flex items-center justify-center p-6"
                        role="dialog"
                        aria-modal="true"
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.98 }}
                        transition={{ duration: 0.22 }}
                        onClick={closeModal}
                    >
                        <div className="relative w-[min(1100px,92vw)] h-[min(640px,78vh)]
                        rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.35)] bg-white"
                             onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={(e) => { e.stopPropagation(); closeModal(); }}
                                className="absolute right-3 top-3 z-50 h-8 w-8 rounded-full text-xl
                                flex justify-center items-center"
                                aria-label="close"
                            >
                                <X
                                    className={`w-7 h-7 ${mode === "join" ? "text-white" : "text-neutral-800"}`}
                                    strokeWidth={2}
                                />
                            </button>

                            <div className={`relative grid w-full h-full
                            ${mode === 'login' ? "grid-cols-[60%_40%]" : "grid-cols-[40%_60%]"}`}>
                            {/* LEFT */}
                                <div className="relative z-10 flex items-center justify-center">
                                    <div className="w-[80%] max-w-[400px]">
                                        <AnimatePresence mode="wait" custom={dir}>
                                            {mode === "join" ? (
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
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* RIGHT (Animated black panel replacement) */}
                                <motion.div
                                    className="absolute inset-y-0 right-0 w-[60%] overflow-hidden z-20"
                                    initial={false}
                                    animate={{ left: panelLeft }}
                                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                    aria-hidden={mode !== "join"}
                                >
                                    <PanelBG />
                                    <div className="relative z-10 h-full text-white">
                                        <PanelContent mode={mode} dir={dir} onToggle={() => setMode(mode === "login" ? "join" : "login")} />
                                    </div>
                                </motion.div>

                                {/* RIGHT column (forms) */}
                                <div className={`relative z-10 flex items-center justify-center ${mode === "join" ? "pointer-events-none" : ""}`}>
                                    <div className="w-[80%] max-w-[400px]">
                                        <AnimatePresence mode="wait" custom={dir}>
                                            {mode === "login" ? (
                                                <motion.div
                                                    key="login-right"
                                                    initial={{ x: -40 * dir, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    exit={{ x: 40 * dir, opacity: 0 }}
                                                    transition={{ duration: 0.22 }}
                                                >
                                                    <LoginForm callbackUrl="/DiFF/home/main" afterLoginUriFromPage={undefined} />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="join-right"
                                                    initial={{ x: -40 * dir, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    exit={{ x: 40 * dir, opacity: 0 }}
                                                    transition={{ duration: 0.22 }}
                                                >
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            <RepoLayoutSample />
                            <ModalLayout />
                            <ModalOpenIntro open={isModalOpen} brandText="DiFF" />
                        </div>
                    </motion.div>

                    {/* keep children mounted for routing */}
                    <div style={{ display: "none" }}>{children}</div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// -------------------- Background (mesh gradient + grid) --------------------
function PanelBG() {
    return (
        <div className="absolute inset-0">
            {/* Mesh gradient base */}
            <div className="absolute inset-0 bg-black" />

            {/* Subtle grid overlay with radial fade */}
            <div className="absolute inset-0 opacity-25 [mask-image:radial-gradient(800px_800px_at_70%_50%,#000,transparent)]">
            </div>

            {/* Floating glow blobs */}
            <motion.div
                className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-400/30 blur-3xl"
                initial={{ y: 0, opacity: 0.3 }}
                animate={{ y: [0, 30, 0], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-sky-500/25 blur-3xl"
                initial={{ y: 0, opacity: 0.3 }}
                animate={{ y: [0, -38, 0], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}

function PanelContent({ mode, dir, onToggle }) {
    const [tipIdx, setTipIdx] = useState(0);

    const tips = [
        "You can paste a remote repository URL to connect instantly.",
        "Turn remote commits into draft posts.",
        "Track code quality over time.",
        "Draft generates in the background—keep working.",
        "CLI drafts are much faster than remote commits."
    ];

    useEffect(() => {
        if (mode !== "login") return;
        const id = setInterval(() => setTipIdx((i) => (i + 1) % tips.length), 3000);
        return () => clearInterval(id);
    }, [mode]);

    return (
        <div className="h-full px-10 md:px-12 py-9 flex flex-col justify-between">
            {/* Top brand */}
            <div className="flex items-center gap-2 text-white/90">
                <GitFork className="w-5 h-5" />
                <span className="font-semibold tracking-wide">DiFF</span>
            </div>

            {/* Main copy varies by mode */}
            <div>
                <AnimatePresence mode="wait" custom={dir}>
                    {mode === "join" ? (
                        <motion.div
                            key="join-copy"
                            initial={{ x: 24 * dir, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -24 * dir, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                                Create your DiFF account
                            </h2>
                            <p className="mt-3 text-white/80 max-w-[34ch]">
                                Turn code changes into beautiful, shareable write-ups. Private by default. Fast by design.
                            </p>
                            <ul className="mt-6 space-y-3">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="mt-0.5 w-5 h-5 text-green-500/70" />
                                    <span className="text-white/85">Keep your commit history in sync</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <ShieldCheck className="mt-0.5 w-5 h-5 text-white/90" />
                                    <span className="text-white/85">Private repos stay private</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Zap className="mt-0.5 w-5 h-5 text-yellow-500/70" />
                                    <span className="text-white/85">Generate polished drafts from diffs</span>
                                </li>
                            </ul>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="login-copy"
                            initial={{ x: -24 * dir, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 24 * dir, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                                Welcome back !
                            </h2>
                            <p className="mt-3 text-white/80 max-w-[34ch]">
                                Continue where you left off.<br/>
                                Your repositories and drafts are right here.
                            </p>

                            {/* Cycling tip */}
                            <div className="mt-6">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={tipIdx}
                                        initial={{ y: 8, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -8, opacity: 0 }}
                                        transition={{ duration: 0.22 }}
                                        className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md px-4 py-3 text-sm"
                                    >
                                        <span className="font-medium">Tip</span>
                                        <span className="mx-2 opacity-70">•</span>
                                        <span className="opacity-90">{tips[tipIdx]}</span>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom tiny disclaimer + toggle */}
            <div className="flex items-center justify-between text-white/90 z-50">
                <span>By continuing, you agree to our Terms & Privacy.</span>
                <a
                    href="#"
                    onClick={onToggle}
                    className="underline decoration-white/40 underline-offset-4 hover:decoration-white/70 transition"
                >
                    {mode === "login" ? "Create account" : "I already have an account"}
                </a>
            </div>
        </div>
    );
}
