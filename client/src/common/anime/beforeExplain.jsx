'use client';

import { useEffect, useRef } from 'react';

function clamp01(v) { return Math.max(0, Math.min(1, v)); }

export default function BeforeExplain() {
    const wrapRef   = useRef(null); // 긴 래퍼 (예: 350vh)
    const text1Ref  = useRef(null);
    const text2Ref  = useRef(null);
    const text3Ref  = useRef(null);
    const right1Ref = useRef(null);
    const right2Ref = useRef(null);
    const right3Ref = useRef(null);

    useEffect(() => {
        const scroller = document.getElementById('pageScroll');
        const wrap = wrapRef.current;
        if (!scroller || !wrap) return;

        let ticking = false;

        const update = () => {
            ticking = false;
            const wrapTop = wrap.offsetTop;
            const wrapHeight = wrap.scrollHeight;
            const viewH = scroller.clientHeight;
            const y = scroller.scrollTop;

            const progress = clamp01((y - wrapTop) / (wrapHeight - viewH));
            let step = 0;
            if (progress >= 2/3) step = 2;
            else if (progress >= 1/3) step = 1;

            const activePin = y >= wrapTop && y < (wrapTop + (wrapHeight - viewH));
            scroller.classList.toggle('snap-none', activePin);

            const sets = [
                { text: text1Ref.current, dot: '.dot',  active: step === 0 },
                { text: text2Ref.current, dot: '.dot2', active: step === 1 },
                { text: text3Ref.current, dot: '.dot3', active: step === 2 },
            ];

            sets.forEach(({ text, dot, active }) => {
                if (!text) return;
                const bullet = text.querySelector(dot);
                const spans = text.querySelectorAll('span:not(.dot):not(.dot2):not(.dot3), li');
                bullet && bullet.classList.toggle('bg-blue-500', active);
                bullet && bullet.classList.toggle('bg-black', !active);
                spans.forEach(el => {
                    el.classList.toggle('text-blue-500', active);
                    el.classList.toggle('text-black', !active);
                });
            });

            const rights = [right1Ref.current, right2Ref.current, right3Ref.current];
            rights.forEach((el, i) => {
                if (!el) return;
                const on = (i === step);
                el.style.opacity = on ? '1' : '0';
                el.style.transform = on ? 'translateY(0px)' : 'translateY(-16px)';
                el.style.transition = 'opacity 300ms ease, transform 300ms ease';
            });
        };

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        };

        update();
        scroller.addEventListener('scroll', onScroll, { passive: true });
        const ro = new ResizeObserver(update);
        ro.observe(wrap);

        return () => {
            scroller.removeEventListener('scroll', onScroll);
            ro.disconnect();
        };
    }, []);

    return (
        <section ref={wrapRef} className="relative w-full h-[350vh] bg-white overflow-visible">
            <div className="sticky top-0 h-screen">
                <button
                    type="button"
                    className="absolute top-6 right-8 z-20 px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
                >
                    더보기 <span className="ml-1">+</span>
                </button>

                <div className="relative z-10 grid h-full md:grid-cols-[1.05fr_1fr] items-start gap-12 px-8 md:px-20 pt-16 max-w-[1400px] mx-auto">
                    {/* LEFT */}
                    <div className="max-w-none">
                        <div className="space-y-28">
                            <div className="flex items-center gap-3">
                                <span className="w-5 h-5 rounded-full border-[6px] border-blue-600"/>
                                <span className="text-base md:text-lg font-semibold text-[#2a5cff]">
                  DiFF – Git 히스토리에서 블로그 초안까지
                </span>
                            </div>

                            <h1 className="font-bold text-slate-900 leading-[1.03] text-[clamp(30px,5.0vw,50px)]">
                                <span className="block whitespace-nowrap break-keep">당신의 개발 기록을</span>
                                <span className="block whitespace-nowrap break-keep">콘텐츠로 바꿔주는 스마트 워크플로우</span>
                            </h1>
                        </div>

                        <div ref={text1Ref} className="space-y-4 mt-8">
                            <div className="flex items-center gap-3">
                                <span className="dot w-2.5 h-2.5 rounded-full bg-black"/>
                                <span className="text-black font-semibold">커밋 요약 자동화</span>
                            </div>
                        </div>
                        <div ref={text2Ref} className="space-y-4 mt-6">
                            <div className="flex items-center gap-3">
                                <span className="dot2 w-2.5 h-2.5 rounded-full bg-black"/>
                                <span className="text-black font-semibold">PR/체인지로그 일관성 향상</span>
                            </div>
                        </div>
                        <div ref={text3Ref} className="space-y-4 mt-6">
                            <div className="flex items-center gap-3">
                                <span className="dot3 w-2.5 h-2.5 rounded-full bg-black"/>
                                <span className="text-black font-semibold">팀 온보딩/회고 효율 업</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="relative md:pl-12">
                        <div className="leading-none">
                            <p className="font-black tracking-tight text-gray-900 text-[clamp(40px,8vw,120px)]"></p>
                            <p className="font-black tracking-tight text-gray-900 text-[clamp(48px,9vw,140px)]"></p>
                        </div>

                        <div ref={right1Ref} className="absolute top-56 right-2 text-right z-20 opacity-0 w-[min(52vw,980px)]" aria-hidden="true">
                            <h2 className="text-black font-semibold tracking-tight leading-[0.9] text-[clamp(36px,7.2vw,96px)]">
                                <span className="block"># 커밋 요약이</span>
                                <span className="block">자동으로 생성</span>
                            </h2>
                            <p className="text-black leading-tight text-[clamp(16px,2.2vw,28px)] mt-10">PR 설명·체인지로그를 더 빨리, 더 일관되게.</p>
                        </div>

                        <div ref={right2Ref} className="absolute top-60 right-2 text-right z-20 opacity-0" aria-hidden="true">
                            <p className="text-black font-semibold text-lg md:text-6xl"># 리뷰 포인트 자동 추출</p>
                            <p className="text-black text-2xl md:text-3xl mt-1">중요 변경을 놓치지 않게 포커싱.</p>
                        </div>
                        <div ref={right3Ref} className="absolute top-60 right-2 text-right z-20 opacity-0" aria-hidden="true">
                            <p className="text-black font-semibold text-lg md:text-6xl"># 팀 지식 축적이 쉬워짐</p>
                            <p className="text-black text-2xl md:text-3xl mt-1">온보딩/회고/문서화까지 한 번에.</p>
                        </div>
                    </div>
                </div>

                {/* 인디케이터 */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 text-sm z-30">
                    <div className="flex flex-col items-center">
                        <span className="mb-2 text-xs opacity-60">Scroll to animate</span>
                        <div className="w-5 h-8 border border-gray-300 rounded-full flex justify-center opacity-60">
                            <div className="w-0.5 h-2 bg-gray-400 rounded-full mt-1.5"/>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
