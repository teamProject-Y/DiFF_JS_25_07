'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function NotFound() {
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Helpful console note for debugging missing routes
        if (pathname) console.warn('DiFF 404 — missing path:', pathname)
    }, [pathname])

    return (
        <main className="min-h-full flex items-center justify-center p-6">
            <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-xl p-8">
                <header className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
                        <span className="text-lg font-bold">404</span>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
                        <p className="mt-1 text-sm text-slate-600">We couldn't find the resource you were looking for.</p>
                        {pathname && (
                            <p className="mt-1 text-xs text-slate-500">
                                Requested URL:{' '}
                                <code className="rounded bg-slate-100 px-1 py-0.5">{pathname}</code>
                            </p>
                        )}
                    </div>
                </header>

                <div className="mt-8 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[.98]"
                    >
                        {/* back icon */}
                        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                            <path fill="currentColor" d="M15 6l-6 6 6 6" />
                        </svg>
                        Go back
                    </button>

                    <button
                        type="button"
                        onClick={() => router.refresh()}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[.98]"
                    >
                        Soft refresh
                    </button>

                    <Link
                        href="/DiFF"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
                    >
                        Go to DiFF
                    </Link>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition active:scale-[.98]"
                    >
                        Home
                    </Link>
                </div>

                <footer className="mt-6 text-xs text-slate-500">
                    Tip: Double‑check the URL or navigate via the sidebar/menu. If this keeps happening, confirm your route segments and file names.
                </footer>
            </section>
        </main>
    )
}
