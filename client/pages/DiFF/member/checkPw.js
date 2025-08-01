// pages/usr/member/checkPw.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { checkPwUser } from "@/lib/UserAPI";

export default function CheckPw({ loginId }) {
    const router = useRouter();
    const [pw, setPw] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // JWT 기반: accessToken 없으면 로그인 페이지로
        if (typeof window !== 'undefined') {
            if (!localStorage.getItem('accessToken')) {
                router.replace('/DiFF/member/login');
            }
        }
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await checkPwUser({ pw });
            if (data.resultCode === 'S-1') {
                router.back();
            } else {
                setError('비밀번호가 올바르지 않습니다.');
            }
        } catch (e) {
            setError('서버 오류가 발생했습니다.');
        }
    };

    return (
        <>
            <Head>
                <title>CHECKPW</title>
            </Head>
            <hr />
            <section className="mt-24 text-xl px-4">
                <div className="mx-auto">
                    <form onSubmit={handleSubmit}>
                        <table className="w-full border border-neutral-300 border-collapse">
                            <tbody>
                            <tr>
                                <th className="p-2">아이디</th>
                                <td className="text-center p-2">{loginId}</td>
                            </tr>
                            <tr>
                                <th className="p-2">비밀번호</th>
                                <td className="text-center p-2">
                                    <input
                                        type="password"
                                        name="loginPw"
                                        autoComplete="off"
                                        placeholder="비밀번호를 입력해"
                                        required
                                        className="input input-bordered input-primary input-sm w-full max-w-xs"
                                        value={loginPw}
                                        onChange={(e) => setPw(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th></th>
                                <td className="text-center p-2">
                                    <button type="submit" className="btn btn-primary">
                                        확인
                                    </button>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        {error && <div className="text-red-500 text-center mt-2">{error}</div>}
                    </form>
                    <div className="mt-4">
                        <button
                            type="button"
                            className="btn"
                            onClick={() => router.back()}
                        >
                            뒤로가기
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}

