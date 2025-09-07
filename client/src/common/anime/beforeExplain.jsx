'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

const clamp01 = (v) => Math.max(0, Math.min(1, v));

// scroller 좌표계 기준의 절대 top(px)
function absTop(el, scroller) {
    const er = el.getBoundingClientRect();
    const sr = scroller.getBoundingClientRect();
    return er.top - sr.top + scroller.scrollTop;
}

export default function BeforeExplain({
                                          scrollerId = 'pageScroll',
                                          startOffsetPx = 0,     // 수동 오프셋(옵션). 자동이 알아서 잡으니 기본 0으로 둬도 됨.
                                          endExtraPx   = 0       // 끝 구간 늘리고 싶을 때만 사용
                                      }) {
    const wrapRef   = useRef(null); // h-[350vh] 래퍼
    const text1Ref  = useRef(null);
    const text2Ref  = useRef(null);
    const text3Ref  = useRef(null);
    const right1Ref = useRef(null);
    const right2Ref = useRef(null);
    const right3Ref = useRef(null);

    useEffect(() => {
        const scroller = document.getElementById(scrollerId);
        const wrap = wrapRef.current;
        if (!scroller || !wrap) return;

        let raf = 0;

        const update = () => {
            const viewH      = scroller.clientHeight;
            const y          = scroller.scrollTop;

            // 기준 위치들을 모두 "scroller 기준 절대좌표"로 변환
            const wrapTopAbs   = absTop(wrap, scroller);
            const docsEl       = document.getElementById('docs');
            const docsTopAbs   = docsEl ? absTop(docsEl, scroller) : 0;

            // 섹션(docs) 꼭대기와 래퍼 사이의 "실제" 선행 갭
            const leadingGap   = Math.max(0, wrapTopAbs - docsTopAbs);

            // 뷰포트 비율 기반 오프셋(66% 권장)과 실제 선행 갭, 사용자가 준 수동 오프셋 중 가장 큰 값 사용
            const dynOffset    = leadingGap + 1 + (startOffsetPx || 0);

            // 시작/끝 결정: docs에 스냅되자마자 progress가 즉시 올라가도록 start를 wrapTopAbs - dynOffset로 당김
            const start        = wrapTopAbs - dynOffset;
            const end          = wrapTopAbs + (wrap.scrollHeight - viewH) + endExtraPx;
            const span         = Math.max(1, end - start);

            const progress     = clamp01((y - start) / span);

            // 단계 분기
            let step = 0;
            if (progress >= 2/3) step = 2;
            else if (progress >= 1/3) step = 1;

            // "핀 비슷한 구간"에서는 스냅 잠깐 끄기(충돌 방지)
            const activePin = y >= start && y < end;
            scroller.classList.toggle('snap-disabled', activePin);

            // 좌측 불릿/텍스트 컬러 토글
            const sets = [
                { text: text1Ref.current, dot: '.dot',  active: step === 0 },
                { text: text2Ref.current, dot: '.dot2', active: step === 1 },
                { text: text3Ref.current, dot: '.dot3', active: step === 2 },
            ];
            sets.forEach(({ text, dot, active }) => {
                if (!text) return;
                const bullet = text.querySelector(dot);
                const spans  = text.querySelectorAll('span:not(.dot):not(.dot2):not(.dot3), li');
                if (bullet) {
                    bullet.classList.toggle('bg-blue-500', active);
                    bullet.classList.toggle('bg-black', !active);
                }
                spans.forEach(el => {
                    el.classList.toggle('text-blue-500', active);
                    el.classList.toggle('text-black', !active);
                });
            });

            // 우측 문구 교체
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
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(update);
        };

        // 초기 1회(이미 docs 위 스페이스가 있어도 즉시 보정)
        update();
        scroller.addEventListener('scroll', onScroll, { passive: true });

        // 레이아웃 변동(폰트 로드/이미지 등)에도 재계산
        const ro = new ResizeObserver(() => update());
        ro.observe(wrap);

        return () => {
            cancelAnimationFrame(raf);
            scroller.removeEventListener('scroll', onScroll);
            ro.disconnect();
            scroller.classList.remove('snap-disabled');
        };
    }, [scrollerId, startOffsetPx, endExtraPx]);

    return (
        <section ref={wrapRef} className="relative w-full h-[350vh] bg-white overflow-visible">
            <div className="sticky top-0 h-screen">
                <Link
                    href="/DiFF/docs/intro"
                    className="absolute top-6 right-8 z-20 px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 inline-flex items-center"
                    role="button"
                >
                    더보기 <span className="ml-1">+</span>
                </Link>

                <div className="relative z-10 grid h-full md:grid-cols-[1.05fr_1fr] items-start gap-12 px-8 md:px-20 pt-16 max-w-[1400px] mx-auto">
                    {/* LEFT */}
                    <div className="max-w-none">
                        <div className="space-y-20">
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
                                <span className="text-black font-semibold">블로그 초안 생성</span>
                            </div>
                        </div>
                        <div ref={text3Ref} className="space-y-4 mt-6">
                            <div className="flex items-center gap-3">
                                <span className="dot3 w-2.5 h-2.5 rounded-full bg-black"/>
                                <span className="text-black font-semibold">코드 품질 점수화</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="relative md:pl-12">
                        <div className="leading-none">
                            <p className="font-black tracking-tight text-gray-900 text-[clamp(40px,8vw,120px)]"></p>
                            <p className="font-black tracking-tight text-gray-900 text-[clamp(48px,9vw,140px)]"></p>
                        </div>

                        <div ref={right1Ref} className="absolute top-64 right-2 text-right z-20 opacity-0 w-[min(52vw,980px)]" aria-hidden="true">
                            <h2 className="text-black font-semibold tracking-tight leading-[1.1] text-[clamp(36px,7.2vw,96px)]">
                                <span className="block"># 커밋 요약이</span>
                                <span className="block">자동으로 생성</span>
                            </h2>
                            <p className="text-black leading-tight text-[clamp(16px,2.2vw,28px)] mt-10">귀찮은 commit review를 요약해줍니다.</p>
                        </div>

                        <div ref={right2Ref} className="absolute top-64 right-2 text-right z-20 opacity-0 w-[min(52vw,980px)]" aria-hidden="true">
                            <h2 className="text-black font-semibold tracking-tight leading-[1.1] text-[clamp(36px,7.2vw,96px)]">
                                <span className="block"># 블로그 초안을</span>
                                <span className="block">자동으로 생성</span>
                            </h2>
                            <p className="text-black leading-tight text-[clamp(16px,2.2vw,28px)] mt-10"> GPT가 글 뼈대를 자동으로 작성.</p>
                        </div>

                        <div ref={right3Ref} className="absolute top-64 right-2 text-right z-20 opacity-0 w-[min(52vw,980px)]" aria-hidden="true">
                            <h2 className="text-black font-semibold tracking-tight leading-[1.1] text-[clamp(36px,7.2vw,96px)]">
                                <span className="block"># 코드 품질을</span>
                                <span className="block">점수로</span>
                            </h2>
                            <p className="text-black leading-tight text-[clamp(16px,2.2vw,28px)] mt-10">코드 변화의 품질을 정량적으로 계산..</p>
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
