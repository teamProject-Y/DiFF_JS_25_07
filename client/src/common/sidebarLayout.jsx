'use client';
import {useEffect, useState} from 'react';
import {usePathname} from "next/navigation";

export default function SidebarLayout({children}) {
    const [show, setShow] = useState(false);
    const [onEditMode, setOnEditMode] = useState(false);

    const pathname = usePathname();

    useEffect(() => {
        if (pathname?.startsWith('/DiFF/article/write') || pathname?.startsWith('/DiFF/article/modify')) {
            setOnEditMode(true);
        }
    }, [pathname]);

    useEffect(() => {
        try {
            const token = localStorage.getItem('accessToken');
            setShow(Boolean(token));
        } catch (_) {
            setShow(false);
        }
    }, []);

    if (!show) return null;
    return <>
        {!onEditMode &&
        <aside className="
        w-56 shrink-0
        border-r bg-white/90 backdrop-blur sticky top-20
        dark:border-neutral-700 dark:bg-neutral-900/90
        h-[calc(100vh-80px)]
      ">{children}</aside>
        }
    </>;
}
