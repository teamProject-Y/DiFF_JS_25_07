
'use client';

export default function Footer({ scrollerId = 'pageScroll' }) {
    const GITHUB_ISSUES_URL = 'https://github.com/teamProject-Y/DiFF/issues';
    const OPS_EMAIL = 'support@diff.io.kr';

    const onBackToTop = (e) => {
        e.preventDefault();
        const scroller = document.getElementById(scrollerId);
        (scroller?.scrollTo
                ? scroller.scrollTo({ top: 0, behavior: 'smooth' })
                : window.scrollTo({ top: 0, behavior: 'smooth' })
        );
    };

    return (
        <footer className="bg-gray-100 text-gray-500 dark:bg-neutral-900 dark:text-neutral-300">
            <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
                <div className="border-t border-gray-500 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-y-6">
                    {/* GitHub */}
                    <a
                        href={GITHUB_ISSUES_URL}
                        target="_blank" rel="noopener noreferrer"
                        className="justify-self-start inline-flex items-center gap-2 text-base md:text-lg hover:text-black dark:hover:text-white"
                        aria-label="GitHub Issues로 이동" title="GitHub Issues"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                             className="h-5 w-5" fill="currentColor" aria-hidden="true">
                            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.4 7.86 10.94.58.1.79-.25.79-.56v-2.02c-3.2.7-3.87-1.54-3.87-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.73.08-.73.08-.73 1.18.08 1.81 1.23 1.81 1.23 1.04 1.79 2.73 1.27 3.39.97.1-.76.41-1.27.74-1.56-2.55-.29-5.23-1.27-5.23-5.66 0-1.25.45-2.27 1.2-3.07-.12-.29-.52-1.45.12-3.03 0 0 .98-.31 3.2 1.17a11.1 11.1 0 0 1 5.82 0c2.22-1.48 3.2-1.17 3.2-1.17.64 1.58.24 2.74.12 3.03.75.8 1.2 1.83 1.2 3.07 0 4.39-2.69 5.37-5.24 5.65.42.37.79 1.09.79 2.21v3.28c0 .31.21.67.8.56C20.21 21.4 23.5 17.1 23.5 12 23.5 5.65 18.35.5 12 .5Z"/>
                        </svg>
                        <span className="underline-offset-4">GitHub Issues</span>
                    </a>

                    {/* Back to Top */}
                    <a
                        href="#top"
                        onClick={onBackToTop}
                        className="justify-self-center text-lg md:text-xl font-medium hover:text-black dark:hover:text-white"
                    >
                        Back to Top ↑
                    </a>

                    {/* Email */}
                    <a
                        href={`mailto:${OPS_EMAIL}`}
                        className="justify-self-end text-base md:text-lg underline-offset-4 hover:text-black dark:hover:text-white"
                    >
                        {OPS_EMAIL}
                    </a>
                </div>
            </div>
        </footer>
    );
}
