// src/common/ModalOpenIntro.jsx
'use client';

import { motion } from 'framer-motion';
import useModalOpenIntro from './modalOpenAnime';

export default function ModalOpenIntro({ open, brandText = '' }) {
    const {
        logoCtrl, loadCtrl, coverCtrl,
        letterVariants, logoWrapVariants, loadingLayerVariants, coverVariants,
    } = useModalOpenIntro(open);

    if (!open) return null;

    return (
        <>
            {/* 흰 로딩 레이어 (텍스트 폴딩 후 사라짐) */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-3xl bg-white"
                variants={loadingLayerVariants}
                initial="shown"
                animate={loadCtrl}
            >
                <motion.div
                    className="text-[64px] md:text-[88px] text-black select-none"
                    variants={logoWrapVariants}
                    initial="initial"
                    animate={logoCtrl}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {brandText.split('').map((ch, i) => (
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

            {/* 커버: clip-path로 좌→우 오픈 */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-40 rounded-3xl bg-white"
                variants={coverVariants}
                initial="initial"
                animate={coverCtrl}
            />
        </>
    );
}
