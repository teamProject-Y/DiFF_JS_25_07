"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { updatePassword } from "@/lib/UserAPI";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null); // ← 타입 제거

    const strength = useMemo(() => {
        let s = 0;
        if (newPw.length >= 8) s++;
        if (newPw.length >= 12) s++;
        if (/[A-Z]/.test(newPw)) s++;
        if (/[0-9]/.test(newPw) || /[^A-Za-z0-9]/.test(newPw)) s++;
        return Math.min(s, 4);
    }, [newPw]);

    const canSubmit = useMemo(() => {
        if (!token) return false;
        if (loading) return false;
        if (!newPw || !confirmPw) return false;
        if (newPw !== confirmPw) return false;
        return newPw.length >= 8;
    }, [token, loading, newPw, confirmPw]);

    const submit = async () => {
        if (!canSubmit) return;
        setLoading(true);
        setMsg(null);
        try {
            await updatePassword(token, newPw);
            setMsg({ type: "success", text: "Password updated successfully. Go to sign in →" });
            setNewPw("");
            setConfirmPw("");
        } catch (err) {
            const detail =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "A problem occurred while communicating with the server.";
            setMsg({ type: "error", text: String(detail) });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await submit();
    };

    const onKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            submit();
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-300 flex items-center justify-center px-4">
                <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white/70 p-8 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/40 shadow-sm">
                    <div className="mb-2 text-xl font-semibold tracking-tight">Invalid Access</div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">No request token found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-300 flex items-center justify-center px-4">
            <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white/70 p-8 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/40 shadow-sm">
                <header className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight">Set a New Password</h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Please set a secure and memorable password.
                    </p>
                </header>

                <form onSubmit={handleSubmit} onKeyDown={onKeyDown} className="space-y-5">
                    {/* 비밀번호 */}
                    <div className="space-y-2">
                        <label className="pl-3 text-sm uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPw ? "text" : "password"}
                                placeholder="At least 8 letters."
                                value={newPw}
                                onChange={(e) => setNewPw(e.target.value)}
                                className="w-full rounded-xl border border-neutral-300 bg-neutral-100/70 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw((v) => !v)}
                                className="absolute inset-y-0 right-0 px-3 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                aria-label={showPw ? "Hide password" : "Show password"}
                            >
                                {showPw ? "Hide" : "Show"}
                            </button>
                        </div>

                        {/* 강도 게이지 */}
                        <div className="mt-2 mx-2 flex gap-1.5" aria-hidden>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={[
                                        "h-1.5 flex-1 rounded-full transition-all",
                                        i < strength
                                            ? "bg-neutral-700 dark:bg-neutral-300"
                                            : "bg-neutral-300 dark:bg-neutral-700",
                                    ].join(" ")}
                                />
                            ))}
                        </div>
                        <div className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                            Minimum 8 characters • Stronger with uppercase letters, numbers, or symbols
                        </div>
                    </div>

                    {/* 비밀번호 확인 */}
                    <div className="space-y-2">
                        <label className="pl-3 text-sm uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                            Confirm Password
                        </label>
                        <input
                            type={showPw ? "text" : "password"}
                            placeholder="Re-enter your password"
                            value={confirmPw}
                            onChange={(e) => setConfirmPw(e.target.value)}
                            className="w-full rounded-xl border border-neutral-300 bg-neutral-100/70 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100"
                        />
                        {!!confirmPw && newPw !== confirmPw && (
                            <p className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                                Passwords do not match.
                            </p>
                        )}
                    </div>

                    {/* 액션 */}
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="group relative inline-flex w-full items-center justify-center rounded-xl border border-neutral-300 bg-neutral-900 px-4 py-3 text-sm font-medium text-neutral-100 transition-all hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-100 dark:text-neutral-900"
                    >
                        {loading && (
                            <span className="absolute left-4 inline-block h-4 w-4 animate-spin rounded-full border border-neutral-500 border-t-transparent dark:border-neutral-400 dark:border-t-transparent" />
                        )}
                        Change Password
                    </button>
                </form>

                {/* 메시지 */}
                {msg && (
                    <div
                        className={[
                            "mt-5 rounded-xl border px-4 py-3 text-sm",
                            "border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-300",
                        ].join(" ")}
                        role="status"
                    >
                        {msg.text}
                    </div>
                )}
            </div>
        </div>
    );
}
