// app/DiFF/not-found.jsx
'use client';

import { useEffect } from 'react';
import ErrorScreen from '@/common/screen/errorScreen';

export default function NotFound() {
    useEffect(() => {
        const main = document.querySelector('main');
        if (!main) return;

        const hadDark = main.classList.contains('dark');
        const prevTheme = main.getAttribute('data-theme');
        const prevBg = main.style.backgroundColor;
        const prevScheme = main.style.colorScheme;

        main.classList.add('dark');
        main.setAttribute('data-theme', 'dark');
        main.style.backgroundColor = '#0b0b0b';
        main.style.colorScheme = 'dark';

        return () => {
            if (!hadDark) main.classList.remove('dark');
            if (prevTheme != null) main.setAttribute('data-theme', prevTheme);
            else main.removeAttribute('data-theme');
            main.style.backgroundColor = prevBg;
            main.style.colorScheme = prevScheme;
        };
    }, []);

    return (
        <>
            <style>{`
        .sideMenu { display: none !important; }
        .content  { margin-left: 0 !important; width: 100% !important; }
      `}</style>

            <ErrorScreen
                code="404"
                title="not found"
                message="The page you are looking for might have been removed, had its name changed or is temporarily unavailable."
                homeHref="/DiFF/home/main"
            />
        </>
    );
}
