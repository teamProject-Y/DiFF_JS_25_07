'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/UserAPI';

export default function JoinForm() {
    const [form, setForm] = useState({
        email: '',
        nickName: '',
        loginPw: '',
        checkLoginPw: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const onChange = (e) => setForm(v => ({ ...v, [e.target.name]: e.target.value }));

    const validate = () => {
        if (!form.email.trim() || !form.email.includes('@')) return '유효한 이메일을 입력하세요.';
        if (!form.nickName.trim()) return '닉네임을 입력하세요.';
        if (!form.loginPw.trim()) return '비밀번호를 입력하세요.';
        if (form.loginPw !== form.checkLoginPw) return '비밀번호가 일치하지 않습니다.';
        return '';
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const msg = validate();
        if (msg) return setError(msg);

        try {
            setSubmitting(true);
            const { loginPw, checkLoginPw, nickName, email } = form;
            const res = await signUp({ loginPw, checkLoginPw, nickName, email });

            // ✅ 백엔드 응답 구조 맞추기
            const { resultCode, msg: serverMsg, data1: accessToken, data2: refreshToken } = res;

            if (resultCode === 'S-1' && accessToken) {
                // ✅ 토큰 저장 (자동 로그인 상태)
                localStorage.setItem('tokenType', 'Bearer');
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken || '');

                // ✅ 전역 상태 갱신 이벤트 발생
                window.dispatchEvent(new Event('auth-changed'));

                // ✅ 메인 페이지로 강제 이동 (SSR 새로고침 보장)
                window.location.href = '/DiFF/home/main';
            } else {
                setError(serverMsg || '회원가입에 실패했습니다');
                setSubmitting(false);
            }
        } catch (err) {
            setError(err?.response?.data?.msg || '서버 요청 중 오류가 발생했습니다');
            setSubmitting(false);
        }
    };


    return (
        <form onSubmit={onSubmit} className="max-w-[460px] mx-auto">
            <div className="text-2xl md:text-3xl font-semibold text-center mb-8">Join</div>
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

            <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="E-mail"
                className="mb-4 bg-white border border-black text-black text-sm rounded-lg w-full p-3"
                required
                disabled={submitting}
            />
            <input
                name="nickName"
                value={form.nickName}
                onChange={onChange}
                placeholder="닉네임"
                className="mb-4 bg-white border border-black text-black text-sm rounded-lg w-full p-3"
                required
                disabled={submitting}
            />
            <input
                type="password"
                name="loginPw"
                value={form.loginPw}
                onChange={onChange}
                placeholder="비밀번호"
                className="mb-4 bg-white border border-black text-black text-sm rounded-lg w-full p-3"
                required
                disabled={submitting}
            />
            <input
                type="password"
                name="checkLoginPw"
                value={form.checkLoginPw}
                onChange={onChange}
                placeholder="비밀번호 확인"
                className="mb-6 bg-white border border-black text-black text-sm rounded-lg w-full p-3"
                required
                disabled={submitting}
            />

            <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 font-medium bg-black text-white rounded-lg hover:bg-neutral-800 disabled:opacity-60"
            >
                {submitting ? '처리 중…' : '회원가입'}
            </button>

            <div className="text-center mt-6">
                <a href="/DiFF/member/login" className="text-sm font-semibold underline">
                    로그인
                </a>
            </div>
        </form>
    );
}
