'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LoginModal from './LoginModal';

export default function LoginPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const callbackUrl = searchParams?.get('callbackUrl') || '/DiFF/home/main';
    const afterLoginUri = useMemo(() => {
        const p = searchParams?.get('afterLoginUri');
        if (p) return p;
        if (typeof window !== 'undefined') return window.location.pathname + window.location.search;
        return callbackUrl;
    }, [searchParams, callbackUrl]);

    return (
        <>
            {/* 페이지 배경(원하면 제거 가능) */}
            <div className="min-h-screen bg-gradient-to-b from-neutral-300 to-neutral-400" />

            {/* 모달 팝업 */}
            <LoginModal
                open={true}
                onClose={() => router.back?.() ?? router.push('/')}
                callbackUrl={callbackUrl}
                afterLoginUriFromPage={afterLoginUri}
            />
        </>
    );
}
