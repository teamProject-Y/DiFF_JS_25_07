// src/app/layout.js
import Script from 'next/script';
import CommonLayout from '@/common/commonLayout';
import './globals.css';
import {Suspense} from 'react';

export const metadata = {title: 'DiFF', description: 'DiFF'};

export default function RootLayout({children, modal}) {
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
                    var saved = localStorage.getItem('theme'); // 'dark' | 'light' | 'system' | null
                    var cookieTheme = readCookie('theme');
                    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                
                    var source = cookieTheme ?? saved;
                    var useSystem = !source || source === 'system';
                    var mode = useSystem ? (prefersDark ? 'dark' : 'light') : source;
                
                    var root = document.documentElement;
                    root.classList.toggle('dark', mode === 'dark');
                    root.setAttribute('data-theme', mode === 'dark' ? 'dark' : 'light');
                
                    if (useSystem && window.matchMedia) {
                      var mq = window.matchMedia('(prefers-color-scheme: dark)');
                      mq.addEventListener('change', function(e){
                        var dark = e.matches;
                        root.classList.toggle('dark', dark);
                        root.setAttribute('data-theme', dark ? 'dark' : 'light');
                      });
                    }
                  } catch(e){}
                })();`}
            </Script>

        </head>
        <body className="text-neutral-900 dark:bg-neutral-900 dark:text-neutral-300">
        <Suspense fallback={null}>
            <CommonLayout>
                {children}
                {modal}
            </CommonLayout>
        </Suspense>
        </body>
        </html>
    );
}