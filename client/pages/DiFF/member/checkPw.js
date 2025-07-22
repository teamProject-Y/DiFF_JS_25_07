// pages/usr/member/checkPw.js
import { useState, useEffect } from 'react';
import { getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function CheckPw({ loginId }) {
    const { status } = useSession();
    const router = useRouter();
    const [loginPw, setLoginPw] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/api/auth/signin');
        }
    }, [status, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/member/doCheckPw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loginPw }),
        });
        if (res.ok) {
            router.back();
        } else {
            alert('비밀번호가 올바르지 않습니다.');
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
                                        onChange={(e) => setLoginPw(e.target.value)}
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

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);
    if (!session) {
        return {
            redirect: { destination: '/api/auth/signin', permanent: false },
        };
    }

    return {
        props: {
            loginId: session.user.email, // 혹은 session.user.name 등 실제 loginId 필드로 조정
        },
    };
}
