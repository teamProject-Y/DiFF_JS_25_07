// pages/usr/home/page.js
'use client';

import {useEffect, useRef, useState} from "react";
import dynamic from 'next/dynamic';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';
import Link from "next/link";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import {trendingArticle} from "@/lib/ArticleAPI";

// 동적 import
const SwiperWrapper = dynamic(() => import("swiper/react").then(mod => mod.Swiper), { ssr: false });
const SwiperSlide = dynamic(() => import('swiper/react').then(m => m.SwiperSlide), { ssr: false });

SwiperWrapper.displayName = "SwiperWrapper";
SwiperSlide.displayName = "SwiperSlide";

console.log(SwiperWrapper.displayName);

const OverlayMenu = dynamic(() => import('@/common/overlayMenu'), { ssr: false });
const HamburgerButton = dynamic(() => import('@/common/HamMenu'), { ssr: false });


function parseJwt(token) {
    if (!token) return {};
    try {
        // JWT payload만 추출 (header.**payload**.signature)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return {};
    }
}

/** 마운트 후 localStorage의 accessToken만 확인해서 로그인 여부 결정 (JWT만 사용) */
function useMountedLogin() {
    const [mounted, setMounted] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const t = localStorage.getItem('accessToken');
            if (!t) return setLoggedIn(false);
            // (선택) exp 만료 검사: exp가 있고 만료면 비로그인 취급
            const payload = JSON.parse(atob((t.split('.')[1] || '')));
            if (payload?.exp && payload.exp * 1000 < Date.now()) setLoggedIn(false);
            else setLoggedIn(true);
        } catch {
            setLoggedIn(false);
        }
    }, []);

    return { mounted, loggedIn };
}

// 타자 효과
function Typewriter({text, speed = 30, onDone, className = ""}) {
    const [displayed, setDisplayed] = useState(null); // null일 땐 렌더 안 함

    useEffect(() => {
        let cancelled = false;
        let i = 0;

        setDisplayed(null); // 렌더 차단
        const timeout = setTimeout(() => {
            if (cancelled) return;
            setDisplayed("");
            typeChar();
        }, 0.1);

        function typeChar() {
            if (cancelled) return;
            setDisplayed(text.slice(0, i + 1));
            i++;
            if (i < text.length) {
                setTimeout(typeChar, speed);
            } else {
                onDone?.();
            }
        }

        return () => {
            cancelled = true;
            clearTimeout(timeout);
        };
    }, [text, speed, onDone]);

    if (displayed === null) return null; // 깜빡임 방지
    return <span className={className}>{displayed}</span>;
}


function TypewriterSplit({text, onDone, speed = 30, className = ""}) {
    const [displayed, setDisplayed] = useState("");
    const [done, setDone] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const dotIdx = text.indexOf("...") !== -1 ? text.indexOf("...") + 3 : text.length;
        const base = text.slice(0, dotIdx);

        if (!base || base.length === 0) {
            setDisplayed(text);
            setDone(true);
            onDone?.();
            return;
        }

        let i = 0;

        function typeChar() {
            if (cancelled) return;
            setDisplayed(base.slice(0, i + 1));
            i++;
            if (i < base.length) {
                setTimeout(typeChar, speed);
            } else {
                setTimeout(() => {
                    if (!cancelled) {
                        setDisplayed(text);
                        setDone(true);
                        onDone?.();
                    }
                }, 300);
            }
        }

        setDisplayed("");
        setDone(false);
        typeChar();

        return () => {
            cancelled = true;
        };
    }, [text, speed, onDone]);

    if (done) return null;
    return <span className={className}>{displayed}</span>;
}

// 날짜
function getLoginDate() {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', {weekday: 'short', timeZone: 'Asia/Seoul'});
    const month = now.toLocaleDateString('en-US', {month: 'short', timeZone: 'Asia/Seoul'});
    const date = now.toLocaleDateString('en-US', {day: '2-digit', timeZone: 'Asia/Seoul'});
    const time = now.toLocaleTimeString('en-GB', {hour12: false, timeZone: 'Asia/Seoul'});
    return `${day}\u2009\u2009${month}\u2009\u2009${date}\u2009\u2009${time}`;
}

const LINES = [
    {
        text: `Last\u2009\u2009login:\u2009\u2009${getLoginDate()}\u2009\u2009on\u2009\u2009webtty001`,
        className: "text-green-400 font-bold terminal-font text-2xl md:text-4xl pt-2 break-all"
    }
];

const RESULTS = [
    "User verifying... done.",
    "Analyzing... done.",
    "Making draft... done."
];

/* ───────────────── 로그인 후: Medium 3열 뼈대 ───────────────── */
function LoginMainPage ({ me }) {
    const posts = Array.from({ length: 6 }).map((_, i) => ({
        id: i + 1,
        title: `Sample Title ${i + 1}`,
        preview: "Preview text only for layout. Replace with your data.",
        channelName: "Channel",
        authorName: "Author",
        date: "Jul 22",
        views: 1234,
        comments: 12,
    }));

    return (
        <div className="w-full min-h-screen bg-white text-black">
            <div className="h-screen pt-32">

            {/* 3열 */}
            <div className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-[220px_1fr_300px] gap-8">
                {/* 왼쪽 */}
                <aside className="space-y-6">
                    <nav className="space-y-3 text-gray-700">
                        <a className="block">Home</a>
                        <a className="block">Library</a>
                        <a className="block">Profile</a>
                        <a className="block">Stories</a>
                        <a className="block">Stats</a>
                    </nav>
                    <div className="pt-4 text-sm text-gray-500">
                        <div className="font-semibold mb-2">Following</div>
                        <p>Find more writers and publications to follow.</p>
                    </div>
                </aside>

                {/* 센터 피드 */}
                <main className="space-y-8">
                    <div className="flex items-center gap-6 border-b">
                        {['For you','Featured','Coding','Education','Technology','Programming'].map((t,i)=>(
                            <button key={t} className={`py-4 -mb-px ${i===0?'border-b-2 border-black font-semibold':'text-gray-500'}`}>{t}</button>
                        ))}
                    </div>

                    {posts.map(p => (
                        <article key={p.id} className="flex gap-6 border-b pb-8">
                            <div className="flex-1 space-y-2">
                                <div className="text-sm text-gray-500">in {p.channelName} · by {p.authorName}</div>
                                <h2 className="text-2xl font-extrabold">{p.title}</h2>
                                <p className="text-gray-600">{p.preview}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>{p.date}</span>
                                    <span>👀 {p.views}</span>
                                    <span>💬 {p.comments}</span>
                                    <button className="ml-auto px-3 py-1 rounded-full border">Save</button>
                                </div>
                            </div>
                            <div className="w-[220px] h-[150px] bg-gray-200 rounded-xl" />
                        </article>
                    ))}
                </main>

                {/* 오른쪽 */}
                <aside className="space-y-6">
                    <section className="border rounded-xl p-4">
                        <h3 className="font-semibold mb-3">Staff Picks</h3>
                        <ul className="space-y-3 text-sm text-gray-700">
                            <li>Pick 1</li><li>Pick 2</li><li>Pick 3</li>
                        </ul>
                    </section>
                    <section className="border rounded-xl p-4">
                        <h3 className="font-semibold mb-3">Hashtag</h3>
                        <div className="flex flex-wrap gap-2">
                            {['Data Science','Self Improvement','Writing','Relationships','Politics','Productivity'].map(t=>(
                                <span key={t} className="px-3 py-1 rounded-full border text-sm">{t}</span>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>
            </div>
        </div>
    );
}

export default function Page() {
    const [log, setLog] = useState([]);
    const [step, setStep] = useState(0);
    const [input, setInput] = useState("");
    const [showInput, setShowInput] = useState(false);
    const inputRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [accessToken, setAccessToken] = useState(null);
    const [user, setUser] = useState({email: '', blogName: ''});
    const [currentResultText, setCurrentResultText] = useState(null);
    const [showResultAnim, setShowResultAnim] = useState(false);
    const [lastDoneStep, setLastDoneStep] = useState(-1);
    const [trendingArticles, setTrendingArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    const { mounted, loggedIn } = useMountedLogin();

    const [isClient, setIsClient] = useState(false);

    useEffect(() => setIsClient(true), []);

    useEffect(() => {
        trendingArticle(10, 7)
            .then(res => {
                console.log("서버 응답:", res);
                setTrendingArticles(res.articles);
                setLoading(false);
            })
            .catch(error => {
                console.error('네트워크 오류:', error);
                if (error.response) {
                    console.error('응답 오류:', error.response);
                    if (error.response.status === 400) {
                        console.error('잘못된 요청:', error.response.data);
                    } else if (error.response.status === 500) {
                        console.error('서버 오류:', error.response.data);
                    }

                } else if (error.request) {
                    console.error('요청 오류:', error.request);

                } else {
                    console.error('오류 메시지:', error.message);
                }
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem('accessToken');
            setAccessToken(token);

            if (token) {
                const userInfo = parseJwt(token);
                setUser({
                    email: userInfo.memberEmail,
                    blogName: userInfo.blogName,
                });
            }
        }
    }, []);

    // 단계별 효과
    useEffect(() => {
        if (step < LINES.length) setShowInput(false);
        else if (step === LINES.length) {
            setShowInput(true);
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setShowInput(false);
        }
    }, [step]);

    // 입력 후 로그 쌓기
    useEffect(() => {
        if (step > LINES.length && step <= LINES.length + RESULTS.length) {
            const idx = step - LINES.length - 1;
            setCurrentResultText(RESULTS[idx]);
            setShowResultAnim(true);
        } else {
            setShowResultAnim(false);
            setCurrentResultText(null);
        }
    }, [step]);

    const handleAnimDone = () => {
        if (step <= lastDoneStep) return;

        if (step < LINES.length) {
            setLog(prev => [...prev, LINES[step]]);
        } else if (step > LINES.length && step <= LINES.length + RESULTS.length) {
            const idx = step - LINES.length - 1;
            setLog(prev => [...prev, {
                text: RESULTS[idx],
                className: "text-white font-bold terminal-font text-2xl md:text-4xl mt-4 break-all"
            }]);
        }
        setLastDoneStep(step);
        setStep(prev => prev + 1);
    };

    // 마운트 전에는 렌더 안 함(깜빡임 방지)
    if (!mounted) return null;

    /* ───────────────── 분기: JWT 토큰만 보고 결정 ───────────────── */
    if (loggedIn) {
        return <LoginMainPage me={user} />;
    }

    // 렌더
    return (
        <div className="w-full min-h-screen bg-[#111]">
            <div className="h-screen pt-32">
                <div className="bg-neutral-800 tracking-tight rounded-xl w-4/5 h-4/5 mx-auto overflow-hidden"
                     style={{
                         fontFamily: `'SF-Regular', 'Menlo', 'Consolas', 'Courier New', monospace`,
                         wordBreak: "break-word"
                     }}>
                    <style jsx global>{`
                        .terminal-font {
                            font-family: 'SF-Regular', 'Menlo', 'Consolas', 'Courier New', monospace;
                            line-height: 1.2;
                        }

                        .prompt-input {
                            outline: none;
                            background: transparent;
                            color: #d1d5db;
                            font-size: 2rem;
                            font-family: inherit;
                            font-weight: 1000;
                            width: 80%;
                            min-width: 2ch;
                            border: none;
                            resize: none;
                            line-height: 1.2;
                            white-space: pre-wrap;
                            overflow-wrap: break-word;
                        }
                        
                    `}</style>

                    <div
                        className="flex items-center justify-center h-12 w-full bg-neutral-700 text-white text-center text-xl relative">
                        <div className="absolute flex justify-start w-full ml-3">
                            <div className="w-5 h-5 bg-red-500 rounded-xl m-2"></div>
                            <div className="w-5 h-5 bg-yellow-500 rounded-xl m-2"></div>
                            <div className="w-5 h-5 bg-green-500 rounded-xl m-2"></div>
                        </div>
                        Welcome to DiFF -- - bash - 45 x 7
                    </div>

                    {/*입력 후*/}
                    <div className="pt-6 pl-6 pb-4 text-left terminal-font text-2xl md:text-4xl break-words">
                        {log.map((item, i) => (
                            item.type === "prompt" ? (
                                <div key={i} className="flex flex-wrap items-start pt-4">
                                    <span className="text-green-400 font-bold">user@desktop ~ %&nbsp;</span>
                                    <span className={item.className}
                                          style={{whiteSpace: 'pre-wrap'}}>{item.value}</span>
                                </div>
                            ) : (
                                <div key={i} className={item.className}>{item.text}</div>
                            )
                        ))}

                        {step < LINES.length && (
                            <div className={LINES[step].className}>
                                <Typewriter text={LINES[step].text} speed={30} onDone={handleAnimDone}/>
                            </div>
                        )}

                        {showResultAnim && currentResultText && (
                            <div className="text-white font-bold terminal-font text-2xl md:text-4xl mt-4 break-all">
                                <TypewriterSplit text={currentResultText} speed={30} onDone={handleAnimDone}/>
                            </div>
                        )}
                    </div>

                    {/*입력 전*/}
                    {showInput && (
                        <div
                            className="text-left terminal-font text-2xl md:text-4xl pl-6 break-words flex items-center">
                        <span className="text-green-400 font-bold" style={{whiteSpace: 'nowrap'}}>
                            user@desktop ~ %&nbsp;
                        </span>
                            <textarea
                                ref={inputRef}
                                className="prompt-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        const trimmed = input.trim();
                                        if (!trimmed) return;
                                        setLog(prev => [...prev, {
                                            type: "prompt",
                                            value: trimmed,
                                            className: "text-gray-200 terminal-font text-2xl md:text-4xl break-words"
                                        }]);
                                        setInput("");
                                        setStep(LINES.length + 1);
                                    }
                                }}
                                rows={1}
                                style={{
                                    resize: "none",
                                    background: "transparent",
                                    color: "#d1d5db",
                                    fontSize: "2rem",
                                    fontFamily: "inherit",
                                    width: "80%",
                                    border: "none",
                                    outline: "none",
                                    lineHeight: "1.2",
                                    overflow: "hidden"
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/*trending*/}
            <div className="w-full h-screen bg-blue-500 px-36 py-10">
                <div className="text-5xl text-black font-bold">Trending</div>
                <div className="article-slider h-2/3 w-full mt-16 flex bg-blue-300">
                    {loading ? (
                        <div className="flex justify-between w-full items-start">
                            <div className="w-[30.446%] h-[90%] p-4 bg-white shadow-md rounded-md"></div>
                            <div className="w-[30.446%] h-[90%] p-4 bg-white shadow-md rounded-md"></div>
                            <div className="w-[30.446%] h-[90%] p-4 bg-white shadow-md rounded-md"></div>
                        </div>
                    ) : (
                        isClient && (

                        <SwiperWrapper
                            modules={[Navigation, Pagination, A11y, Autoplay]}
                            spaceBetween={50}
                            loop={true}
                            autoplay={{ delay: 3000 }}
                            slidesPerView={3}
                            navigation
                            pagination={{ clickable: true }}
                            allowTouchMove={true}
                            observer={true}
                            observeParents={true}
                            resizeObserver={true}
                        >
                            {trendingArticles.length > 0 ? (
                                trendingArticles.map((article, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="article-card h-[90%] p-4 bg-white shadow-md rounded-md">
                                            <h3 className="text-xl font-semibold">{article.title}</h3>
                                            <p>{article.extra_writer}</p>
                                            <p className="text-sm text-gray-600">조회수: {article.hits}</p>
                                            <p className="text-sm text-gray-600">작성일: {article.regDate}</p>
                                        </div>
                                    </SwiperSlide>
                                ))
                            ) : (
                                <div>트렌딩 게시물이 없습니다.</div>
                            )}
                        </SwiperWrapper>
                        )
                    )}
                </div>
            </div>

            {/*overlay menu*/}
            <OverlayMenu open={menuOpen} onClose={() => setMenuOpen(false)} userEmail={user.email}
                         blogName={user.blogName}/>
            <div className="pointer-events-none">
                <div className="fixed right-8 bottom-20 z-50 pointer-events-auto">
                    <Link href="/DiFF/member/myPage">
                        <i className="fa-solid fa-power-off text-white text-3xl hover:text-red-500"></i>
                    </Link>
                </div>
                <div className="fixed right-6 bottom-6 z-50 pointer-events-auto">
                    <HamburgerButton open={menuOpen} onClick={() => setMenuOpen(v => !v)}/>
                </div>
            </div>

            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>

        </div>
    );
}

Page.pageTitle = 'MAIN PAGE';
