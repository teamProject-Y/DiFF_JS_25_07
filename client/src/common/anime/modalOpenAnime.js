// src/common/useModalOpenIntro.js
'use client';

import { useEffect } from 'react';
import { useAnimationControls } from 'framer-motion';

export default function useModalOpenIntro(open) {
    const logoCtrl  = useAnimationControls(); // 텍스트 폴딩
    const loadCtrl  = useAnimationControls(); // 흰 로딩 레이어 페이드아웃
    const coverCtrl = useAnimationControls(); // 커버 clip-path 오픈

    // Variants
    const letterVariants = {
        initial: { rotateX: 0, opacity: 1 },
        fold:    { rotateX: 90, opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    };
    const logoWrapVariants = {
        initial: {},
        fold: { transition: { staggerChildren: 0.05 } },
    };
    const loadingLayerVariants = {
        shown:  { opacity: 1 },
        hidden: { opacity: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    };
    const coverVariants = {
        initial: { clipPath: 'inset(0% 0% 0% 0% round 24px)' }, // 전체 덮힘
        slide: {
            clipPath: 'inset(0% 0% 0% 100% round 24px)',          // 좌->우 오픈
            transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
            transitionEnd: { display: 'none', visibility: 'hidden' },
        },
    };

    useEffect(() => {
        if (!open) return;
        (async () => {
            await logoCtrl.set('initial');
            await loadCtrl.set('shown');
            await coverCtrl.set('initial');

            await new Promise(r => setTimeout(r, 500));
            await logoCtrl.start('fold');
            await loadCtrl.start('hidden');

            await new Promise(r => setTimeout(r, 100));
            await coverCtrl.start('slide');
        })();
    }, [open, logoCtrl, loadCtrl, coverCtrl]);

    return {
        logoCtrl, loadCtrl, coverCtrl,
        letterVariants, logoWrapVariants, loadingLayerVariants, coverVariants,
    };
}
