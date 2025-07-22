// common/layout.js
"use client"

import Script from 'next/script'
import Head from 'next/head'
import Header from '../common/header'
import { signOut, useSession } from 'next-auth/react'

export default function Layout({ children, pageTitle = 'DiFF' }) {
    const { data: session, status } = useSession()
    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <title>{pageTitle}</title>
                <link rel="stylesheet" href="/resource/common.css" />
                {/* public/resource/common.js 를 불러오려면 */}
                <script src="/resource/common.js" defer />
            </Head>
            {/* 이 안에서만 렌더링 */}
            <div className="text-neutral-600">
                <Header />
                <main>{children}</main>
            </div>
        </>
    )
}