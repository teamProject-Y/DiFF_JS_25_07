'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
    { href: '/DiFF/docs/intro', label: '1. 소개' },
    { href: '/DiFF/docs/start', label: '2. 시작하기' },
    { href: '/DiFF/docs/howto', label: '3. 주요 기능 사용법' },
    { href: '/DiFF/docs/option', label: '4. 옵션' },
    { href: '/DiFF/docs/display', label: '5. 화면별 안내' },
    { href: '/DiFF/docs/account', label: '6. 계정 및 보안' },
    { href: '/DiFF/docs/support', label: '7. 고객 지원' }
];

export default function DocsSidebar({ className = '' }) {
    const pathname = usePathname();

    return (
        <aside
            className={
                'hidden lg:block sticky top-[4.5rem] self-start h-[calc(100vh-5rem)] overflow-auto pr-3 border-r border-white/10 ' +
                className
            }
        >
            <nav className="py-4 text-sm">
                <div className="px-2 pb-2 font-semibold text-neutral-300">목차</div>
                <ul className="space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={
                                        'block rounded px-2 py-1.5 hover:bg-white/10 ' +
                                        (active ? 'bg-white/10 text-white' : 'text-neutral-300')
                                    }
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}
