'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import {signUp} from "@/lib/UserAPI";

export default function JoinPage() {
    const router = useRouter()
    const [form, setForm] = useState({
        loginId: '',
        loginPw: '',
        checkLoginPw: '',
        name: '',
        nickName: '',
        email: '',
    })
    const [error, setError] = useState('')

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')

        const {loginId, loginPw, checkLoginPw, name, nickName, email} = form
        if (!loginId.trim()) return setError('아이디를 입력해주세요')
        if (!loginPw.trim()) return setError('비밀번호를 입력해주세요')
        if (loginPw !== checkLoginPw) return setError('비밀번호가 일치하지 않습니다')
        if (!name.trim()) return setError('이름을 입력해주세요')
        if (!nickName.trim()) return setError('닉네임을 입력해주세요')
        if (!email.trim() || !email.includes('@')) return setError('유효한 이메일을 입력해주세요')

        try {
            const res = await signUp({loginId, loginPw, checkLoginPw, name, nickName, email});

            console.log("🔍 응답 전체:", res);
            const resultCode = res?.resultCode;
            const message = res?.msg || '회원가입에 실패했습니다';

            if (resultCode === 'S-1') {
                console.log('✅ 메인 페이지로 이동합니다!');
                router.push('/DiFF/home/main');
            } else {
                setError(message);
            }


        } catch (e) {
            setError(e.response?.data?.msg || '서버 요청 중 오류가 발생했습니다');
            console.error("회원가입 실패:", e.response?.data || e.message);
        }

    }
        return (
        <div className="container mx-auto mt-12 max-w-min p-4 bg-neutral-200 border border-neutral-300 rounded-lg">
            <div className="title my-3 text-center text-2xl font-semibold">Join</div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col items-center" >
                <input name="loginId" value={form.loginId} onChange={handleChange}
                       className="mb-6 border border-neutral-300 rounded-lg w-96 p-2.5"
                       placeholder="ID" />
                <input type="password" name="loginPw" value={form.loginPw} onChange={handleChange}
                       className="mb-6 border border-neutral-300 rounded-lg w-96 p-2.5"
                       placeholder="Password" />
                <input type="password" name="checkLoginPw" value={form.checkLoginPw} onChange={handleChange}
                       className="mb-6 border border-neutral-300 rounded-lg w-96 p-2.5"
                       placeholder="Password Check" />
                <input name="name" value={form.name} onChange={handleChange}
                       className="mb-6 border border-neutral-300 rounded-lg w-96 p-2.5"
                       placeholder="Name" />
                <input name="nickName" value={form.nickName} onChange={handleChange}
                       className="mb-6 border border-neutral-300 rounded-lg w-96 p-2.5"
                       placeholder="NickName" />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                       className="mb-6 border border-neutral-300 rounded-lg w-96 p-2.5"
                       placeholder="E-mail" />
                <button type="submit"
                        className="py-2.5 px-5 w-96 text-sm font-medium bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700">
                    Join
                </button>
            </form>
            <div className="sub-menu text-center my-4">
                <Link href="/DiFF/member/login/page">Login</Link>
            </div>
        </div>
    )
}

// _app.js에서 자동으로 Layout 호출됨
JoinPage.pageTitle = 'MEMBER JOIN'
