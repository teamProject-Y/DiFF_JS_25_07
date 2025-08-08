// src/app/layout.js

import Script from 'next/script';
import CommonLayout from '@/common/CommonLayout';

export const metadata = {
    title: "DiFF",
    description: "DiFF",
};

export default function RootLayout({ children }) {
    return (
        <html lang="ko">
        <head>
            {/* 백엔드 정적 리소스 */}
            <link rel="stylesheet" href="/resource/common.css" />
            {/* CDN 스타일 */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
            <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/5.0.0/normalize.min.css" />
            {/* Tailwind 브라우저 플러그인 로드 */}
            <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        </head>
        <body>
        {/* Script로 글로벌 JS 추가 */}
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        <Script src="/resource/common.js" strategy="afterInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js" strategy="afterInteractive" />

        {/* 공통 레이아웃(헤더/페이지 타이틀 등) */}
        <CommonLayout>
            {children}
        </CommonLayout>
        </body>
        </html>
    );
}
