// pages/usr/home/page.js
'use client';

import { useEffect, useRef, useState } from "react";
import HamMenu from "@/common/HamMenu";

// 타자 효과
function Typewriter({ text, speed = 40, onDone, className = "" }) {
    const [displayed, setDisplayed] = useState("");
    useEffect(() => {
        let cancelled = false;
        setDisplayed("");
        function typeChar(i) {
            if (cancelled) return;
            setDisplayed(text.slice(0, i + 1));
            if (i < text.length - 1) {
                setTimeout(() => typeChar(i + 1), speed);
            } else {
                if (onDone) onDone();
            }
        }
        if (text && text.length > 0) typeChar(0);
        return () => { cancelled = true; };
    }, [text, speed, onDone]);
    return <span className={className}>{displayed}</span>;
}


function TypewriterSplit({ text, onDone, speed = 38, className = "" }) {
    const [displayed, setDisplayed] = useState("");
    const dotIdx = text.indexOf("...") !== -1 ? text.indexOf("...") + 3 : text.length;
    useEffect(() => {
        let cancelled = false;
        setDisplayed("");
        const base = text.slice(0, dotIdx);

        function typeChar(i) {
            if (cancelled) return;
            setDisplayed(base.slice(0, i + 1));
            if (i < base.length - 1) {
                setTimeout(() => typeChar(i + 1), speed);
            } else {
                setTimeout(() => {
                    setDisplayed(text);
                    if (onDone) onDone();
                }, 300);
            }
        }
        if (!base || base.length === 0) {
            setDisplayed(text);
            if (onDone) onDone();
            return;
        }
        typeChar(0);
        return () => { cancelled = true; };
    }, [text, dotIdx, speed, onDone]);
    return <span className={className}>{displayed}</span>;
}

// 날짜
function getLoginDate() {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const day = kst.toLocaleDateString('en-US', { weekday: 'short' });
    const month = kst.toLocaleDateString('en-US', { month: 'short' });
    const date = kst.getDate().toString().padStart(2, '0');
    const time = kst.toTimeString().split(' ')[0];
    return `${day} ${month} ${date} ${time}`;
}

export default function Page() {
    const [log, setLog] = useState([]);
    const [step, setStep] = useState(0);
    const [input, setInput] = useState("");
    const [showInput, setShowInput] = useState(false);
    const inputRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const LINES = [
        { text: `Last login: ${getLoginDate()} on webtty001`, className: "text-green-400 font-bold terminal-font text-2xl md:text-4xl break-all" },
        { text: "user@desktop ~ %", className: "text-green-400 font-bold terminal-font text-2xl md:text-4xl break-all" }
    ];
    const RESULTS = [
        "user verifying... done.",
        "zipping... done.",
        "making draft... done."
    ];

    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem('accessToken');
            setAccessToken(token);
        }
    }, []);



    // 단계별 효과
    useEffect(() => {
        if (step < LINES.length) setShowInput(false);
        else if (step === LINES.length) {
            setShowInput(true);
            setTimeout(() => inputRef.current?.focus(), 100);
        } else setShowInput(false);
    }, [step]);

    // 입력 후 로그 쌓기
    useEffect(() => {
        if (!showInput || !input) return;
        const timeout = setTimeout(() => {
            setLog(prev => [
                ...prev,
                {
                    type: "prompt",
                    value: input,
                    className: "text-gray-200 terminal-font text-2xl md:text-4xl break-words"
                }
            ]);
            setInput("");
            setStep(LINES.length + 1);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [input, showInput]);

    // 타자 끝나면 다음
    const handleAnimDone = () => {
        if (step < LINES.length) {
            setLog(prev => {
                setStep(s => s + 1);
                return [...prev, LINES[step]];
            });
        } else if (step > LINES.length && step <= LINES.length + RESULTS.length) {
            const idx = step - LINES.length - 1;
            setLog(prev => {
                setStep(s => s + 1);
                return [...prev, { text: RESULTS[idx], className: "text-white font-bold terminal-font text-2xl md:text-4xl mt-6 break-all" }];
            });
        }
    };

    // 렌더
    return (
        <>
            <div className="w-full min-h-screen bg-[#111] pt-24">
                <div
                    className="bg-black rounded-lg shadow-lg px-8 py-10 w-full max-w-5xl min-h-[60vh] mx-auto"
                    style={{
                        fontFamily: `'Fira Mono', 'Consolas', 'Menlo', 'monospace'`,
                        wordBreak: "break-word"
                    }}
                >
                    <style jsx global>{`
                        .terminal-font {
                            font-family: 'Fira Mono', 'Consolas', 'Menlo', 'monospace';
                            line-height: 1.2;
                        }
                        .prompt-input {
                            outline: none;
                            background: transparent;
                            color: #d1d5db;
                            font-size: 2rem;
                            font-family: inherit;
                            width: 80%;
                            min-width: 2ch;
                            border: none;
                            resize: none;
                            line-height: 1.2;
                            word-break: break-word;
                            white-space: pre-wrap;
                            overflow-wrap: break-word;
                        }
                    `}</style>
                    {/* 로그/애니메이션 */}
                    <div className="text-left terminal-font text-2xl md:text-4xl break-words">
                        {log.map((item, i) =>
                            item.type === "prompt" ? (
                                <div key={i} className="flex flex-wrap items-start">
                                    <span className="text-green-400 font-bold">user@desktop ~ %&nbsp;</span>
                                    <span className={item.className} style={{whiteSpace: 'pre-wrap'}}>{item.value}</span>
                                </div>
                            ) : (
                                <div key={i} className={item.className}>{item.text}</div>
                            )
                        )}

                        {/* 타자효과/애니메이션 */}
                        {step < LINES.length &&
                            <div className={LINES[step].className}>
                                <Typewriter text={LINES[step].text} speed={32} onDone={handleAnimDone} />
                            </div>
                        }

                        {/* 입력창: 프롬프트+contenteditable */}
                        {showInput &&
                            <div className="flex items-center mt-3">
                            <span className="text-green-400 font-bold"
                                  style={{ whiteSpace: 'nowrap' }}>
                                user@desktop ~ %&nbsp;</span>
                                <div
                                    ref={inputRef}
                                    className="prompt-input"
                                    contentEditable
                                    spellCheck={false}
                                    suppressContentEditableWarning
                                    onInput={e => setInput(e.currentTarget.textContent)}
                                    onKeyDown={e => {
                                        // Enter 눌러도 줄바꿈이 아니라 다음 step
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            setInput(e.currentTarget.textContent);
                                        }
                                    }}
                                    style={{
                                        flexGrow: 1,
                                        minHeight: "2.4rem",
                                        maxWidth: "100%"
                                    }}
                                />
                            </div>
                        }

                        {/* 결과 타자 */}
                        {step > LINES.length && step <= LINES.length + RESULTS.length &&
                            <div className="text-white font-bold terminal-font text-2xl md:text-4xl mt-6 break-all">
                                <TypewriterSplit text={RESULTS[step - LINES.length - 1]} speed={32} onDone={handleAnimDone} />
                            </div>
                        }
                    </div>
                    {accessToken && (
                        <div className="fixed right-6 bottom-6 flex flex-col items-end gap-4 z-50">
                            <HamMenu open={menuOpen} onClick={() => setMenuOpen(v => !v)} />
                            <button>
                                <i className="fa-solid fa-user text-white text-2xl"></i>
                            </button>
                        </div>
                    )}
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
        </>
    );
}

Page.pageTitle = 'MAIN PAGE';
