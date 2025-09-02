// src/app/layout.js
import Script from 'next/script';
import CommonLayout from '@/common/CommonLayout';
import './globals.css';

export const metadata = { title: 'DiFF', description: 'DiFF' };

export default function RootLayout({ children, modal }) {
    return (
        <html lang="ko" suppressHydrationWarning>
        <head>
            <Script id="theme-init" strategy="beforeInteractive">
                {`(function(){
            try {
              function readCookie(name){
                return document.cookie
                  .split('; ')
                  .find(r => r.startsWith(name+'='))?.split('=')[1];
              }
              var cookieTheme = readCookie('theme'); // 'dark' | 'light'
              var saved = localStorage.getItem('theme');
              var prefersDark = window.matchMedia &&
                                window.matchMedia('(prefers-color-scheme: dark)').matches;
              var mode = cookieTheme || saved || (prefersDark ? 'dark' : 'light');

              var root = document.documentElement;
              root.classList.toggle('dark', mode === 'dark');
              root.setAttribute('data-theme', mode === 'dark' ? 'dark' : 'light');

              if (!saved && cookieTheme) localStorage.setItem('theme', cookieTheme);
            } catch(e){}
          })();`}
            </Script>
        </head>
        <body>
        <CommonLayout>
            {children}
            {modal}
        </CommonLayout>
        </body>
        </html>
    );
}
