// src/common/theme.js
'use client';

import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.theme;
        const prefersDark =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;

        const isDark = saved ? saved === "dark" : prefersDark;

        const root = document.documentElement;
        root.classList.toggle("dark", isDark);
        root.setAttribute("data-theme", isDark ? "dark" : "light");

        setDark(isDark);
    }, []);

    const toggleDark = () => {
        const root = document.documentElement;
        const nextIsDark = !root.classList.contains('dark');

        root.classList.toggle('dark', nextIsDark);
        root.setAttribute('data-theme', nextIsDark ? 'dark' : 'light');

        const val = nextIsDark ? 'dark' : 'light';
        localStorage.setItem('theme', val);
        document.cookie = 'theme=' + val + '; path=/; max-age=31536000'; // 1년
        setDark(nextIsDark);
    };


    return (
        <label className="swap swap-rotate cursor-pointer">
            <input
                type="checkbox"
                checked={dark}
                onChange={toggleDark}
                className="sr-only"
            />

            {/* sun icon */}
            <svg
                className="swap-off h-10 w-10 fill-current text-yellow-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
            >
                <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5Z" />
            </svg>

            {/* moon icon */}
            <svg
                className="swap-on h-10 w-10 fill-current text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
            >
                <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05Z" />
            </svg>
        </label>
    );
}
