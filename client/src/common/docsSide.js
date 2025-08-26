'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BASE = '/DiFF/docs';

const NAV_ITEMS = [
    { href: `${BASE}/intro`,  label: '1. 소개' },
    { href: `${BASE}/start`,  label: '2. 시작하기' },
    { href: `${BASE}/howto`,  label: '3. 주요 기능 사용법' },
    { href: `${BASE}/option`, label: '4. 옵션' },
    { href: `${BASE}/display`,label: '5. 화면별 안내' },
    { href: `${BASE}/account`,label: '6. 계정 및 보안' },
    { href: `${BASE}/support`,label: '7. 고객 지원' },
];

const normalize = (p='') => (p.endsWith('/') && p !== '/' ? p.slice(0, -1) : p);

export default function DocsSidebar({ className = '', activeKey }) {
    const pathname = normalize(usePathname());
    return (
        <aside
            className={
                'hidden lg:block sticky top-20 self-start overflow-auto' +
                className
            }
        >
            <nav>
                <div className="px-4 pb-10 font-black text-2xl">About DiFF</div>
                <ul className="space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const href = normalize(item.href);
                        const isActive =
                            (activeKey ? normalize(activeKey) === href : pathname === href) ||
                            pathname.startsWith(href + '/');

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={
                                        'block py-2 pl-5 ' +
                                        (isActive ? 'border-l-4 border-black font-bold' : 'hover:font-bold text-gray-500')
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
