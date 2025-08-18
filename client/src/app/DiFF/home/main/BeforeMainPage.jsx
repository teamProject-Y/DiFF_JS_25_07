'use client';

import {useEffect, useRef, useState} from "react";

// 날짜 포맷 (KST)
function getLoginDate() {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Seoul' });
    const month = now.toLocaleDateString('en-US', { month: 'short', timeZone: 'Asia/Seoul' });
    const date = now.toLocaleDateString('en-US', { day: '2-digit', timeZone: 'Asia/Seoul' });
    const time = now.toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Seoul' });
    return `${day}\u2009\u2009${month}\u2009\u2009${date}\u2009\u2009${time}`;
}

// 타자 효과
function Typewriter({ text, speed = 30, onDone, className = '' }) {
    const [displayed, setDisplayed] = useState(null); // null일 땐 렌더 안 함
    useEffect(() => {
        let cancelled = false;
        let i = 0;
        setDisplayed(null);
        const timeout = setTimeout(() => {
            if (cancelled) return;
            setDisplayed('');
            (function typeChar() {
                if (cancelled) return;
                setDisplayed(text.slice(0, i + 1));
                i++;
                if (i < text.length) setTimeout(typeChar, speed);
                else onDone?.();
            })();
        }, 0);
        return () => { cancelled = true; clearTimeout(timeout); };
    }, [text, speed, onDone]);
    if (displayed === null) return null; // 깜빡임 방지
    return <span className={className}>{displayed}</span>;
}

function TypewriterSplit({ text, onDone, speed = 30, className = '' }) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    useEffect(() => {
        let cancelled = false;
        const dotIdx = text.indexOf('...') !== -1 ? text.indexOf('...') + 3 : text.length;
        const base = text.slice(0, dotIdx);
        if (!base || base.length === 0) {
            setDisplayed(text);
            setDone(true);
            onDone?.();
            return;
        }
        let i = 0;
        (function typeChar() {
            if (cancelled) return;
            setDisplayed(base.slice(0, i + 1));
            i++;
            if (i < base.length) setTimeout(typeChar, speed);
            else setTimeout(() => { if (!cancelled) { setDisplayed(text); setDone(true); onDone?.(); } }, 300);
        })();
        return () => { cancelled = true; };
    }, [text, speed, onDone]);
    if (done) return null;
    return <span className={className}>{displayed}</span>;
}

export default function BeforeMainPage() {
    const LINES = [
        {
            text: `Last\u2009\u2009login:\u2009\u2009${getLoginDate()}\u2009\u2009on\u2009\u2009webtty001`,
            className: 'text-green-400 font-bold terminal-font text-2xl md:text-4xl pt-2 break-all',
        },
    ];
    const RESULTS = ['User verifying... done.', 'Analyzing... done.', 'Making draft... done.'];

    const [log, setLog] = useState([]);
    const [step, setStep] = useState(0);
    const [input, setInput] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [currentResultText, setCurrentResultText] = useState(null);
    const [showResultAnim, setShowResultAnim] = useState(false);
    const [lastDoneStep, setLastDoneStep] = useState(-1);
    const inputRef = useRef(null);

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
            setLog(prev => [...prev, { text: RESULTS[idx], className: 'text-white font-bold terminal-font text-2xl md:text-4xl mt-4 break-all' }]);
        }
        setLastDoneStep(step);
        setStep(prev => prev + 1);
    };

    return (
        <div
            className="bg-neutral-800 tracking-tight rounded-xl w-4/5 h-4/5 mx-auto overflow-hidden"
            style={{ fontFamily: `'SF-Regular', 'Menlo', 'Consolas', 'Courier New', monospace`, wordBreak: 'break-word' }}
        >
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

            {/* 터미널 헤더 */}
            <div className="flex items-center justify-center h-12 w-full bg-neutral-700 text-white text-center text-xl relative">
                <div className="absolute flex justify-start w-full ml-3">
                    <div className="w-5 h-5 bg-red-500 rounded-xl m-2" />
                    <div className="w-5 h-5 bg-yellow-500 rounded-xl m-2" />
                    <div className="w-5 h-5 bg-green-500 rounded-xl m-2" />
                </div>
                Welcome to DiFF -- - bash - 45 x 7
            </div>

            {/* 입력 후 로그 */}
            <div className="pt-6 pl-6 pb-4 text-left terminal-font text-2xl md:text-4xl break-words">
                {log.map((item, i) => (
                    item.type === 'prompt' ? (
                        <div key={i} className="flex flex-wrap items-start pt-4">
                            <span className="text-green-400 font-bold">user@desktop ~ %&nbsp;</span>
                            <span className={item.className} style={{ whiteSpace: 'pre-wrap' }}>{item.value}</span>
                        </div>
                    ) : (
                        <div key={i} className={item.className}>{item.text}</div>
                    )
                ))}

                {step < LINES.length && (
                    <div className={LINES[step].className}>
                        <Typewriter text={LINES[step].text} speed={30} onDone={handleAnimDone} />
                    </div>
                )}

                {showResultAnim && currentResultText && (
                    <div className="text-white font-bold terminal-font text-2xl md:text-4xl mt-4 break-all">
                        <TypewriterSplit text={currentResultText} speed={30} onDone={handleAnimDone} />
                    </div>
                )}
            </div>

            {/* 입력 전 */}
            {showInput && (
                <div className="text-left terminal-font text-2xl md:text-4xl pl-6 break-words flex items-center">
          <span className="text-green-400 font-bold" style={{ whiteSpace: 'nowrap' }}>
            user@desktop ~ %&nbsp;
          </span>
                    <textarea
                        ref={inputRef}
                        className="prompt-input"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const trimmed = input.trim();
                                if (!trimmed) return;
                                setLog(prev => [...prev, {
                                    type: 'prompt',
                                    value: trimmed,
                                    className: 'text-gray-200 terminal-font text-2xl md:text-4xl break-words',
                                }]);
                                setInput('');
                                setStep(LINES.length + 1);
                            }
                        }}
                        rows={1}
                        style={{
                            resize: 'none',
                            background: 'transparent',
                            color: '#d1d5db',
                            fontSize: '2rem',
                            fontFamily: 'inherit',
                            width: '80%',
                            border: 'none',
                            outline: 'none',
                            lineHeight: '1.2',
                            overflow: 'hidden',
                        }}
                    />
                </div>
            )}
        </div>
    );
}