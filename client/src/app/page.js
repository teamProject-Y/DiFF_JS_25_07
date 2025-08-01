// 'use client';
//
// import axios from 'axios';
// import { useEffect, useState } from 'react';
//
// export default function Home() {
//     const [data, setData] = useState(null);
//
//     useEffect(() => {
//         const apiUrl = process.env.NEXT_PUBLIC_API_URL;
//
//         axios.get(`${apiUrl}/api/test`)
//             .then((res) => setData(res.data))
//             .catch((err) => console.error('API 호출 실패:', err));
//     }, []);
//
//     return (
//         <main>
//             <h1>API 테스트</h1>
//             <pre>{data ? JSON.stringify(data, null, 2) : '로딩 중…'}</pre>
//         </main>
//     );
// }
