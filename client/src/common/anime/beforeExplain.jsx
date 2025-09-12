'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

function clamp01(v) { return Math.max(0, Math.min(1, v)); }

export default function BeforeExplain() {
    const wrapRef   = useRef(null);
    const text1Ref  = useRef(null);
    const text2Ref  = useRef(null);
    const text3Ref  = useRef(null);
    const right1Ref = useRef(null);
    const right2Ref = useRef(null);
    const right3Ref = useRef(null);

    const prevInlineSnapRef = useRef(null);

    useEffect(() => {
        const scroller = document.getElementById('pageScroll');
        const wrap = wrapRef.current;
        if (!scroller || !wrap) return;

        const setSnapDisabled = (disabled) => {
            if (disabled) {
                if (prevInlineSnapRef.current == null) {
                    prevInlineSnapRef.current = scroller.style.scrollSnapType || '';
                }
                scroller.style.scrollSnapType = 'none';
                scroller.style.webkitScrollSnapType = 'none';
            } else {
                const prev = prevInlineSnapRef.current ?? '';
                scroller.style.scrollSnapType = prev;
                scroller.style.webkitScrollSnapType = prev;
                prevInlineSnapRef.current = null;
            }
        };

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

            // const activePin = y >= wrapTop && y < (wrapTop + (wrapHeight - viewH));
            // scroller.classList.toggle('snap-none', activePin);

            const sets = [
                { text: text1Ref.current, dot: '.dot',  active: step === 0 },
                { text: text2Ref.current, dot: '.dot2', active: step === 1 },
                { text: text3Ref.current, dot: '.dot3', active: step === 2 },
            ];

            sets.forEach(({ text, dot, active }) => {
                if (!text) return;
                const bullet = text.querySelector(dot);
                const spans = text.querySelectorAll('span:not(.dot):not(.dot2):not(.dot3), li');
                bullet && bullet.classList.toggle('bg-blue-600', active);
                bullet && bullet.classList.toggle('bg-black', !active);
                spans.forEach(el => {
                    el.classList.toggle('text-blue-600', active);
                    el.classList.toggle('text-black', !active);
                });
            });

            const rights = [right1Ref.current, right2Ref.current, right3Ref.current];
            rights.forEach((el, i) => {
                if (!el) return;
                const on = (i === step);
                el.style.opacity = on ? '1' : '0';
                el.style.transform = on ? 'translateY(0px)' : 'translateY(-15px)';
                el.style.transition = 'opacity 300ms ease, transform 300ms ease';

                el.classList.toggle('pointer-events-auto', on);
                el.classList.toggle('pointer-events-none', !on);

                el.setAttribute('aria-hidden', on ? 'false' : 'true');
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

        // 뷰포트 리사이즈 시에도 업데이트 (폰트/레이아웃 반응)
        const onResize = () => update();
        window.addEventListener('resize', onResize);

        return () => {
            scroller.removeEventListener('scroll', onScroll);
            ro.disconnect();
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <section ref={wrapRef} className="relative w-full h-[300vh] bg-white overflow-visible snap-start snap-always">
            <div className="sticky top-0 h-screen">
                <div className="relative z-10 grid h-full md:grid-cols-[1.05fr_1fr] items-start gap-10 px-8 md:px-20 pt-20 max-w-[1400px] mx-auto">
                    {/* LEFT */}
                    <div className="max-w-none text-black">
                        <div className="space-y-12">
                            <div className="flex items-center gap-3">
                                <span className="w-5 h-5 rounded-full border-[6px] border-blue-600" />
                                <span className="text-[clamp(14px,1.6vw,18px)] font-bold text-blue-600">
                                  DiFF — From Git history to blog draft
                                </span>
                            </div>

                            {/* 메인 타이틀 */}
                            <h1 className="font-bold leading-[1.08] text-[clamp(28px,5vw,54px)] tracking-tight">
                                <span className="block break-keep whitespace-normal md:whitespace-nowrap">
                                  당신의&nbsp;<span className="text-blue-600">개발 기록</span>을
                                </span>
                                <span className="block break-keep whitespace-normal md:whitespace-nowrap mt-4">
                                  <span className="bg-blue-600 text-white">콘텐츠</span>로 바꿔주는 스마트 워크플로우
                                </span>
                            </h1>
                        </div>

                        {/* 왼쪽 단계 타이틀 */}
                        <div ref={text1Ref} className="space-y-4 mt-10">
                            <div className="flex items-center gap-3">
                                <span className="dot w-2.5 h-2.5 rounded-full bg-black" />
                                <span className="font-bold text-[clamp(16px,2.3vw,22px)]">Draft from CLI or Commit</span>
                            </div>
                        </div>
                        <div ref={text2Ref} className="space-y-4 mt-5">
                            <div className="flex items-center gap-3">
                                <span className="dot2 w-2.5 h-2.5 rounded-full bg-black" />
                                <span className="font-bold text-[clamp(16px,2.3vw,22px)]">Repo-Native Blogging</span>
                            </div>
                        </div>
                        <div ref={text3Ref} className="space-y-4 mt-5">
                            <div className="flex items-center gap-3">
                                <span className="dot3 w-2.5 h-2.5 rounded-full bg-black" />
                                <span className="font-bold text-[clamp(16px,2.3vw,22px)]">Code Quality Insights</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="relative md:pl-10 mt-10">
                        {/* 중앙 빈 타이핑용 라인 유지 (원하면 같은 방식으로 clamp 추가 가능) */}
                        <div className="leading-none">
                            <p className="font-black tracking-tight text-gray-900 text-[clamp(32px,8vw,96px)]"></p>
                            <p className="font-black tracking-tight text-gray-900 text-[clamp(36px,9vw,108px)]"></p>
                        </div>

                        {/* STEP 1 */}
                        <div
                            ref={right1Ref}
                            className="absolute top-52 right-2 text-right z-20 opacity-0 w-[min(52vw,980px)] pointer-events-none"
                            aria-hidden="true"
                        >

                            <h2 className="font-semibold tracking-tight leading-[1.0] text-[clamp(30px,7.2vw,84px)]">
                                <span className="block break-keep whitespace-normal md:whitespace-nowrap"># 숨쉬기보다 쉬운</span>
                                <span className="block break-keep whitespace-normal md:whitespace-nowrap">&nbsp;블로그 쓰기</span>
                            </h2>

                            <p className="leading-tight text-[clamp(14px,2.1vw,24px)] mt-6">
                                CLI 한 줄, 커밋 하나로 블로그 초안이 완성.
                            </p>

                            <div className="flex justify-end">
                                <Link
                                    href="/DiFF/docs/intro"
                                    className="mt-5 inline-flex items-center px-4 py-2 rounded-full border border-blue-600 text-blue-600 text-[clamp(12px,1.6vw,14px)] hover:bg-blue-100"
                                    role="button"
                                >
                                    more <span className="ml-1">+</span>
                                </Link>
                            </div>
                        </div>

                        {/* STEP 2 */}
                        <div
                            ref={right2Ref}
                            className="absolute top-52 right-2 text-right z-20 opacity-0 w-[min(52vw,980px)] pointer-events-none"
                            aria-hidden="true"
                        >
                            <h2 className="font-semibold tracking-tight leading-[1.1] text-[clamp(30px,7.2vw,84px)]">
                                <span className="block break-keep whitespace-normal md:whitespace-nowrap"># 눕기보다 쉬운</span>
                                <span className="block break-keep whitespace-normal md:whitespace-nowrap">리포지토리 관리</span>
                            </h2>
                            <p className="leading-tight text-[clamp(14px,2.0vw,22px)] mt-6">
                                리포지토리 별로 글을 작성하고 <br />
                                원격 리포지토리와 연결해 통합하여 관리.
                            </p>
                            <div className="flex justify-end">
                                <Link
                                    href="/DiFF/docs/intro"
                                    className="mt-4 inline-flex items-center px-4 py-2 rounded-full border border-blue-600 text-blue-600 text-[clamp(12px,1.6vw,14px)] hover:bg-blue-100"
                                    role="button"
                                >
                                    more <span className="ml-1">+</span>
                                </Link>
                            </div>
                        </div>

                        {/* STEP 3 */}
                        <div
                            ref={right3Ref}
                            className="absolute top-52 right-2 text-right z-20 opacity-0 w-[min(52vw,980px)] pointer-events-none"
                            aria-hidden="true"
                        >
                            <h2 className="font-semibold tracking-tight leading-[1.1] text-[clamp(30px,7.2vw,84px)]">
                                <span className="block break-keep whitespace-normal md:whitespace-nowrap"># 자는 것보다 쉬운</span>
                                <span className="block break-keep whitespace-normal md:whitespace-nowrap">코드 품질 성장</span>
                            </h2>
                            <p className="leading-tight text-[clamp(14px,2.0vw,22px)] mt-6">
                                글마다 6가지 코드 지표, <br />
                                리포별 성장 그래프까지.
                            </p>
                            <div className="flex justify-end">
                                <Link
                                    href="/DiFF/docs/intro"
                                    className="mt-4 inline-flex items-center px-4 py-2 rounded-full border border-blue-600 text-blue-600 text-[clamp(12px,1.6vw,14px)] hover:bg-blue-100"
                                    role="button"
                                >
                                    more <span className="ml-1">+</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
