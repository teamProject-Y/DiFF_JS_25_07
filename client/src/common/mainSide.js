// 'use client';
//
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
//
// const defaultItems = [
//     { href: '/DiFF/home/main', label: 'Home' },
//     { href: '/DiFF/member/myPage', label: 'Profile' },
//     { href: '/DiFF/member/repository', label: 'Repositories' },
//     { href: '/DiFF/docs/intro', label: 'Docs' },
// ];
//
// export default function LeftSidebar({
//                                         className = '',
//                                         items = defaultItems,
//                                         footer,
//                                     }) {
//     const pathname = usePathname();
//
//     return (
//         <aside className={className}>
//             <nav className="space-y-3 text-gray-700 mb-6" aria-label="Primary">
//                 {items.map(({ href, label }) => {
//                     const isActive =
//                         pathname === href || pathname?.startsWith(href + '/');
//                     return (
//                         <Link
//                             key={href}
//                             href={href}
//                             className={[
//                                 'block hover:underline',
//                                 isActive ? 'font-semibold text-black' : ''
//                             ].join(' ')}
//                         >
//                             {label}
//                         </Link>
//                     );
//                 })}
//             </nav>
//
//             <div className="pt-4 text-sm text-gray-500">
//                 {footer ?? (
//                     <>
//                         <div className="font-semibold mb-2">Following</div>
//                         <p>Find more writers and publications to follow.</p>
//                     </>
//                 )}
//             </div>
//         </aside>
//     );
// }
