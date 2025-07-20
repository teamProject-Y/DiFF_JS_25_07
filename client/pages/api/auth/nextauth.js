// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        CredentialsProvider({
            // 1) 로그인 폼에서 전달받을 필드 이름(loginId, loginPw)도 여기에 맞춰줌
            id: "credentials",
            name: "Credentials",
            credentials: {
                loginId: { label: "ID", type: "text" },
                loginPw: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // 2) Spring Boot API 호출
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/DiFF/member/checkLogin`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            loginId: credentials.loginId,
                            loginPw: credentials.loginPw,
                        }),
                    }
                )
                const result = await res.json()
                if (result.resultCode === "S-1") {
                    // API가 돌려준 user 데이터 형태에 맞게 매핑
                    return {
                        id:    result.data.id,
                        name:  result.data.name,
                        email: result.data.email,
                    }
                }
                return null
            },
        }),
    ],

    // 3) 커스텀 로그인 페이지 경로
    pages: {
        signIn: "/DiFF/member/login",
    },

    // 세션 전략
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,

    // 4) JWT · session 콜백 추가 (user.id를 token에 심고, session.user.id로 전달)
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.id = user.id
            return token
        },
        async session({ session, token }) {
            session.user.id = token.id
            return session
        },
    },
})
