'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Error({ error, reset }) {
    const router = useRouter()
    const [isResetting, setIsResetting] = useState(false)

    useEffect(() => {
        if (error) console.error('DiFF error boundary caught:', error)
    }, [error])

    async function onTryAgain() {
        try {
            setIsResetting(true)
            await Promise.resolve(reset())
        } finally {
            setIsResetting(false)
        }
    }

    return (
        <main className="absolute -top-20 w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
            <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-xl p-8">
                <header className="flex items-center gap-3 text-red-500">
                    <svg aria-hidden="true"
                         viewBox="0 0 24 24"
                         className="h-7 w-7 shrink-0">
                        <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 15h-2v-2h2Zm0-4h-2V7h2Z" />
                    </svg>
                    <div>
                        <h1 className="text-2xl font-semibold leading-tight tracking-tight">Something went wrong</h1>
                        <p className="text-sm text-slate-600">DiFF ran into an unexpected error while handling your request.</p>
                    </div>
                </header>

                {(error?.message || error?.stack) && (
                    <details className="mt-6 group">
                        <summary className="cursor-pointer select-none text-sm font-medium text-slate-800 underline decoration-dashed underline-offset-4">
                            Technical details
                        </summary>
                        {error?.message && (
                            <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
                                {error.message}
                            </pre>
                        )}
                        {process.env.NODE_ENV !== 'production' && error?.stack && (
                            <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-slate-300/90">
                                {error.stack}
                            </pre>
                        )}
                    </details>
                )}

                <div className="mt-8 flex flex-wrap gap-3" aria-live="polite">
                    <button type="button"
                            onClick={onTryAgain}
                            disabled={isResetting}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition active:scale-[.98] disabled:opacity-60">
                        <svg viewBox="0 0 24 24"
                             className="h-4 w-4"
                             aria-hidden="true">
                            <path fill="currentColor" d="M12 6V3L8 7l4 4V8a4 4 0 1 1-4 4H6a6 6 0 1 0 6-6Z" />
                        </svg>
                        {isResetting ? 'Retrying…' : 'Try again'}
                    </button>

                    <button type="button"
                            onClick={() => router.refresh()}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[.98]">
                        Soft refresh
                    </button>

                    <button type="button"
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[.98]">
                        Reload page
                    </button>

                    <Link href="/DiFF/home/main"
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50">
                        Go home
                    </Link>
                </div>

                <footer className="mt-6 text-xs text-slate-500">
                    Tip: Check your network, browser console, and server logs. If it keeps happening, open an issue in your DiFF repo with steps to reproduce.
                </footer>
            </section>
        </main>
    )
}
