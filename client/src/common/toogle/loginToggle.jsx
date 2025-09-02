"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import HamburgerButton from "@/common/HamMenu"; // 그대로 재사용

export default function LoginOverlayMenu({
                                             writeHref = "/DiFF/article/write",
                                             draftsHref = "/DiFF/drafts",
                                             onToggleTheme = () => {},
                                             initialOpen = false,
                                         }) {
    const [open, setOpen] = useState(initialOpen);

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <div className="pointer-events-none">
            <div className="fixed right-6 bottom-6 z-[9999] pointer-events-auto flex flex-col items-end gap-3">
                {/* ▼ 토글식 스피드 다이얼 */}
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
                                num="0001"
                                label="글작성"
                                href={writeHref}
                                onClick={() => setOpen(false)}
                                icon={<i className="fa-solid fa-pen text-white" />}
                            />
                            <SpeedDialItem
                                num="0010"
                                label="임시저장목록"
                                href={draftsHref}
                                onClick={() => setOpen(false)}
                                icon={<i className="fa-solid fa-list text-white" />}
                            />
                            <SpeedDialItem
                                num="0011"
                                label="테마바꾸기"
                                onClick={() => { onToggleTheme(); setOpen(false); }}
                                icon={<i className="fa-solid fa-moon text-white" />}
                            />

                            {/** 필요하면 마이페이지를 '바로 이동' 대신 메뉴 항목으로 추가 **/}
                            {/*
              <SpeedDialItem
                num="0100"
                label="마이페이지"
                href="/DiFF/member/profile"
                onClick={() => setOpen(false)}
                icon={<i className="fa-solid fa-user text-white" />}
              />
              */}
                        </motion.ul>
                    )}
                </AnimatePresence>

                {/* FAB(햄버거) — 이것만 고정 노출 */}
                <div>
                    <HamburgerButton
                        open={open}
                        onClick={() => setOpen((v) => !v)}
                        className="text-black dark:text-white"
                    />
                </div>
            </div>
        </div>
    );
}

function SpeedDialItem({ href, onClick, label, num, icon }) {
    const content = (
        <motion.li
            variants={{
                hidden: { opacity: 0, y: 20, scale: 0.8 },
                show: {
                    opacity: 1, y: 0, scale: 1,
                    transition: { type: "spring", stiffness: 520, damping: 22, bounce: 0.35 }
                },
                hide: { opacity: 0, y: 16, scale: 0.9, transition: { duration: 0.12, ease: "easeInOut" } },
            }}
            whileHover={{ scale: 1.04 }}
            className="group relative"
        >
            {/* 말풍선 라벨 */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] tabular-nums text-zinc-400">{num}</span>
                    <span className="px-2 py-1 rounded-md text-xs bg-black/80 text-white dark:bg-white/15 dark:text-white opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition">
            {label}
          </span>
                </div>
            </div>

            {/* 동그란 버튼 */}
            <button
                onClick={onClick}
                aria-label={label}
                className="h-12 w-12 rounded-full shadow-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition grid place-items-center"
            >
                {icon}
            </button>
        </motion.li>
    );

    return href ? (
        <Link href={href} onClick={onClick} className="block">
            {content}
        </Link>
    ) : content;
}
