// pages/usr/member/findLoginId.js
import { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function FindLoginId() {
    const router = useRouter();
    const { afterFindLoginIdUri = '' } = router.query;
    const formRef = useRef();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim().length === 0) {
            alert('이름 써라');
            return;
        }
        if (email.trim().length === 0) {
            alert('email 써라');
            return;
        }
        formRef.current.submit();
    };

    return (
        <>
            <Head>
                <title>LOGIN</title>
            </Head>
            <section className="mt-24 text-xl px-4">
                <div className="mx-auto">
                    <form
                        ref={formRef}
                        action="/api/member/doFindLoginId"
                        method="POST"
                        onSubmit={handleSubmit}
                    >
                        <input
                            type="hidden"
                            name="afterFindLoginIdUri"
                            value={afterFindLoginIdUri}
                        />
                        <table className="w-full border border-neutral-300 border-collapse">
                            <tbody>
                            <tr>
                                <th className="p-2">이름</th>
                                <td className="text-center p-2">
                                    <input
                                        className="input input-bordered w-full max-w-xs"
                                        autoComplete="off"
                                        type="text"
                                        placeholder="이름을 입력해주세요"
                                        name="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th className="p-2">이메일</th>
                                <td className="text-center p-2">
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
                                <td className="text-center p-2">
                                    <button className="btn btn-primary" type="submit">
                                        아이디 찾기
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <th></th>
                                <td className="text-center p-2 space-x-2">
                                    <a
                                        className="btn btn-outline btn-primary"
                                        href="/api/member/login"
                                    >
                                        로그인
                                    </a>
                                    <a
                                        className="btn btn-outline btn-success"
                                        href="/api/member/findLoginPw"
                                    >
                                        비밀번호찾기
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
