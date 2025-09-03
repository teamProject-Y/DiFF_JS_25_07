"use client";

import { useMemo, useState } from "react";
import { requestPasswordReset } from "@/lib/UserAPI";

export default function FindPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    const canSubmit = useMemo(() => {
        if (loading) return false;
        if (!email) return false;
        return /\S+@\S+\.\S+/.test(email);
    }, [email, loading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setLoading(true);
        setMsg(null);
        try {
            await requestPasswordReset(email);
            setMsg({ type: "success", text: "Password reset email sent. Please check your inbox." });
            setEmail("");
        } catch (err) {
            const detail =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Server error";
            setMsg({ type: "error", text: `Failed to send email: ${detail}` });
        } finally {
            setLoading(false);
        }
    };

    const onKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="min-h-screen w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-300 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white/70 p-8 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/30 shadow-sm">
                <header className="mb-6">
                    <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Enter the email you used to sign up. We’ll send you a reset link.
                    </p>
                </header>

                <form onSubmit={handleSubmit} onKeyDown={onKeyDown} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-neutral-300 bg-neutral-100/70 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="group relative inline-flex w-full items-center justify-center rounded-xl border border-neutral-300 bg-neutral-900 px-4 py-3 text-sm font-medium text-neutral-100 transition-all hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-100 dark:text-neutral-900"
                    >
                        {loading && (
                            <span className="absolute left-4 inline-block h-4 w-4 animate-spin rounded-full border border-neutral-500 border-t-transparent dark:border-neutral-400 dark:border-t-transparent" />
                        )}
                        Send reset link
                    </button>
                </form>

                {msg && (
                    <div
                        className="mt-5 rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
                        role="status"
                        aria-live="polite"
                    >
                        {msg.text}
                    </div>
                )}
            </div>
        </div>
    );
}
