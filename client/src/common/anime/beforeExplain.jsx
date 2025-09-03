'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function BeforeExplain({ containerId = 'pageScroll' }) {
    const sectionRef = useRef(null);
    const containerRef = useRef(null);

    // pageScroll(네가 만든 스크롤 컨테이너)에 붙임
    useEffect(() => {
        containerRef.current = document.getElementById(containerId) || undefined;
    }, [containerId]);

    // 섹션이 화면 70% 지점에 들어와서 30% 지점에서 나갈 때 0→1 (스크럽)
    const { scrollYProgress: prog } = useScroll({
        container: containerRef,
        target: sectionRef,
        offset: ['start 70%', 'end 30%'],
    });

    // 구간별 등장(아래→위) / 역스크롤시 역재생
    const seg = (start, len = 0.14) => ({
        opacity: useTransform(prog, [start, start + len], [0, 1]),
        y:       useTransform(prog, [start, start + len], [18, 0]),
    });
    const segX = (start, len = 0.14) => ({
        opacity: useTransform(prog, [start, start + len], [0, 1]),
        x:       useTransform(prog, [start, start + len], [12, 0]),
    });

    // 순서 = 라벨 → 헤드라인1 → 헤드라인2 → 불릿1~3 → 더보기
    const sLabel = seg(0.00);
    const sH1a   = seg(0.10);
    const sH1b   = seg(0.22);
    const sB1    = seg(0.36);
    const sB2    = seg(0.48);
    const sB3    = seg(0.60);
    const sMore  = segX(0.72);

    return (
        <section ref={sectionRef} className="relative w-full h-full flex items-start justify-center">
            {/* 우상단 '더보기' 필 버튼 (움짤 오른쪽 상단 작은 버튼) */}
            <motion.button
                type="button"
                style={sMore}
                className="absolute right-6 top-8 px-4 py-2 rounded-full border border-slate-300 text-slate-600 bg-white/70 backdrop-blur hover:bg-white transition"
            >
                더보기
            </motion.button>

            {/* 왼쪽 텍스트 블록 */}
            <div className="relative z-10 w-full max-w-5xl px-8 sm:px-12 pt-10">
                {/* # 라벨 */}
                <motion.div style={sLabel} className="flex items-center gap-2 mb-3">
                    <span className="inline-block size-2 rounded-full bg-sky-600" />
                    <span className="text-sm font-semibold tracking-wide text-sky-600">ROBOTORI EDU 특징</span>
                </motion.div>

                {/* 헤드라인 2줄 */}
                <motion.h2 style={sH1a} className="text-[28px] sm:text-4xl md:text-[40px] font-extrabold leading-tight text-slate-900">
                    원하시는 조건과 교육 현장의 여건에 따라
                </motion.h2>
                <motion.h2 style={sH1b} className="text-[28px] sm:text-4xl md:text-[40px] font-extrabold leading-tight text-slate-900">
                    맞춤화 교육 설계 및 운영이 가능합니다.
                </motion.h2>

                {/* 밑 문장들(= 불릿 3줄) */}
                <ul className="mt-6 space-y-2 text-slate-700">
                    <motion.li style={sB1} className="flex items-start gap-2">
                        <span className="mt-2 block size-1.5 rounded-full bg-slate-400" />
                        <span className="text-base md:text-lg">수요자 특화에 따른 맞춤형 제안</span>
                    </motion.li>
                    <motion.li style={sB2} className="flex items-start gap-2">
                        <span className="mt-2 block size-1.5 rounded-full bg-slate-400" />
                        <span className="text-base md:text-lg">Short / Long 교육과정 지원</span>
                    </motion.li>
                    <motion.li style={sB3} className="flex items-start gap-2">
                        <span className="mt-2 block size-1.5 rounded-full bg-slate-400" />
                        <span className="text-base md:text-lg">일회성 · 정기형 운영형</span>
                    </motion.li>
                </ul>
            </div>
        </section>
    );
}
