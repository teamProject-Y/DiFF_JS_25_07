'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DraftsArticle() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const repositoryId = searchParams.get('repositoryId');
    const checksum = searchParams.get('checksum');
    const body = searchParams.get('body');
    const regDate = searchParams.get('regDate');// 필요하면 같이 넘겨 글을 특정 레포에 작

    const [drafts, setDrafts] = useState([]);

    // ✅ JWT 토큰으로 접근 제어
    useEffect(() => {
        const token = typeof window !== 'undefined' && localStorage.getItem('accessToken');
        if (!token) {
            router.replace('/DiFF/member/login'); // 미인증 → 로그인으로
        }
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');

        try {
            const res = await fetch('http://localhost:8088/api/DiFF/article/drafts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // ✅ 백엔드가 토큰 검증한다면 넣어주기
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({repositoryId, checksum, body, regDate}),
            });

            if (!res.ok) throw new Error('작성 실패');

            router.back();
        } catch (err) {
            console.error(err);
            alert('작성에 실패했습니다.');
        }
    };


return (
    <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">임시저장 목록</h1>
        임시저장 목록

    </div>
);
}
