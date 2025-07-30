import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function JoinPage() {
    const router = useRouter()
    const [form, setForm] = useState({
        loginId: '',
        loginPw: '',
        checkLoginPw: '',
        name: '',
        nickName: '',
        cellPhone: '',
        email: '',
    })
    const [error, setError] = useState('')

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')

        const { loginId, loginPw, checkLoginPw, name, nickName, cellPhone, email } = form
        if (!loginId.trim()) return setError('아이디를 입력해주세요')
        if (!loginPw.trim()) return setError('비밀번호를 입력해주세요')
        if (loginPw !== checkLoginPw) return setError('비밀번호가 일치하지 않습니다')
        if (!name.trim()) return setError('이름을 입력해주세요')
        if (!nickName.trim()) return setError('닉네임을 입력해주세요')
        if (!cellPhone.trim()) return setError('전화번호를 입력해주세요')
        if (!email.trim() || !email.includes('@')) return setError('유효한 이메일을 입력해주세요')

        try {
            const res = await fetch('http://localhost:8080/api/member/doJoin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form),
            })
            if (res.ok) {
                router.push('/home/main')
            } else {
                const text = await res.text()
                setError(text || '회원가입에 실패했습니다')
            }
        } catch {
            setError('서버 요청 중 오류가 발생했습니다')
        }
    }

    return (
        <div className="container mx-auto mt-12 max-w-min p-4 bg-neutral-200 border border-neutral-300 rounded-lg">
            <div className="title my-3 text-center text-2xl font-semibold">Join</div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
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
                <input name="cellPhone" value={form.cellPhone} onChange={handleChange}
                       className="mb-6 border border-neutral-300 rounded-lg w-96 p-2.5"
                       placeholder="Cell Phone" />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                       className="mb-6 border border-neutral-300 rounded-lg w-96 p-2.5"
                       placeholder="E-mail" />
                <button type="submit"
                        className="py-2.5 px-5 w-96 text-sm font-medium bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700">
                    Join
                </button>
            </form>
            <div className="sub-menu text-center my-4">
                <Link href="/DiFF/member/login">Login</Link>
            </div>
        </div>
    )
}

// _app.js에서 자동으로 Layout 호출됨
JoinPage.pageTitle = 'MEMBER JOIN'
