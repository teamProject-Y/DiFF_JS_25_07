// src/common/overlay/loginOverlay.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 라이브러리 없는 FAB Speed-Dial
 * - 우하단 고정, 화면 덮지 않음
 * - 햄버거(FAB) 클릭 → 위로 톡톡 튀는 버튼 3개
 * - ESC / 바깥 클릭 닫힘
 * - Tailwind + framer-motion만 사용
 */
export default function LoginSpeedDial ({
                                             writeHref = "/DiFF/article/write",
                                             draftsHref = "/DiFF/article/drafts",
                                             onToggleTheme = defaultToggleTheme,
                                             initialOpen = false,
                                             zIndex = 9999,
                                         }) {
    const [open, setOpen] = useState(initialOpen);
    const wrapRef = useRef(null);

    // ESC 닫기
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // 바깥 클릭 닫기
    useEffect(() => {
        const onClick = (e) => {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [open]);

    return (
        <div className="pointer-events-none">
            <div
                ref={wrapRef}
                className="fixed right-6 bottom-6 pointer-events-auto flex flex-col items-end gap-3"
                style={{ zIndex }}
            >
                {/* Speed-Dial 버튼들 (위로 펼침) */}
                <AnimatePresence>
                    {open && (
                        <motion.ul
                            key="speed-dial"
                            initial="hidden"
                            animate="show"
                            exit="hide"
                            variants={{
                                hidden: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
                                show:   { transition: { staggerChildren: 0.06 } },
                                hide:   { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
                            }}
                            className="flex flex-col items-end gap-3 mb-1"
                        >
                            <SpeedDialItem
                                label="글작성"
                                href={writeHref}
                                onClick={() => setOpen(false)}
                                bgClass="bg-emerald-500 hover:bg-emerald-600"
                                icon={<i className="fa-solid fa-pen text-white" aria-hidden="true" />}
                            />
                            <SpeedDialItem
                                label="임시저장목록"
                                href={draftsHref}
                                onClick={() => setOpen(false)}
                                bgClass="bg-sky-500 hover:bg-sky-600"
                                icon={<i className="fa-solid fa-list text-white" aria-hidden="true" />}
                            />
                            <SpeedDialItem
                                label="테마"
                                onClick={() => {
                                    onToggleTheme();
                                    setOpen(false);
                                }}
                                bgClass="bg-indigo-500 hover:bg-indigo-600"
                                icon={<i className="fa-solid fa-moon text-white" aria-hidden="true" />}
                            />
                        </motion.ul>
                    )}
                </AnimatePresence>

                {/* FAB: + 아이콘이 열릴 때 45도 회전 → X 느낌 */}
                <button
                    type="button"
                    aria-label="메뉴 열기/닫기"
                    onClick={() => setOpen((v) => !v)}
                    className="grid place-items-center h-10 w-10 rounded-full ring-1 ring-black text-black dark:bg-white dark:text-black active:scale-95 transition"
                >
                    <motion.span
                        initial={false}
                        animate={open ? { rotate: 45 } : { rotate: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        className="text-2xl leading-none"
                    >
                        +
                    </motion.span>
                </button>
            </div>
        </div>
    );
}

function SpeedDialItem({ href, onClick, label, icon, bgClass = "bg-emerald-500" }) {
    const item = (
        <motion.li
            variants={{
                hidden: { opacity: 0, y: 20, scale: 0.8 },
                show: {
                    opacity: 1, y: 0, scale: 1,
                    transition: { type: "spring", stiffness: 520, damping: 22, bounce: 0.35 },
                },
                hide: { opacity: 0, y: 16, scale: 0.9, transition: { duration: 0.12, ease: "easeInOut" } },
            }}
            whileHover={{ scale: 1.04 }}
            className="group relative"
        >
            {/* 말풍선 라벨 + 번호 (호버 시 나타남) */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none select-none">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-md text-xs bg-black/80 text-white dark:bg-white/15 dark:text-white opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition">
            {label}
          </span>
                </div>
            </div>

            {/* 둥근 기능 버튼 */}
            <button
                type="button"
                onClick={onClick}
                aria-label={label}
                className={`h-10 w-10 rounded-full shadow-lg ${bgClass} active:scale-95 transition grid place-items-center`}
            >
                {icon}
            </button>
        </motion.li>
    );

    return href ? (
        <Link href={href} onClick={onClick} className="block">
            {item}
        </Link>
    ) : (
        item
    );
}

// 기본 테마 토글 (프로젝트 전역 다크모드 방식 그대로 쓰고 있으면 이대로 OK)
function defaultToggleTheme() {
    document.documentElement.classList.toggle("dark");
    localStorage.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
}
