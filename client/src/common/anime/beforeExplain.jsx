'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// GSAP 플러그인 등록
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const BeforeExplain = () => {
    const containerRef = useRef(null);
    const text1Ref = useRef(null);
    const text2Ref = useRef(null);
    const text3Ref = useRef(null);
    const horizontalRef = useRef(null);
    const cardsContainerRef = useRef(null);

    // 카드 데이터
    const cards = [
        { id: 1, title: "ROBOT EDU", subtitle: "로봇 교육 프로그램", color: "from-blue-500 to-cyan-400" },
        { id: 2, title: "AI LEARNING", subtitle: "인공지능 학습 과정", color: "from-purple-500 to-pink-400" },
        { id: 3, title: "SMART LIVING", subtitle: "스마트 리빙 체험", color: "from-green-500 to-emerald-400" },
        { id: 4, title: "SW BASICS", subtitle: "SW 기초 교육", color: "from-orange-500 to-red-400" },
        { id: 5, title: "LAB ACCESS", subtitle: "실습실 이용", color: "from-indigo-500 to-blue-400" },
        { id: 6, title: "MENTORING", subtitle: "전문가 멘토링", color: "from-yellow-500 to-orange-400" },
        { id: 7, title: "PROJECT", subtitle: "프로젝트 지원", color: "from-pink-500 to-rose-400" }
    ];

    useEffect(() => {
        // SSR 방지
        if (typeof window === 'undefined') return;

        const container = containerRef.current;
        const text1 = text1Ref.current;
        const text2 = text2Ref.current;
        const text3 = text3Ref.current;
        const horizontal = horizontalRef.current;
        const cardsContainer = cardsContainerRef.current;

        // 스크롤 컨테이너 찾기
        const scrollContainer = document.getElementById('pageScroll');

        // 모든 요소 초기 상태 설정
        gsap.set([text1, text2, text3], {
            opacity: 0,
            y: 40
        });

        gsap.set(horizontal, {
            opacity: 0
        });

        // 카드 컨테이너의 전체 너비 계산
        const getScrollAmount = () => {
            const cardsWidth = cardsContainer.scrollWidth;
            return -(cardsWidth - window.innerWidth);
        };

        // 메인 타임라인 - PIN 효과와 부드러운 애니메이션
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: "top top",
                end: "+=500%", // 더 긴 스크롤 길이
                scrub: 1,
                pin: true,
                pinSpacing: true,
                scroller: scrollContainer || undefined,
                anticipatePin: 1,
            }
        });

        // 순차적 텍스트 애니메이션
        tl
            // 첫 번째 텍스트 등장
            .to(text1, {
                opacity: 1,
                y: 0,
                duration: 1.5,
                ease: "power3.out"
            })
            // 첫 번째 텍스트 페이드아웃
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
            // 세 번째 텍스트 페이드아웃 (가로 스크롤 전)
            .to(text3, {
                opacity: 0,
                y: -40,
                duration: 1.5,
                ease: "power3.inOut"
            }, "+=0.3")

            // 가로 스크롤 섹션 등장
            .to(horizontal, {
                opacity: 1,
                duration: 1,
                ease: "power2.out"
            }, "-=0.5")

            // 가로 스크롤 애니메이션
            .to(cardsContainer, {
                x: getScrollAmount,
                duration: 3,
                ease: "none"
            }, "+=0")

            // 가로 스크롤 페이드아웃
            .to(horizontal, {
                opacity: 0,
                duration: 1,
                ease: "power2.out"
            }, "+=0.5");

        // 카드 호버 효과
        const cards = cardsContainer?.querySelectorAll('.card-item');
        cards?.forEach((card) => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });

        // 클린업
        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            cards?.forEach((card) => {
                card.removeEventListener('mouseenter', () => {});
                card.removeEventListener('mouseleave', () => {});
            });
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-screen bg-white relative flex items-center justify-center overflow-hidden">

            {/* 배경 그라디언트 */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-300/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-green-400/10 to-emerald-300/10 rounded-full blur-3xl" />
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

            {/* 가로 스크롤 카드 섹션 */}
            <div ref={horizontalRef} className="absolute inset-0 flex items-center z-20">
                <div ref={cardsContainerRef} className="flex gap-6 px-8" style={{ width: 'max-content' }}>
                    {cards.map((card, index) => (
                        <div
                            key={card.id}
                            className="card-item group relative h-[400px] w-[350px] rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
                            style={{ transformOrigin: 'center center' }}
                        >
                            {/* 그라디언트 배경 */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.color}`} />

                            {/* 카드 내용 */}
                            <div className="absolute inset-0 flex flex-col justify-end p-8">
                                <h3 className="text-3xl font-bold text-white mb-2">
                                    {card.title}
                                </h3>
                                <p className="text-white/80 text-lg">
                                    {card.subtitle}
                                </p>
                            </div>

                            {/* 호버 오버레이 */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                            {/* 카드 번호 */}
                            <div className="absolute top-8 right-8 text-white/30 text-6xl font-bold">
                                {String(index + 1).padStart(2, '0')}
                            </div>
                        </div>
                    ))}

                    {/* 마지막 카드: Course & LAB 통합 */}
                    <div className="card-item relative h-[400px] w-[700px] rounded-2xl overflow-hidden shadow-2xl bg-white p-8 flex items-center gap-8">
                        {/* Course 카드 */}
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
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

                        {/* 연결선 */}
                        <div className="w-16">
                            <svg width="60" height="4">
                                <line x1="0" y1="2" x2="60" y2="2" stroke="#6B7280" strokeWidth="2" strokeDasharray="5,5" />
                            </svg>
                        </div>

                        {/* LAB 카드 */}
                        <div className="flex-1 bg-gray-900 rounded-xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-400 rounded-lg flex items-center justify-center">
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
    );
};

export default BeforeExplain;