'use client';

import ErrorScreen from '@/common/screen/errorScreen';

export default function Error({ error, reset }) {
    // error 객체 내용을 화면에 노출하지는 않고(보안상), 기본 메시지 유지
    return (
        <ErrorScreen
            code="500"
            title="Error"
            message="Something went wrong while rendering this page."
            homeHref="/DiFF/home/main"
            showRetry
            onRetry={() => reset()}
        />
    );
}
