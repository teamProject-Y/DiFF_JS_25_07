// src/common/thema.js
'use client';

import {useEffect, useState} from "react";

export default function ThemeToggle() {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        if (localStorage.theme === 'dark') {
            document.documentElement.classList.add('dark');
            setDark(true);
        }
    }, []);

    const toggleDark = () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.theme = isDark ? 'dark' : 'light';
        setDark(isDark);
    };

    return (
        <label className="inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={dark}
                onChange={toggleDark}
                className="sr-only peer"
            />
            <div className="relative
      relative w-[88px] h-[48px]
      bg-gray-200 rounded-full peer dark:bg-gray-700
      peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
      after:content-[''] after:absolute after:top-[4px] after:start-[4px]
      after:bg-white after:rounded-full after:h-[40px] after:w-[40px]
      after:transition-all peer-checked:bg-gray-600 dark:peer-checked:bg-gray-600
      after:border-0">
                {dark? <i className="z-50 absolute top-[30%] left-[60%] fa-solid fa-moon"></i>
                    : <i className="z-50 absolute top-[30%] left-[13%] fa-solid fa-sun"></i>}
            </div>
            <span className="ms-4 text-lg font-medium text-gray-900 dark:text-gray-300">
  </span>
        </label>

    );
}
