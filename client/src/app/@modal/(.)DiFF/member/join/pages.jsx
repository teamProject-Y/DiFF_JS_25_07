'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import JoinModal from '@/common/joinModal';

export default function JoinModalRoute() {
    const router = useRouter();
    const sp = useSearchParams();

    return (
        <JoinModal
            open={true}
            onClose={() => router.back()}
            callbackUrl={sp?.get('callbackUrl') || '/DiFF/home/main'}
            afterLoginUriFromPage={sp?.get('afterLoginUri') || undefined}
        />
    );
}
