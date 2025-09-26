'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

const BASE = '/DiFF/docs';

const NAV_ITEMS = [
    {href: `${BASE}/intro`, label: '1. 소개'},
    {href: `${BASE}/howto`, label: '2. 사용법'},
    {href: `${BASE}/analysis`, label: '3. 분석'},
    {href: `${BASE}/account`, label: '4. 계정 및 보안'},
    {href: `${BASE}/support`, label: '5. 고객 지원'},
];

const normalize = (p = '') => (p.endsWith('/') && p !== '/' ? p.slice(0, -1) : p);

export default function DocsSidebar({className = '', activeKey}) {
    const pathname = normalize(usePathname());
    return (
        <aside
            className={
                'hidden lg:block sticky top-20 self-start overflow-auto' +
                className
            }
        >
            <nav>
                <div className="px-4 py-10 font-black text-2xl ">About DiFF</div>
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
                                        (isActive ? 'border-l-4 font-bold border-black dark:border-neutral-200'
                                            : 'hover:font-bold text-gray-500 dark:text-neutral-500')
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