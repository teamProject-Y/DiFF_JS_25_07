// pages/_app.js
import Script from 'next/script'
import Layout from '../common/layout'  // 네가 쓰던 그대로
import { SessionProvider } from "next-auth/react"

export default function App({ Component, pageProps }) {
    const { session, member, ...rest } = pageProps

    return (
        <>
            {/* jQuery를 hydration 전에 불러오기 */}
            <Script
                src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
                strategy="beforeInteractive"
            />

            {/* NextAuth 세션 프로바이더로 감싸기 */}
            <SessionProvider session={session}>
                <Layout member={member}>
                    <Component {...rest} />
                </Layout>
            </SessionProvider>
        </>
    )
}