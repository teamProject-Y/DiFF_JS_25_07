'use client';

import { useMemo, useState } from 'react';
import { login } from '@/lib/UserAPI';

export default function LoginForm({ callbackUrl = '/DiFF/home/main', afterLoginUriFromPage }) {
    const [values, setValues] = useState({ email: '', loginPw: '' });
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const afterLoginUri = useMemo(() => {
        if (afterLoginUriFromPage) return afterLoginUriFromPage;
        if (typeof window !== 'undefined') return window.location.pathname + window.location.search;
        return callbackUrl;
    }, [afterLoginUriFromPage, callbackUrl]);

    const onChange = (e) => setValues(v => ({ ...v, [e.target.name]: e.target.value }));

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!values.email || !values.loginPw) return setError('이메일와 비밀번호를 입력하세요.');
        try {
            setSubmitting(true);
            const result = await login(values);
            if (result?.resultCode !== 'S-1' || !result?.data1) {
                setError(result?.msg || '로그인 실패');
                setSubmitting(false);
                return;
            }
            localStorage.setItem('tokenType', result.dataName || 'Bearer');
            localStorage.setItem('accessToken', result.data1);
            localStorage.setItem('refreshToken', result.data2 || '');
            window.dispatchEvent(new Event('auth-changed'));
            window.location.replace(afterLoginUri || callbackUrl);
        } catch (err) {
            setError('로그인 실패: 아이디/비밀번호를 확인하세요.');
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="max-w-[460px] mx-auto">
            <div className="text-2xl md:text-3xl font-semibold text-center mb-8">Login</div>
            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

            <input
                type="text"
                name="email"
                value={values.email}
                onChange={onChange}
                placeholder="email"
                className="mb-4 bg-white border border-black text-black text-sm rounded-lg w-full p-3"
                autoComplete="username"
                required
                disabled={submitting}
            />
            <input
                type="password"
                name="loginPw"
                value={values.loginPw}
                onChange={onChange}
                placeholder="Password"
                className="mb-6 bg-white border border-black text-black text-sm rounded-lg w-full p-3"
                autoComplete="current-password"
                required
                disabled={submitting}
            />
            <button
                type="submit"
                className="py-3 w-full text-sm font-medium bg-black text-white rounded-lg hover:bg-neutral-800 transition disabled:opacity-50"
                disabled={submitting}
            >
                {submitting ? 'LOGGING IN…' : 'Login'}
            </button>

            <div className="text-center my-6 flex justify-center gap-6 text-black">
                <a href="/DiFF/member/join" className="hover:underline">Join</a>
                <a href="/DiFF/member/findLoginId" className="hover:underline">Find ID</a>
                <a href="/DiFF/member/findLoginPw" className="hover:underline">Find PW</a>
            </div>
        </form>
    );
}
