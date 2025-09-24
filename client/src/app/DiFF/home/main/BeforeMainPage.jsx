'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from "react";

function getLoginDate() {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', {weekday: 'short', timeZone: 'Asia/Seoul'});
    const month = now.toLocaleDateString('en-US', {month: 'short', timeZone: 'Asia/Seoul'});
    const date = now.toLocaleDateString('en-US', {day: '2-digit', timeZone: 'Asia/Seoul'});
    const time = now.toLocaleTimeString('en-GB', {hour12: false, timeZone: 'Asia/Seoul'});
    return `${day}\u2009\u2009${month}\u2009\u2009${date}\u2009\u2009${time}`;
}

function Typewriter({text, speed = 30, onDone, className = ''}) {
    const [displayed, setDisplayed] = useState('');
    const timersRef = useRef([]);

    useEffect(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        setDisplayed('');
        let i = 0;
        const tick = () => {
            setDisplayed(text.slice(0, i + 1));
            i++;
            if (i < text.length) timersRef.current.push(setTimeout(tick, speed));
            else onDone?.();
        };
        timersRef.current.push(setTimeout(tick, 0));

        return () => {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
        };
    }, [text, speed, onDone]);

    return <span className={className} aria-live="polite">{displayed}</span>;
}

function TypewriterDotsThenDone({
                                    text,
                                    speed = 30,
                                    delayMs = 300,
                                    onDone,
                                    className = ''
                                }) {
    const [displayed, setDisplayed] = useState('');
    const timersRef = useRef([]);

    useEffect(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        const triple = text.indexOf('...');
        const ellip = text.indexOf('…');
        const dotEnd =
            triple !== -1 ? triple + 3 :
                (ellip !== -1 ? ellip + 1 : text.length);

        const base = text.slice(0, dotEnd);
        const suffix = ' done.';

        setDisplayed('');
        let i = 0;

        const typeBase = () => {
            setDisplayed(base.slice(0, i + 1));
            i++;
            if (i < base.length) {
                timersRef.current.push(setTimeout(typeBase, speed));
            } else {
                timersRef.current.push(setTimeout(() => {
                    setDisplayed(base + suffix);
                    timersRef.current.push(setTimeout(() => onDone?.(), delayMs));
                }, delayMs));
            }
        };

        timersRef.current.push(setTimeout(typeBase, 0));

        return () => {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
        };
    }, [text, speed, delayMs, delayMs, onDone]);

    return <span className={className} aria-live="polite">{displayed}</span>;
}

function MirrorPrompt({
                          value,
                          onChange,
                          onSubmit,
                          placeholder = 'git mkdraft main',
                          className = '',
                          inputRefExternal
                      }) {
    const taRef = useRef(null);
    useEffect(() => {
        if (typeof inputRefExternal === 'object' && inputRefExternal) {
            inputRefExternal.current = taRef.current;
        }
    }, [inputRefExternal]);
    useEffect(() => {
        taRef.current?.focus({preventScroll: true});
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return;
            e.preventDefault();
            onSubmit?.(value);
        }
    };

    const hasValue = value?.length > 0;

    return (
        <div
            className={`prompt-mirror-wrapper ${className}`}
            onClick={() => taRef.current?.focus()}
            style={{position: 'relative', width: '80%', paddingLeft: '23px'}}
            role="group"
            aria-label="Terminal command input"
        >

            <div
                className="prompt-mirror-text"
                aria-hidden="true"
                style={{
                    pointerEvents: 'none',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.2,
                    fontWeight: 1000,
                    fontSize: '2rem',
                    color: '#d1d5db',
                }}
            >
                {hasValue ? (
                    <>
                        {value}
                        <span className="fake-caret after"/>
                    </>
                ) : (
                    <>
                        <span className="fake-caret before"/>
                        <span className="placeholder text-neutral-500">{placeholder}</span>
                    </>
                )}
            </div>

            <textarea
                ref={taRef}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                autoFocus
                className="sr-only-input"
                style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    color: 'transparent',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    fontSize: '2rem',
                    fontFamily: `'SF-Regular', 'Menlo', 'Consolas', 'Courier New', monospace`,
                    lineHeight: 1.2,
                    width: '100%',
                    height: '100%',
                    caretColor: 'transparent',
                }}
            />
        </div>
    );
}

export default function BeforeMainPage() {

    const [log, setLog] = useState([]);

    const [step, setStep] = useState(0);
    const [input, setInput] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [currentResultText, setCurrentResultText] = useState(null);
    const [showResultAnim, setShowResultAnim] = useState(false);
    const [lastDoneStep, setLastDoneStep] = useState(-1);
    const [error, setError] = useState('');
    const [promptReady, setPromptReady] = useState(false);

    const inputRef = useRef(null);
    const scrollerRef = useRef(null);

    const bottomRef = useRef(null);
    const loginTextRef = useRef(`Last\u2009\u2009login:\u2009\u2009${getLoginDate()}\u2009\u2009on\u2009\u2009webtty001`);

    const LINES = useMemo(() => ([
        {
            text: loginTextRef.current,
            className: 'text-green-400 font-bold terminal-font text-2xl md:text-4xl pt-2 break-all',
        },
    ]), []);

    const PROMPT_PREFIX = 'user@desktop ~ % ';

    useEffect(() => {
        if (step < LINES.length) {
            setShowInput(false);
        } else if (step === LINES.length) {
            setShowInput(true);
            setPromptReady(false);
        } else {
            setShowInput(false);
        }
    }, [step, LINES.length]);

    useEffect(() => {
        if (!showInput || !promptReady) return;
        const t = setTimeout(() => {
            try {
                inputRef.current?.focus({ preventScroll: true });
            } catch {
                inputRef.current?.focus();
            }
        }, 0);
        return () => clearTimeout(t);
    }, [showInput, promptReady]);

    const COMMAND = 'git mkdraft main';
    const RESULTS = [
        'User verifying... done.',
        'Analyzing... done.',
        'Making draft... done.',
    ];

    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        const scrollToBottom = () => {
            bottomRef.current?.scrollIntoView({ block: 'end', inline: 'nearest' });
        };

        scrollToBottom();

        const mo = new MutationObserver(scrollToBottom);
        mo.observe(scroller, { childList: true, subtree: true });

        const ro = new ResizeObserver(scrollToBottom);
        ro.observe(scroller);

        return () => {
            mo.disconnect();
            ro.disconnect();
        };
    }, []);


    useEffect(() => {
        if (step < LINES.length) setShowInput(false);
        else if (step === LINES.length) {
            setShowInput(true);
            requestAnimationFrame(() => {
                try {
                    inputRef.current?.focus({preventScroll: true});
                } catch {
                    inputRef.current?.focus();
                }
            });
        } else {
            setShowInput(false);
        }
    }, [step, LINES.length]);

    useEffect(() => {
        if (!showInput) return;
        const t = setTimeout(() => inputRef.current?.focus({preventScroll: true}), 0);
        return () => clearTimeout(t);
    }, [showInput]);

    useEffect(() => {
        if (step > LINES.length && step <= LINES.length + RESULTS.length) {
            const idx = step - LINES.length - 1;
            setCurrentResultText(RESULTS[idx]);
            setShowResultAnim(true);
        } else {
            setShowResultAnim(false);
            setCurrentResultText(null);
        }
    }, [step, LINES.length, RESULTS]);

    const handleAnimDone = useCallback(() => {
        if (step <= lastDoneStep) return;
        if (step < LINES.length) {
            setLog(prev => [...prev, LINES[step]]);
        } else if (step > LINES.length && step <= LINES.length + RESULTS.length) {
            const idx = step - LINES.length - 1;
            setLog(prev => [...prev, {
                text: RESULTS[idx],
                className: 'text-white font-bold terminal-font text-2xl md:text-4xl mt-4 break-all'
            }]);
        }
        setLastDoneStep(step);
        setStep(prev => prev + 1);
    }, [step, lastDoneStep, LINES, RESULTS]);

    const submitCommand = useCallback((raw) => {
        const trimmed = raw;
        if (trimmed === COMMAND) {
            setError('');
            setLog(prev => [...prev, {
                type: 'prompt',
                value: trimmed,
                className: 'text-gray-200 terminal-font text-2xl md:text-4xl break-words',
            }]);
            setInput('');
            setStep(LINES.length + 1);
        } else {
            setError(`Command must be exactly: ${COMMAND}`);
            setLog(prev => [...prev, {
                type: 'prompt',
                value: raw,
                className: 'text-gray-200 terminal-font text-2xl md:text-4xl break-words',
            }]);
            setInput('');
        }
    }, [COMMAND, LINES.length]);

    return (
        <div
            className="bg-neutral-800 tracking-tight rounded-xl w-4/5 h-4/5 mx-auto overflow-hidden"
            style={{fontFamily: `'SF-Regular', 'Menlo', 'Consolas', 'Courier New', monospace`, wordBreak: 'break-word'}}
        >
            <style jsx global>{`
                .terminal-font {
                    font-family: 'SF-Regular', 'Menlo', 'Consolas', 'Courier New', monospace;
                    line-height: 1.2;
                }
                
                .fake-caret {
                    display: inline-block;
                    width: 0.14em;
                    height: 1.05em;
                    background: #d1d5db;
                    vertical-align: -0.15em;
                    animation: caret-blink 1s steps(1, end) infinite;
                    border-radius: 1px;
                }

                .fake-caret.after {
                    margin-left: 2px;
                }

                .fake-caret.before {
                    margin-right: 6px;
                }
                
                @keyframes caret-blink {
                    50% {
                        opacity: 0;
                    }
                }

                .sr-only-input {
                    caret-color: transparent;
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
                    <div className="w-5 h-5 bg-red-500 rounded-xl m-2"/>
                    <div className="w-5 h-5 bg-yellow-500 rounded-xl m-2"/>
                    <div className="w-5 h-5 bg-green-500 rounded-xl m-2"/>
                </div>
                Welcome to DiFF -- - bash - 45 x 7
            </div>

            <div ref={scrollerRef} id="terminalScroll" className="h-[calc(100%-3rem)] overflow-y-auto">
                <div
                    className="pt-6 pl-6 pb-4 pr-6 text-left terminal-font text-2xl md:text-4xl break-words"
                    role="log"
                    aria-live="polite"
                >
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
                            <TypewriterDotsThenDone
                                text={currentResultText}
                                speed={30}
                                delayMs={1000}
                                postDoneDelayMs={300}
                                onDone={handleAnimDone}
                            />
                        </div>
                    )}
                </div>

                {showInput && (
                    <div className="text-left terminal-font text-2xl md:text-4xl pl-6 pr-6 pb-6 break-words flex items-center">
                        {!promptReady ? (
                            <Typewriter
                                text={PROMPT_PREFIX}
                                speed={30}
                                onDone={() => setPromptReady(true)}
                                className="text-green-400 font-bold"
                            />
                        ) : (
                            <span
                                className="text-green-400 font-bold"
                                style={{ whiteSpace: 'nowrap' }}
                            >
                            {PROMPT_PREFIX}
                        </span>
                        )}

                        {promptReady && (
                            <MirrorPrompt
                                value={input}
                                onChange={(v) => { setInput(v); if (error) setError(''); }}
                                onSubmit={submitCommand}
                                placeholder={COMMAND}
                                inputRefExternal={inputRef}
                            />
                        )}
                    </div>
                )}

                {error && (
                    <div className="px-6 pb-6">
                        <div className="text-red-400 text-lg md:text-2xl font-semibold terminal-font">
                            {error}
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}