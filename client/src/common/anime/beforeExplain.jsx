'use client';

import React, {useEffect, useRef} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

// GSAP 플러그인 등록
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const BeforeExplain = () => {
    const containerRef = useRef(null);
    const pinWrapperRef = useRef(null);
    const text1Ref = useRef(null);
    const text2Ref = useRef(null);
    const text3Ref = useRef(null);
    const courseCardRef = useRef(null);
    const labCardRef = useRef(null);
    const connectionRef = useRef(null);

    useEffect(() => {
        // SSR 방지
        if (typeof window === 'undefined') return;

        const container = containerRef.current;
        const pinWrapper = pinWrapperRef.current;
        const text1 = text1Ref.current;
        const text2 = text2Ref.current;
        const text3 = text3Ref.current;
        const courseCard = courseCardRef.current;
        const labCard = labCardRef.current;
        const connection = connectionRef.current;

        // 스크롤 컨테이너 찾기
        const scrollContainer = document.getElementById('pageScroll');

        // 모든 요소 초기 상태 설정
        gsap.set([text1, text2, text3], {
            opacity: 0,
            y: 40
        });

        gsap.set([courseCard, labCard], {
            opacity: 0,
            scale: 0.85,
            y: 60
        });

        gsap.set(connection, {
            opacity: 0,
            scaleX: 0
        });

        // 메인 타임라인 - PIN 효과와 부드러운 애니메이션
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: "top top",
                end: "+=350%", // 스크롤 길이
                scrub: 0.5, // 더 부드러운 스크롤 반응
                pin: true,
                pinSpacing: false,
                scroller: scrollContainer || undefined,
                anticipatePin: 1,
            }
        });

        // 부드러운 순차적 텍스트 애니메이션
        tl
            // 첫 번째 텍스트 등장
            .to(text1, {
                opacity: 1,
                y: 0,
                duration: 1.5,
                ease: "power3.out"
            })
            // 첫 번째 텍스트 페이드아웃 (더 부드럽게)
            .to(text1, {
                opacity: 0,
                y: -40,
                duration: 1.5,
                ease: "power3.inOut"
            }, "+=0.3")

            // 두 번째 텍스트 등장
            .to(text2, {
                opacity: 1,
                y: 0,
                duration: 1.5,
                ease: "power3.out"
            }, "-=0.8")
            // 두 번째 텍스트 페이드아웃
            .to(text2, {
                opacity: 0,
                y: -40,
                duration: 1.5,
                ease: "power3.inOut"
            }, "+=0.3")

            // 세 번째 텍스트 등장
            .to(text3, {
                opacity: 1,
                y: 0,
                duration: 1.5,
                ease: "power3.out"
            }, "-=0.8")

            // 카드들 부드럽게 등장
            .to(courseCard, {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 2,
                ease: "power3.out"
            }, "+=0.5")

            .to(labCard, {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 2,
                ease: "power3.out"
            }, "-=1.5")

            // 연결선 등장
            .to(connection, {
                opacity: 0.5,
                scaleX: 1,
                duration: 1.5,
                ease: "power2.inOut"
            }, "-=1");

        // 클린업
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <div ref={containerRef} className="relative bg-white" style={{height: '400vh'}}>
            {/* Pin될 wrapper */}
            <div ref={pinWrapperRef}
                 className="h-screen w-full relative flex items-center justify-center overflow-hidden bg-transparent">

                {/* 배경 그라디언트 */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-300/10 rounded-full blur-3xl"/>
                    <div
                        className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-green-400/10 to-emerald-300/10 rounded-full blur-3xl"/>
                </div>

                {/* 텍스트 컨테이너 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8">

                    {/* 첫 번째 텍스트 */}
                    <div ref={text1Ref} className="absolute text-center max-w-4xl">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                            혁신적인 교육의 시작
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600">
                            AI와 로보틱스가 만드는 새로운 학습 경험
                        </p>
                    </div>

                    {/* 두 번째 텍스트 */}
                    <div ref={text2Ref} className="absolute text-center max-w-4xl">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                            맞춤형 커리큘럼 설계
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600">
                            학습자 수준과 목표에 최적화된 교육 과정
                        </p>
                    </div>

                    {/* 세 번째 텍스트 */}
                    <div ref={text3Ref} className="absolute text-center max-w-4xl">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                            원하시는 조건과 교육 현장의 여건에 따라
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600">
                            맞춤화 교육 설계 및 운영이 가능합니다
                        </p>
                    </div>
                </div>

                {/* 카드 컨테이너 */}
                <div className="absolute inset-0 flex items-center justify-center z-20 px-8">
                    <div className="flex flex-col md:flex-row gap-8 items-center">

                        {/* Course 카드 */}
                        <div
                            ref={courseCardRef}
                            className="bg-white rounded-2xl p-6 shadow-2xl backdrop-blur-sm"
                            style={{minWidth: '280px'}}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div
                                    className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">C</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Course</h3>
                                    <p className="text-gray-500 text-sm">교육 과정</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">ROBOT/AI EDU 특강</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Smart Living 체험형 수업</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">SW·AI 기초소양 교과목</span>
                                </div>
                            </div>
                        </div>

                        {/* 연결선 - 애니메이션 제거 */}
                        <div ref={connectionRef} className="hidden md:block origin-left">
                            <svg width="60" height="4">
                                <line x1="0" y1="2" x2="60" y2="2" stroke="#6B7280" strokeWidth="2"
                                      strokeDasharray="5,5"/>
                            </svg>
                        </div>

                        {/* LAB 카드 */}
                        <div
                            ref={labCardRef}
                            className="bg-gray-900 rounded-2xl p-6 shadow-2xl"
                            style={{minWidth: '280px'}}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div
                                    className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-400 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">L</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">로보틱스 LAB</h3>
                                    <p className="text-gray-400 text-sm">실습 환경</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-300">USER</span>
                                </div>
                                <div className="text-xs text-gray-500 ml-4">
                                    실습 환경 제공
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 스크롤 인디케이터 - 정적 버전 */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm z-30">
                    <div className="flex flex-col items-center">
                        <span className="mb-2 text-xs opacity-60">Scroll to animate</span>
                        <div className="w-5 h-8 border border-gray-300 rounded-full flex justify-center opacity-60">
                            <div className="w-0.5 h-2 bg-gray-400 rounded-full mt-1.5"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


            export default BeforeExplain;