// pages/DiFF/member/login.js
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { signIn, useSession } from "next-auth/react";
import process from "next/dist/build/webpack/loaders/resolve-url-loader/lib/postcss";
import {redirects} from "../../../next.config";

export default function LoginPage() {
    const { status } = useSession();
    const router = useRouter();
    const callbackUrl = router.query.callbackUrl || '/DiFF/home/main'

    useEffect(() => {

        if(status === 'authenticated') {
            router.replace(callbackUrl)
        }
    }, [status, router, callbackUrl])

    const [error, setError] = useState(null)

    // // state - loginId, loginPw
    //  const [loginId, setLoginId] = useState('');
    //  const [loginPw, setloginPw] = useState('');

    // 로컬 로그인
    const onSubmit = async (e) => {
        e.preventDefault()
        const loginId = e.currentTarget.loginId.value
        const loginPw = e.currentTarget.loginPw.value

        const res = await signIn('credentials', {
            redirect: false,
            loginId,
            loginPw,
            callbackUrl,
        })

        if (res?.error) {
            setError(res.error)
        } else {
            router.replace(res.url)
        }

        // await signIn("credentials", {
        //     loginId,
        //     loginPw,
        //     callbackUrl: "/home/main",
        // });
    };

    return (
        <>
            <Head>
                <title>MEMBER LOGIN</title>
                <meta charSet="UTF-8" />
            </Head>

            <div className="container mx-auto mt-32 max-w-min p-4 bg-neutral-200 border border-neutral-300 rounded-lg">
                <div className="title mt-4 mb-8 text-center text-2xl font-semibold">
                    Login
                </div>

                {/* 로그인 실패 메시지 */}
                {error && (
                    <div className="text-red-500 text-center mb-4">
                        ❌ 로그인 실패: 아이디 또는 비밀번호를 확인하세요.
                    </div>
                )}

                <form
                    name="login"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const loginId = e.currentTarget.loginId.value;
                        const loginPw = e.currentTarget.loginPw.value;

                        try {
                            const res = await fetch('/DiFF/member/doLogin', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ loginId, loginPw }),
                                credentials: 'include'
                            });
                            if (!res.ok) throw new Error('로그인 실패');

                            // 로그인 성공
                            router.replace(callbackUrl);
                        } catch (err) {
                            alert(err.message);   // ← alert 띄움
                        }
                    }}
                    className="flex flex-col items-center"
                >
                    <input
                        type="text"
                        name="loginId"

                        //onChange={(e) => setLoginId(e.target.value)}
                        placeholder="ID"
                        className="mb-6 bg-neutral-50 border border-neutral-300 text-neutral-800 text-sm rounded-lg w-96 p-2.5"
                    />
                    <input
                        type="password"
                        name="loginPw"

                        //onChange={(e) => setloginPw(e.target.value)}
                        placeholder="Password"
                        className="mb-6 bg-neutral-50 border border-neutral-300 text-neutral-800 text-sm rounded-lg w-96 p-2.5"
                    />

                    <button
                        type="submit"
                        className="py-2.5 px-5 mb-2 w-96 text-sm font-medium bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700 transition"
                    >
                        Login
                    </button>
                </form>

                <div className="sub-menu text-center my-4 flex justify-center gap-4">
                    <a href="/DiFF/member/join" className="hover:underline">
                        Join
                    </a>
                </div>

                {/* 소셜 로그인 버튼 */}
                <div className="space-y-4">
                    <a
                        href="/login/github"
                        className="flex items-center justify-center gap-3 bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition"
                    >
                        <img
                            src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                            alt="GitHub Logo"
                            className="w-6 h-6"
                        />
                        <span>GitHub로 로그인</span>
                    </a>

                    <a
                        href="/login/google"
                        className="flex items-center justify-center gap-3 gsi-material-button"
                    >
                        <div className="gsi-material-button-state" />
                        <div className="gsi-material-button-content-wrapper flex items-center">
                            <div className="gsi-material-button-icon">
                                {/* 구글 로고 SVG */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 48 48"
                                    className="w-6 h-6"
                                >
                                    <path
                                        fill="#EA4335"
                                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                                    />
                                    <path
                                        fill="#4285F4"
                                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                                    />
                                    <path fill="none" d="M0 0h48v48H0z" />
                                </svg>
                            </div>
                            <span className="gsi-material-button-contents">Sign in with Google</span>
                        </div>
                    </a>
                </div>
            </div>
        </>
    )
}
