// src/app/@modal/(.)DiFF/member/login/page.js
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import LoginModal from '@/common/loginModal';

export default function LoginModalRoute() {
    const router = useRouter();
    const sp = useSearchParams();
    return (
        <LoginModal
            open={true}
            onClose={() => router.back()}
            callbackUrl={sp?.get('callbackUrl') || '/DiFF/home/main'}
            afterLoginUriFromPage={sp?.get('afterLoginUri') || undefined}
        />
    );
}
