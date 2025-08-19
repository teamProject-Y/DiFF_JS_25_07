'use client';
import { useEffect, useState } from 'react';

export default function SidebarLayout({ children }) {
    const [show, setShow] = useState(false); // 기본 숨김(깜빡임 방지)

    useEffect(() => {
        try {
            const token = localStorage.getItem('accessToken');
            setShow(Boolean(token));
        } catch (_) {
            setShow(false);
        }
    }, []);

    if (!show) return null;
    return <aside className="
        w-56 shrink-0
        border-r bg-white/90 backdrop-blur
        sticky top-20
        h-[calc(100vh-80px)] overflow-y-auto
      ">{children}</aside>;
}
