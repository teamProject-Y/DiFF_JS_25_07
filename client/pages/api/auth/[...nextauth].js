// // pages/api/auth/[...nextauth].js
// import NextAuth from "next-auth"
// import GoogleProvider from "next-auth/providers/google"
// import GithubProvider from "next-auth/providers/github"
// import CredentialsProvider from "next-auth/providers/credentials"
//
// export default NextAuth({
//     // CredentialsProvider 등록
//     providers: [ // 서비스 제공자 목록
//         CredentialsProvider({
//             // 로그인 폼에서 전달받을 필드 이름(loginId, loginPw)도 여기에 맞춰줌
//             id: "credentials",
//             name: "Credentials",
//             credentials: {
//                 loginId: { label: "ID", type: "text" },
//                 loginPw: { label: "Password", type: "password" },
//             },
//             async authorize(credentials) {
//                 // Spring Boot JSON 로그인 API 호출
//                 const res = await fetch(
//                     `${process.env.NEXT_PUBLIC_API_BASE_URL}/member/doLogin`,
//                     {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({
//                             loginId: credentials.loginId,
//                             loginPw: credentials.loginPw,
//                         }),
//                         credentials: "include",
//                     }
//                 )
//                 const result = await res.json();
//
//                 if (result.resultCode === "S-1") {
//                     const data = result.data1;
//
//                     // data 안에 id/name/email을 담아서 내려주도록 API 수정 필요
//                     return {
//                         id:    data.id,
//                         name:  data.name,
//                         email: data.email,
//                     }
//                 }
//                 return null;
//             },
//         }),
//     ],
//
//     // 3) 커스텀 로그인 페이지 경로
//     pages: {
//         signIn: "/member/login",
//     },
//
//     secret: process.env.NEXTAUTH_SECRET,
//
//     // 세션 전략
//     session: {
//         strategy: "jwt",
//     },
//     cookies: {
//         sessionToken: {
//             name: 'next-auth.session-token',
//             options: {
//                 httpOnly: true,
//                 sameSite: "lax",
//                 path: "/",
//                 secure: process.env.NODE_ENV === "production",
//             }
//         }
//     },
//
//     // 4) JWT · session 콜백 추가 (user.id를 token에 심고, session.user.id로 전달)
//     callbacks: {
//         async jwt({ token, user }) {
//             if (user) {
//                 token.id = user.id;
//                 token.name = user.name;
//                 token.email = user.email;
//             }
//             return token
//         },
//         async session({ session, token }) {
//             session.user = {
//                 id: token.id,
//                 name: token.name,
//                 email: token.email,
//             };
//             return session;
//         },
//
//         async redirect({ url, baseUrl }) {
//             return baseUrl + "/home/main";
//         },
//     },
//
//
// });
