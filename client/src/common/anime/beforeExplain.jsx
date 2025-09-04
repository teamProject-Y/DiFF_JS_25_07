'use client';

import React, {useLayoutEffect, useRef} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

// GSAP 플러그인 등록
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const BeforeExplain = () => {
    const containerRef = useRef(null);
    const text1Ref = useRef(null);
    const text2Ref = useRef(null);
    const text3Ref = useRef(null);
    const rightTextRef = useRef(null);
    const rightTextRef2 = useRef(null);

    useLayoutEffect(() => {
        if (typeof window === 'undefined') return;

        const container = containerRef.current;
        const text1 = text1Ref.current;
        const text2 = text2Ref.current;
        const text3 = text3Ref.current;
        const rightText = rightTextRef.current;
        const rightText2 = rightTextRef2.current;

        // 스크롤 컨테이너
        const scrollContainer = document.getElementById('pageScroll');
        if (scrollContainer) ScrollTrigger.defaults({scroller: scrollContainer});

        const disableSnap = () => scrollContainer?.classList.add('snap-disabled');
        const enableSnap = () => scrollContainer?.classList.remove('snap-disabled');
        const disableSmooth = () => scrollContainer?.classList.add('no-smooth');
        const enableSmooth = () => scrollContainer?.classList.remove('no-smooth');

        // 초기 상태

        const q1 = gsap.utils.selector(text1);
        const q2 = gsap.utils.selector(text2);
        const q3 = gsap.utils.selector(text3);

        const bullet1 = q1('.dot')[0];
        const text1Targets = q1('span:not(.dot), li');
        const initialText1Color = text1Targets[0] ? getComputedStyle(text1Targets[0]).color : 'black';
        const initialBullet1Bg  = bullet1 ? getComputedStyle(bullet1).backgroundColor : '#000';

        const bullet2 = q2('.dot2')[0];
        const text2Targets = q2('span:not(.dot2), li');
        const initialText2Color = text2Targets[0] ? getComputedStyle(text2Targets[0]).color : 'black';
        const initialBullet2Bg  = bullet2 ? getComputedStyle(bullet2).backgroundColor : '#000';

        const bullet3 = q3('.dot3')[0];
        const text3Targets = q3('span:not(.dot3), li');
        const initialText3Color = text3Targets[0] ? getComputedStyle(text3Targets[0]).color : 'black';
        const initialBullet3Bg  = bullet3 ? getComputedStyle(bullet3).backgroundColor : '#000';

        gsap.set([text1Targets, text2Targets, text3Targets].filter(el => el && el.nodeType === 1),  { willChange: 'color' });
        gsap.set([bullet1, bullet2, bullet3],      { willChange: 'background-color' });

        // 메인 타임라인 (pin + 텍스트 시퀀스만)
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: 'top top',
                end: '+=500%',       // 카드 구간 삭제했으니 스크롤 길이 축소
                pin: true,
                scrub: 0.5,
                pinSpacing: true,
                scroller: scrollContainer || undefined,
                anticipatePin: 2,
                invalidateOnRefresh: true,
                markers: true,
                onToggle: (self) => self.isActive ? (disableSnap(), disableSmooth()) : (enableSnap(), enableSmooth()),
                onRefresh: (self) => self.isActive ? (disableSnap(), disableSmooth()) : (enableSnap(), enableSmooth()),
            }
        });

        const HOLD1 = 0.5;
        const HOLD2 = 0.5;

        tl
            // ✅ text1 색 변경과 오른쪽 텍스트 등장 동기화
            .add('text1Focus', '+=0.1')
            .to(q1('span, li'), {
                color: '#3b82f6',
                duration: 1.0,
                ease: 'power3.inOut',
                stagger: 0.06
            }, 'text1Focus')
            .to(bullet1, {
                backgroundColor: '#3b82f6',
                duration: 1.2,
                ease: 'power3.inOut'
            }, 'text1Focus')
            .fromTo(rightText,                           // ✅ 동시에 오른쪽 텍스트 등장
                { opacity: 0, x: 30 },
                { opacity: 1, x: 0, duration: 1.0, ease: 'power3.out' },
                'text1Focus'
            )

            // 2) 조금 더 스크롤(HOLD) 후 원래색으로 복귀
            .add('revert1', `+=${HOLD1}`)
            .to(text1Targets, {
                color: initialText1Color,
                duration: 1.0,
                ease: 'power2.inOut'
            }, 'revert1')
            .to(bullet1, {
                backgroundColor: initialBullet1Bg,
                duration: 1.0,
                ease: 'power2.inOut'
            }, 'revert1')
            .to(rightText, {             // 오른쪽 텍스트는 서서히 사라지게(원하면 지워도 됨)
                opacity: 0, y: -20, duration: 0.8, ease: 'power2.inOut'
            }, 'revert1+=0.2')

            // 2번째
            .add('text2Focus', '+=0.3')
            .to(text2Targets, { color: '#3b82f6', duration: 0.9, ease: 'power3.inOut' }, 'revert1')
            .to(bullet2, {
                backgroundColor: '#3b82f6',
                duration: 1.2,
                ease: 'power3.inOut'
            }, 'revert1')
            .fromTo(rightText2,                           // ✅ 동시에 오른쪽 텍스트 등장
                { opacity: 0, x: 30 },
                { opacity: 1, x: 0, duration: 1.0, ease: 'power3.out' },
                'text2Focus'
            )

            // 2번째 사라짐
            .add('revert2', `+=${HOLD2}`)
            .to(text2Targets, { color: initialText2Color, duration: 1.0, ease: 'power2.inOut' }, 'revert2')
            .to(bullet2, {
                backgroundColor: initialBullet2Bg,
                duration: 1.0,
                ease: 'power2.inOut'
            }, 'revert2')
            .to(rightText2, {             // 오른쪽 텍스트는 서서히 사라지게(원하면 지워도 됨)
                opacity: 0, y: -20, duration: 0.8, ease: 'power2.inOut'
            }, 'revert2+=0.2')

            // 3번째
            .add('text3Focus', '+=${HOLD2}')
            .to(text3Targets, { color: '#3b82f6', duration: 0.9, ease: 'power3.inOut' }, 'revert2')
            .to(bullet3, {
                backgroundColor: '#3b82f6',
                duration: 1.2,
                ease: 'power3.inOut'
            }, 'revert2')
            .to({}, { duration: HOLD2 });


        return () => {
            tl.scrollTrigger && tl.scrollTrigger.kill();
            tl.kill();
            enableSnap();
            enableSmooth();
        };
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative w-full h-screen bg-white overflow-hidden"
        >
            {/* 상단 좌/우 UI */}
            <div className="absolute top-6 left-8 z-20 flex items-center gap-3">
                <span className="w-5 h-5 rounded-full border-[6px] border-blue-600"/>
                <span className="text-base md:text-lg font-semibold text-[#2a5cff]">
                    DiFF – Git 히스토리에서 블로그 초안까지
                </span>
            </div>
            <button
                type="button"
                className="absolute top-6 right-8 z-20 px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
            >
                더보기 <span className="ml-1">+</span>
            </button>

            {/* 컨텐츠: 좌(문장+불릿) / 우(거대 해시 타이틀) */}
            <div className="relative z-10 grid h-full grid-cols-1 md:grid-cols-2 items-center gap-10 px-6 md:px-16">
                {/* LEFT */}
                <div className="max-w-2xl">
                    {/* 큰 문장 (text1) */}
                    <div className="mb-10">
                        <h1 className="text-5xl md:text-5xl font-semibold leading-tight text-gray-900">
                            원하시는 조건과 교육 현장의 여건에 따라
                            <br className="hidden md:block"/>
                            맞춤화 교육 설계 및 운영이 가능합니다.
                        </h1>
                    </div>

                    {/* 불릿 리스트 (text1) */}
                    <div ref={text1Ref} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="dot w-2.5 h-2.5 rounded-full bg-black"/>
                            <span className="text-black font-semibold">
                                커밋 요약 자동화
                            </span>
                        </div>
                    </div>

                    {/* 불릿 리스트 (text2) */}
                    <div ref={text2Ref} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="dot2 w-2.5 h-2.5 rounded-full bg-black"/>
                            <span className="text-black font-semibold">
                                수준과 목적에 따른 커리큘럼
                            </span>
                        </div>
                    </div>

                    <div ref={text3Ref} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="dot3 w-2.5 h-2.5 rounded-full bg-black"/>
                            <span className="text-black font-semibold">
                                수준과 목적에 따른 커리큘럼
                            </span>
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="relative md:pl-12">
                    {/* 거대 해시 타이틀 (text3) */}
                    <div className="leading-none">
                        <p className="font-black tracking-tight text-gray-900 text-[clamp(40px,8vw,120px)]">
                            # 수준과 목적에 따른
                        </p>
                        <p className="font-black tracking-tight text-gray-900 text-[clamp(48px,9vw,140px)]">
                            커리큘럼
                        </p>
                    </div>

                    <div
                        ref={rightTextRef}
                        className="absolute top-1/3 right-2 text-right z-20"
                        aria-hidden="true"
                    >
                        <p className="text-black font-semibold text-lg md:text-8xl">
                            커밋 요약이 자동으로 생성
                        </p>
                        <p className="text-black text-5xl md:text-3xl mt-1">
                            PR 설명·체인지로그를 더 빨리, 더 일관되게.
                        </p>
                    </div>

                </div>
            </div>

            {/* 스크롤 인디케이터 */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 text-sm z-30">
                <div className="flex flex-col items-center">
                    <span className="mb-2 text-xs opacity-60">Scroll to animate</span>
                    <div className="w-5 h-8 border border-gray-300 rounded-full flex justify-center opacity-60">
                        <div className="w-0.5 h-2 bg-gray-400 rounded-full mt-1.5"/>
                    </div>
                </div>
            </div>
        </section>
    );

};

export default BeforeExplain;
