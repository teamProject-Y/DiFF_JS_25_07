'use client';

import Link from 'next/link';
import { Inconsolata } from 'next/font/google';
import styles from './errorScreen.module.css';

/* next/font로 폰트 로드 (원본 @import 대체, 성능/FOIT 방지) */
const inconsolata = Inconsolata({ subsets: ['latin'], weight: ['400','700'] });

export default function ErrorScreen({
                                      code,
                                      title = 'Error',
                                      message = 'The page you are looking for might have been removed, had its name changed or is temporarily unavailable.',
                                      homeHref = '/',          // 필요하면 '/DiFF/home/main'로 바꿔서 사용
                                      showRetry = false,       // error.js에서 reset 버튼 보일지
                                      onRetry = null,          // error.js에서 reset 핸들러 주입
                                  }) {

    const c = String(code ?? '500');
    const safeTitle = title ?? (c === '404' ? 'Not Found' : 'Error');

    return (
        <div className={`${styles.crt} ${inconsolata.className}`}>
            <div className={styles.overlay} />
            <div className={styles.terminal}>
                <h1 className={styles.safeTitle}>
                    {title} <span className={styles.errorcode}>{c}</span>
                </h1>

                <p className={styles.output}>{message}</p>

                <p className={styles.output}>
                    {showRetry && onRetry ? (
                        <>
                            Please <button className={styles.link} onClick={onRetry}>try again</button>, or{' '}
                        </>
                    ) : (
                        <>Please try to </>
                    )}
                    <button className={styles.link} onClick={() => history.back()}>go back</button>
                    {' '}or{' '}
                    <Link href={homeHref}>return to the homepage</Link>.
                </p>

                <p className={styles.output}>Good luck.</p>
            </div>
        </div>
    );
}
