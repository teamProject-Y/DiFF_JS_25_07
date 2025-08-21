// src/app/DiFF/member/login/page.js
'use client';
import LoginForm from '@/common/loginModal';

export default function LoginFullPage() {
    return (
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-6">
            <div className="w-[min(980px,92vw)] rounded-3xl bg-white shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
                <LoginForm />
            </div>
        </div>
    );
}
