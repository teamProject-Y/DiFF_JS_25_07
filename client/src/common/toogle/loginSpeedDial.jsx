// src/common/overlay/loginOverlay.jsx
"use client";

import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {motion, AnimatePresence} from "framer-motion";
import ThemeToggle, {useTheme} from "@/common/thema";

export default function LoginSpeedDial({
                                           writeHref = "/DiFF/article/write",
                                           draftsHref = "/DiFF/article/drafts",
                                           onToggleTheme = defaultToggleTheme,
                                           initialOpen = false,
                                           zIndex = 500,
                                       }) {
    const [open, setOpen] = useState(initialOpen);
    const wrapRef = useRef(null);
    const theme = useTheme();

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
                className="absolute left-10 bottom-10 pointer-events-auto flex flex-col items-end gap-3"
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
                                show: { transition: { staggerChildren: 0.06 } },
                                hide: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
                            }}
                            className="flex flex-col items-end gap-3 mb-1 mx-auto"
                        >
                            <SpeedDialItem
                                label="Write"
                                href={writeHref}
                                onClick={() => setOpen(false)}
                                variant="neutral"
                                icon={<i className="fa-solid fa-pen" aria-hidden="true" />}
                            />
                            <SpeedDialItem
                                label="Drafts"
                                href={draftsHref}
                                onClick={() => setOpen(false)}
                                variant="neutral"
                                icon={<i className="fa-solid fa-list" aria-hidden="true" />}
                            />
                            <SpeedDialItem
                                label="Theme"
                                onClick={() => {
                                    onToggleTheme();
                                    setOpen(false);
                                }}
                                variant="theme"
                                // ThemeToggle 아이콘이 커도 래퍼로 균일하게 축소
                                icon={
                                    <span className="inline-flex items-center justify-center scale-[0.7]">
                                        <ThemeToggle />
                                    </span>
                                }
                                theme={theme}
                            />
                        </motion.ul>
                    )}
                </AnimatePresence>

                {/* 메인 FAB */}
                <button
                    type="button"
                    aria-label="menu"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                    className="
                        flex justify-center items-center h-11 w-11 rounded-full
                        bg-white/90 dark:bg-neutral-900/80
                        border border-neutral-200/80 dark:border-neutral-700
                        backdrop-blur-md shadow-lg
                        ring-0 hover:ring-1 hover:ring-black/10 dark:hover:ring-white/10
                        text-neutral-600 dark:text-neutral-200
                        active:scale-95 transition
                      "
                >
                    <motion.span
                        initial={false}
                        animate={open ? { rotate: 45 } : { rotate: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        className="text-xl leading-none"
                    >
                        <i className="fa-solid fa-plus" aria-hidden="true" />
                    </motion.span>
                </button>
            </div>
        </div>
    );
}

function SpeedDialItem({
                           href,
                           onClick,
                           label,
                           icon,
                           variant = "neutral",
                           theme,
                       }) {
    const item = (
        <motion.li
            variants={{
                hidden: { opacity: 0, y: 20, scale: 0.8 },
                show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { type: "spring", stiffness: 520, damping: 22, bounce: 0.35 },
                },
                hide: { opacity: 0, y: 16, scale: 0.9, transition: { duration: 0.12, ease: "easeInOut" } },
            }}
            whileHover={{ scale: 1.04 }}
            className="group relative"
        >
            {/* tooltip */}
            <div className="absolute left-14 top-1/2 -translate-y-1/2 pointer-events-none select-none">
                <div className="flex items-center gap-2">
          <span
              className="
              px-2 py-1 rounded-md text-sm
              bg-neutral-900/85 text-white dark:bg-neutral-100/80 dark:text-neutral-900
              border border-black/10 dark:border-white/20
              shadow-sm
              opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition
              whitespace-nowrap
            "
          >
            {label}
          </span>
                </div>
            </div>

            <button
                type="button"
                onClick={onClick}
                aria-label={label}
                className={buttonClassByVariant(variant, theme)}
            >
        <span className="text-[15px] leading-none flex items-center justify-center">
          {icon}
        </span>
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

function buttonClassByVariant(variant, theme) {
    const base =
        "h-10 w-10 rounded-full grid place-items-center " +
        "bg-white/90 dark:bg-neutral-800/90 " +
        "border border-neutral-200 dark:border-neutral-700 " +
        "backdrop-blur-md shadow-lg " +
        "text-neutral-700 dark:text-neutral-200 " +
        "ring-0 hover:ring-1 hover:ring-black/10 dark:hover:ring-white/10 " +
        "active:scale-95 transition";

    if (variant === "theme") {
        return (
            "relative " +
            base +
            " " +
            "bg-white/95 dark:bg-neutral-800/95"
        );
    }
    return base;
}

function defaultToggleTheme() {
    document.documentElement.classList.toggle("dark");
    localStorage.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
}
