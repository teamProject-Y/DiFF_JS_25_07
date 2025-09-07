'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { saveReport } from '@/lib/NotionAPI';
import { useState, useRef, useMemo, useEffect } from 'react';
import {useTheme} from "@/common/thema";

export default function ReportForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const articleId = searchParams.get('id');
    const theme = useTheme();

    const [report, setReport] = useState({
        articleId: articleId || '',
        title: '',
        nickName: '',
        email: '',
        body: '',
        regDate: new Date().toISOString().split('T')[0],
    });

    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const titleRef = useRef(null);
    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const bodyRef = useRef(null);

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        if (storedEmail) {
            setReport((prev) => ({ ...prev, email: storedEmail }));
        }
    }, []);

    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

    const errors = useMemo(() => ({
        title: report.title.trim() ? '' : 'Required',
        nickName: report.nickName.trim() ? '' : 'Required',
        email: !report.email.trim()
            ? 'Required'
            : emailOk(report.email) ? '' : 'Please enter a valid email address.',
        body: report.body.trim() ? '' : 'Required',
    }), [report]);

    const showError = (key) => Boolean(errors[key]) && touched[key];
    const isValid = useMemo(() => (
        report.title.trim() && report.nickName.trim() && report.body.trim() && emailOk(report.email)
    ), [report]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({ title: true, nickName: true, email: true, body: true });

        if (!isValid) return;

        try {
            setSubmitting(true);
            const res = await saveReport(report);
            alert(res.message || '신고가 접수되었습니다.');
            router.push('/DiFF/home/main');
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
                <button className="p-4 -mb-px border-b-2 font-semibold text-black border-black
                                  dark:text-neutral-300 dark:border-neutral-300 ">
                    Report Article
                </button>
            </div>

            <div className="px-4">
                {/* Title */}
                <div className="mt-8">
                    <div className="flex items-baseline gap-2">
                        <label htmlFor="title" className="mb-2 font-medium text-gray-900 dark:text-neutral-300">
                            Title
                        </label>
                        {showError('title') && <span className="text-sm text-red-600">{errors.title}</span>}
                    </div>
                    <input
                        id="title"
                        type="text"
                        placeholder="Please enter the title"
                        ref={titleRef}
                        value={report.title}
                        onChange={(e) => setReport({...report, title: e.target.value})}
                        onBlur={() => setTouched(prev => ({...prev, title: true}))}
                        className={`bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full p-2.5
                        ${showError('title')
                            ? 'focus:ring-1 border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500'
                            : 'border-gray-300 focus:outline-none focus:ring-0 focus-visible:outline-none'}
                            dark:bg-neutral-800 dark:border-neutral-700  dark:placeholder-neutral-500 dark:text-neutral-300`}
                    />
                </div>

                {/* Name + Email */}
                <div className="my-6 flex justify-between">
                    {/* Name */}
                    <div className="w-2/5">
                        <div className="flex items-baseline gap-2">
                            <label htmlFor="nickName" className="mb-2 font-medium text-gray-900 dark:text-neutral-300">
                                Your Name
                            </label>
                            {showError('nickName') && <span className="text-sm text-red-600">{errors.nickName}</span>}
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500 dark:text-neutral-400" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                                </svg>
                            </div>
                            <input
                                id="nickName"
                                type="text"
                                placeholder="your name"
                                ref={nameRef}
                                value={report.nickName}
                                onChange={(e) => setReport({...report, nickName: e.target.value})}
                                onBlur={() => setTouched(prev => ({...prev, nickName: true}))}
                                className={`bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full ps-10 p-2.5
                                ${showError('nickName')
                                    ? 'focus:ring-1 border-red-500 focus:ring-red-500 focus:border-red-500 '
                                    : 'border-gray-300 focus:outline-none focus:ring-0 focus-visible:outline-none'}
                            dark:bg-neutral-800 dark:border-neutral-700  dark:placeholder-neutral-500 dark:text-neutral-300`}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="w-3/5 pl-8">
                        <div className="flex items-baseline gap-2">
                            <label htmlFor="email" className="mb-2 font-medium text-gray-900 dark:text-neutral-300">
                                Your Email
                            </label>
                            {showError('email') && <span className="text-sm text-red-600">{errors.email}</span>}
                        </div>
                        <div className="relative dark">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500 dark:text-neutral-400" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
                                    <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z"/>
                                    <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z"/>
                                </svg>
                            </div>
                            <input
                                id="email"
                                type="email"
                                placeholder="your-mail@mail.com"
                                ref={emailRef}
                                value={report.email}
                                onChange={(e) => setReport({...report, email: e.target.value})}
                                onBlur={() => setTouched(prev => ({...prev, email: true}))}
                                className={`bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full ps-10 p-2.5
                                 ${showError('email')
                                    ? 'focus:ring-1 border-red-500 focus:ring-red-500 focus:border-red-500 '
                                    : 'border-gray-300 focus:outline-none focus:ring-0 focus-visible:outline-none'}
                                    ${theme === 'dark' ? `dark:bg-neutral-800 dark:border-neutral-700  dark:placeholder-neutral-500 dark:text-neutral-300`
                                    : ``}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div className="mb-10">
                    <div className="flex items-baseline gap-2">
                        <label htmlFor="message" className="mb-2 font-medium text-gray-900 dark:text-neutral-300">
                            Your message
                        </label>
                        {showError('body') && <span className="text-sm text-red-600">{errors.body}</span>}
                    </div>
                    <textarea
                        id="message"
                        rows="8"
                        ref={bodyRef}
                        value={report.body}
                        onChange={(e) => setReport({...report, body: e.target.value})}
                        onBlur={() => setTouched(prev => ({...prev, body: true}))}
                        placeholder="Leave a message..."
                        className={`resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border
                            ${showError('body')
                            ? 'focus:ring-1 border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500'
                            : 'border-gray-300 focus:outline-none focus:ring-0 focus-visible:outline-none'}
                            dark:bg-neutral-800 dark:border-neutral-700  dark:placeholder-neutral-500 dark:text-neutral-300`}
                    />
                </div>

                <button
                    type="submit"
                    disabled={!isValid || submitting}
                    className={`w-full py-2 rounded-lg transition-colors border
                        ${!isValid || submitting
                        ? 'bg-gray-300 text-white cursor-not-allowed ' +
                        'dark:bg-neutral-800/40 dark:text-neutral-600 dark:border-neutral-700/80'
                        : 'bg-black text-white hover:bg-gray-800 ' +
                        'dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-600 dark:hover:bg-neutral-800'}`}
                >
                    {submitting ? 'Submitting…' : 'Submit'}
                </button>
            </div>
        </form>
    );
}
