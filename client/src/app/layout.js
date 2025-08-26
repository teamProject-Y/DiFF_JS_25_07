// src/app/layout.js

import Script from 'next/script';
import CommonLayout from '@/common/CommonLayout';
import "./globals.css";

export const metadata = {
    title: "DiFF",
    description: "DiFF",
};

export default function RootLayout({ children, modal }) {
    return (
        <html lang="ko" data-theme="light">
        <head>
            <title>{metadata.title}</title>
        </head>
        <body>
        <CommonLayout>
            {children}
            {modal}
        </CommonLayout>
        </body>
        </html>
    );
}