// // src/app/DiFF/article/write/page.js
// 'use client';
//
// import { Suspense } from 'react';
// import { useEffect, useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import axios from 'axios';
//
// // 바깥: Suspense 래퍼
// export default function Page() {
//     return (
//         <Suspense fallback={<div className="p-4">Loading…</div>}>
//             <WriteArticleInner />
//         </Suspense>
//     );
// }
//
// // 안쪽: 실제 로직
// function WriteArticleInner() {
//     const router = useRouter();
//     const searchParams = useSearchParams();
//
//     const repositoryId = searchParams.get('repositoryId') || '';
//     const initialDraftBody = searchParams.get('body') || '';
//
//     const [title, setTitle] = useState('');
//     const [draftBody, setDraftBody] = useState(initialDraftBody);
//
//     // 주소창 쿼리(body) 변하면 동기화
//     useEffect(() => {
//         setDraftBody(initialDraftBody);
//     }, [initialDraftBody]);
//
//     // 로그인 체크
//     useEffect(() => {
//         const token =
//             typeof window !== 'undefined' && localStorage.getItem('accessToken');
//         if (!token) router.replace('/DiFF/member/login');
//     }, [router]);
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const token = localStorage.getItem('accessToken');
//
//         try {
//             const res = await axios.post(
//                 'http://localhost:8080/api/DiFF/article/doWrite',
//                 { title, body: draftBody, repositoryId },
//                 {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         Authorization: token ? `Bearer ${token}` : '',
//                     },
//                 }
//             );
//             console.log('✅ 작성 성공:', res.data);
//             router.push(`/DiFF/article/list?repositoryId=${repositoryId}`);
//         } catch (err) {
//             console.error('❌ 작성 실패');
//             console.log('status:', err.response?.status);
//             console.log('data:', err.response?.data);
//             console.log('message:', err.message);
//             if (err.response?.status === 401) {
//                 router.replace('/DiFF/member/login');
//             }
//         }
//     };
//
//     return (
//         <div className="container mx-auto mt-8 p-6 w-4/5 border border-neutral-300 rounded-xl">
//             <button onClick={() => router.back()} className="text-xl mb-4">
//                 ← 뒤로
//             </button>
//             <h1 className="text-3xl font-bold mb-6">Article Write</h1>
//
//             <form onSubmit={handleSubmit} className="space-y-4">
//                 <input
//                     className="w-full border p-2 rounded"
//                     placeholder="제목"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     required
//                 />
//                 <textarea
//                     className="w-full border p-2 rounded h-48"
//                     placeholder="내용"
//                     value={draftBody}
//                     onChange={(e) => setDraftBody(e.target.value)}
//                     required
//                 />
//                 {repositoryId && (
//                     <div className="text-sm text-gray-600">
//                         repositoryId: {repositoryId}
//                     </div>
//                 )}
//                 <button
//                     type="submit"
//                     className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-500"
//                 >
//                     바른치킨 고고
//                 </button>
//             </form>
//         </div>
//     );
// }
