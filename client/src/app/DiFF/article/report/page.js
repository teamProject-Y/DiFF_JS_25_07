'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { saveReport } from '@/lib/NotionAPI';
import { useState, useRef, useMemo, useEffect } from 'react';

export default function ReportForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const articleId = searchParams.get('id'); // ✅ 신고 대상 글 ID (쿼리스트링으로 받음)

    const [report, setReport] = useState({
        articleId: articleId || '',
        title: '',
        body: '',
        email: '',
        regDate: new Date().toISOString().split('T')[0],
    });

    const [touched, setTouched] = useState({
        title: false,
        body: false,
        email: false,
    });

    const [submitting, setSubmitting] = useState(false);

    const titleRef = useRef(null);
    const emailRef = useRef(null);
    const bodyRef = useRef(null);

    // 로그인 유저 이메일 자동 세팅
    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        if (storedEmail) {
            setReport((prev) => ({ ...prev, email: storedEmail }));
        }
    }, []);

    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

    const errors = useMemo(() => {
        return {
            title: report.title.trim() ? '' : 'Required',
            email: !report.email.trim()
                ? 'Required'
                : emailOk(report.email)
                    ? ''
                    : 'Please enter a valid email address.',
            body: report.body.trim() ? '' : 'Required',
        };
    }, [report]);

    const showError = (key) => Boolean(errors[key]) && touched[key];

    const isValid = useMemo(() => {
        return report.title.trim() && report.body.trim() && emailOk(report.email);
    }, [report]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ title: true, email: true, body: true });

        if (!isValid) {
            if (errors.title) {
                titleRef.current?.focus();
                return;
            }
            if (errors.email) {
                emailRef.current?.focus();
                return;
            }
            if (errors.body) {
                bodyRef.current?.focus();
                return;
            }
            return;
        }

        try {
            setSubmitting(true);
            const res = await saveReport(report);
            alert(res.message || '신고가 접수되었습니다.');
            router.push('/DiFF/home/main'); // ✅ 완료 후 홈으로 이동
        } catch (err) {
            console.error('신고 저장 실패:', err);
            alert('신고 처리 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="min-h-full px-32">
            <div className="flex items-center border-b mb-3 dark:border-neutral-700">
                <button
                    type="button"
                    className="p-4 -mb-px border-b-2 font-semibold text-black border-black
                                  dark:text-neutral-300 dark:border-neutral-300 "
                >
                    🚨 Report Post
                </button>
            </div>

            <div className="px-4">
                {/* 신고 제목 */}
                <div className="mt-8">
                    <div className="flex items-baseline gap-2">
                        <label
                            htmlFor="title"
                            className="mb-2 font-medium text-gray-900 dark:text-neutral-300"
                        >
                            Title
                        </label>
                        {showError('title') && (
                            <span className="text-sm text-red-600">{errors.title}</span>
                        )}
                    </div>
                    <input
                        id="title"
                        type="text"
                        placeholder="신고 제목을 입력해주세요"
                        ref={titleRef}
                        value={report.title}
                        onChange={(e) =>
                            setReport((prev) => ({ ...prev, title: e.target.value }))
                        }
                        onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
                        className={`bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full p-2.5
              ${
                            showError('title')
                                ? 'focus:ring-1 border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:outline-none focus:ring-0 focus-visible:outline-none'
                        }
              dark:bg-neutral-800 dark:border-neutral-700 dark:placeholder-neutral-500 dark:text-neutral-300`}
                    />
                </div>

                {/* Email */}
                <div className="my-6">
                    <div className="flex items-baseline gap-2">
                        <label
                            htmlFor="email"
                            className="mb-2 font-medium text-gray-900 dark:text-neutral-300"
                        >
                            Your Email
                        </label>
                        {showError('email') && (
                            <span className="text-sm text-red-600">{errors.email}</span>
                        )}
                    </div>
                    <input
                        id="email"
                        type="email"
                        placeholder="your-mail@mail.com"
                        ref={emailRef}
                        value={report.email}
                        onChange={(e) =>
                            setReport((prev) => ({ ...prev, email: e.target.value }))
                        }
                        onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                        className={`bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full p-2.5
              ${
                            showError('email')
                                ? 'focus:ring-1 border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:outline-none focus:ring-0 focus-visible:outline-none'
                        }
              dark:bg-neutral-800 dark:border-neutral-700 dark:placeholder-neutral-500 dark:text-neutral-300`}
                    />
                </div>

                {/* 신고 사유 */}
                <div className="mb-10">
                    <div className="flex items-baseline gap-2">
                        <label
                            htmlFor="body"
                            className="mb-2 font-medium text-gray-900 dark:text-neutral-300"
                        >
                            Reason
                        </label>
                        {showError('body') && (
                            <span className="text-sm text-red-600">{errors.body}</span>
                        )}
                    </div>
                    <textarea
                        id="body"
                        rows="8"
                        ref={bodyRef}
                        value={report.body}
                        onChange={(e) =>
                            setReport((prev) => ({ ...prev, body: e.target.value }))
                        }
                        onBlur={() => setTouched((prev) => ({ ...prev, body: true }))}
                        placeholder="신고 사유를 입력해주세요"
                        className={`resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border
              ${
                            showError('body')
                                ? 'focus:ring-1 border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:outline-none focus:ring-0 focus-visible:outline-none'
                        }
              dark:bg-neutral-800 dark:border-neutral-700 dark:placeholder-neutral-500 dark:text-neutral-300`}
                    />
                </div>

                {/* Submit 버튼 */}
                <button
                    type="submit"
                    disabled={!isValid || submitting}
                    className={`w-full py-2 rounded-lg transition-colors border
            ${
                        !isValid || submitting
                            ? 'bg-gray-300 text-white cursor-not-allowed ' +
                            'dark:bg-neutral-800/40 dark:text-neutral-600 dark:border-neutral-700/80'
                            : 'bg-red-600 text-white hover:bg-red-700 ' +
                            'dark:bg-red-700 dark:text-neutral-300 dark:border-neutral-600 dark:hover:bg-red-800'
                    }`}
                >
                    {submitting ? 'Submitting…' : 'Submit Report'}
                </button>
            </div>
        </form>
    );
}
