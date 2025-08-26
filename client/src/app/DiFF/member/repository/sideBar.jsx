// src/app/DiFF/member/repository/SideBar.jsx
'use client';
import { motion } from 'framer-motion';

export default function SideBar({ repositories = [] }) {
    return (
        <motion.aside
            key="ghost-rail"
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                opacity: 0,
                pointerEvents: 'none',
                width: 256,              // bar 폭(대강 64 * 4)
            }}
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 0 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        >
            <ul className="p-2 space-y-2">
                {repositories.map((repo) => (
                    // grid 카드 / 상세 헤더와 동일한 layoutId
                    <motion.li
                        key={repo.id}
                        layoutId={`repo-${repo.id}`}
                        style={{ height: 44 }} // li 높이( p-3 )감 맞추면 handoff가 더 자연스러움
                    />
                ))}
            </ul>
        </motion.aside>
    );
}
