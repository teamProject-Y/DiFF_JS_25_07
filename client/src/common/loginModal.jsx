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

            <div className="space-y-4">
                <a
                    href="/login/github"
                    className="flex items-center justify-center gap-3 bg-black text-white py-2.5 px-4 rounded hover:bg-neutral-800 transition w-[min(420px,90%)] mx-auto"
                >
                    <svg viewBox="0 0 16 16" aria-hidden="true" className="w-5 h-5 fill-current">
                        <path d="M8 0C3.58 0 0 3.64 0 8.13c0 3.6 2.29 6.65 5.47 7.73.4.08.55-.18.55-.39 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.5-2.69-.96-.09-.23-.48-.96-.82-1.16-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.22 1.87.87 2.33.66.07-.53.28-.87.51-1.07-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.84A7.5 7.5 0 0 1 8 3.88c.68 0 1.36.09 2 .26 1.53-1.06 2.2-.84 2.2-.84.44 1.1.16 1.92.08 2.12.51.57.82 1.3.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.25.54.74.54 1.5 0 1.08-.01 1.95-.01 2.22 0 .21.15.47.55.39A8.14 8.14 0 0 0 16 8.13C16 3.64 12.42 0 8 0z"/>
                    </svg>
                    <span>Sign in with GitHub</span>
                </a>

                <a
                    href="/login/google"
                    className="flex items-center justify-center gap-3 border border-black text-black bg-white py-2.5 px-4 rounded w-[min(420px,90%)] mx-auto"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                    <span>Sign in with Google</span>
                </a>
            </div>
        </form>
    );
}
