'use client';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

export default function LoadingOverlay({ show }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted || !show) return null;

    return createPortal(
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 2147483647,
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* 자유롭게 스피너 넣기 */}
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-black border-t-transparent" />
        </div>,
        document.body
    );
}
