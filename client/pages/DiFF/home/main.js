// pages/usr/home/main.js
'use client';

import { useEffect, useState, useRef } from 'react';
import { getUsers } from '@/lib/UserAPI';
import * as BCryptPasswordEncoder from "next-auth/jwt";

// 타자
function Typewriter({ text = "", speed = 38, onDone, className = "" }) {
    const [displayed, setDisplayed] = useState("");

    useEffect(() => {
        setDisplayed("");
        let i = 0;
        const interval = setInterval(() => {
            setDisplayed(prev => prev + text[i]);
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                if (onDone) onDone();
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text]);

    return <span className={className}>{displayed}</span>;
}

function getLoginDate() {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);

    // 영어 요일/월/일, 두자리 일자
    const day = kst.toLocaleDateString('en-US', { weekday: 'short' });  // "Mon"
    const month = kst.toLocaleDateString('en-US', { month: 'short' });  // "Aug"
    const date = kst.getDate().toString().padStart(2, '0');

    // 시:분:초 (24시간제)
    const time = kst
        .toTimeString()
        .split(' ')[0]; // "13:14:15"

    return `${day} ${month} ${date} ${time}`;
}

export default function Main() {
    const [log, setLog] = useState([]);
    const [step, setStep] = useState(0); // 0: 타자, 1: 입력, 2: 결과
    const [input, setInput] = useState("");
    const [showInput, setShowInput] = useState(true);
    const inputRef = useRef(null);

    const LINES = [
        { text: `Last login: ${getLoginDate()} on webtty001`, className: "text-green-400 font-bold text-3xl md:text-5xl" },
        { text: "user@desktop ~ %", className: "text-green-400 font-bold text-3xl md:text-5xl" }
    ];

    const RESULTS = [
        "user verifying... done.",
        "zipping... done.",
        "making draft... done."
    ];

    // 단계별 효과
    useEffect(() => {
        if (step < LINES.length) {
            // 로그 타자 효과
            setShowInput(false);
        } else if (step === LINES.length) {
            setShowInput(true);
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setShowInput(false);
        }
    }, [step]);

    // 입력
    useEffect(() => {
        if (!showInput || !input) return;
        const timeout = setTimeout(() => {
            setLog(prev => [
                ...prev,
                { text: `${input}`, className: "text-gray-300 font-mono text-3xl md:text-5xl" }
            ]);
            setInput("");
            setStep(LINES.length + 1);
        }, 1200);
        return () => clearTimeout(timeout);
    }, [input, showInput]);

    // 결과 타자 애니 끝나면 다음 줄
    const handleAnimDone = () => {
        // 단계별 log에 누적!
        if (step < LINES.length) {
            setLog(prev => [...prev, LINES[step]]);
        } else if (step > LINES.length && step <= LINES.length + RESULTS.length) {
            const idx = step - LINES.length - 1;
            setLog(prev => [...prev, { text: RESULTS[idx], className: "text-white font-bold text-3xl md:text-5xl mt-6" }]);
        }
        setStep(s => s + 1);
    };

    // 로그에 쌓인 + 타자 중인 줄을 렌더링
    const getDisplayLines = () => {
        // (로그) + (타자중 라인)
        let lines = [...log];
        // 타자 단계일 때 마지막 라인 Typewriter로 출력
        if (step < LINES.length) {
            lines.push({ type: "typewriter", ...LINES[step] });
        }
        // 결과 타자 단계
        if (step > LINES.length && step <= LINES.length + RESULTS.length) {
            const idx = step - LINES.length - 1;
            lines.push({ type: "typewriter", text: RESULTS[idx], className: "text-white font-bold text-3xl md:text-5xl mt-6" });
        }
        return lines;
    };


    return (
        <div className="w-full min-h-screen bg-[#111] pt-24">
            <div className="bg-black rounded-lg shadow-lg p-8 w-full max-w-5xl min-h-[70vh] mx-auto">
                <div className="text-left font-mono break-words">
                    {getDisplayLines().map((item, i) =>
                        item.type === "typewriter"
                            ? (
                                <div key={i} className={item.className}>
                                    <Typewriter text={item.text} speed={32} onDone={handleAnimDone} />
                                </div>
                            )
                            : (
                                <div key={i} className={item.className}>{item.text}</div>
                            )
                    )}
                    {/* 입력창 */}
                    {showInput &&
                        <div className="flex items-center mt-3">
                            <span className="text-gray-200 font-mono text-3xl md:text-5xl"> </span>
                            <input
                                ref={inputRef}
                                className="bg-transparent outline-none text-gray-300 font-mono pl-2 text-3xl md:text-5xl"
                                style={{ width: 440, border: "none" }}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                autoFocus
                                spellCheck={false}
                                placeholder=""
                            />
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

// _app.js 쪽에서 꺼내 쓸 pageTitle 정의
Main.pageTitle = 'MAIN PAGE'