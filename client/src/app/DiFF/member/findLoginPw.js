// pages/usr/member/findLoginPw.js
import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function FindLoginPw() {
    const router = useRouter();
    const { afterFindLoginPwUri = '' } = router.query;
    const formRef = useRef();
    const [loginId, setLoginId] = useState('');
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (submitted) return;

        const trimmedId = loginId.trim();
        const trimmedEmail = email.trim();
        if (trimmedId.length === 0) {
            alert('아이디 써라');
            return;
        }
        if (trimmedEmail.length === 0) {
            alert('email 써라');
            return;
        }

        setSubmitted(true);
        alert('메일로 임시 비밀번호를 발송했습니다');
        formRef.current.submit();
    };

    return (
        <>
            <Head>
                <title>LOGIN</title>
            </Head>
            <section className="mt-8 text-xl px-4">
                <div className="mx-auto">
                    <form
                        ref={formRef}
                        action="/api/member/doFindLoginPw"
                        method="POST"
                        onSubmit={handleSubmit}
                    >
                        <input
                            type="hidden"
                            name="afterFindLoginPwUri"
                            value={afterFindLoginPwUri}
                        />
                        <table className="login-box table-box-1 border-collapse border-1 w-full">
                            <tbody>
                            <tr>
                                <th className="p-2">아이디</th>
                                <td>
                                    <input
                                        className="input input-bordered w-full max-w-xs"
                                        autoComplete="off"
                                        type="text"
                                        placeholder="아이디를 입력해주세요"
                                        name="loginId"
                                        value={loginId}
                                        onChange={(e) => setLoginId(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th className="p-2">이메일</th>
                                <td>
                                    <input
                                        className="input input-bordered w-full max-w-xs"
                                        autoComplete="off"
                                        type="text"
                                        placeholder="이메일을 입력해주세요"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th></th>
                                <td>
                                    <button type="submit" className="btn btn-primary">
                                        비밀번호 찾기
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <th></th>
                                <td>
                                    <a
                                        className="btn btn-active btn-ghost"
                                        href="api//member/login"
                                    >
                                        로그인
                                    </a>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </form>
                    <div className="mt-4">
                        <button
                            type="button"
                            className="btn btn-outline"
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
