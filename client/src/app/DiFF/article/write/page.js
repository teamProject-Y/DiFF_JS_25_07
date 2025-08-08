'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function WriteArticle() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const repositoryId = searchParams.get('repositoryId'); // 필요하면 같이 넘겨 글을 특정 레포에 작성

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

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
            const res = await fetch('http://localhost:8088/api/DiFF/article/doWrite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // ✅ 백엔드가 토큰 검증한다면 넣어주기
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ repositoryId, title, body }),
            });

            if (!res.ok) throw new Error('작성 실패');

            router.back(); // 또는 router.push(`/DiFF/article/list?repositoryId=${repositoryId}`)
        } catch (err) {
            console.error(err);
            alert('작성에 실패했습니다.');
        }
    };

    return (
        <div className="container mx-auto mt-8 p-6 w-4/5 border border-neutral-300 rounded-xl">
            <button onClick={() => router.back()} className="text-xl mb-4">← 뒤로</button>
            <h1 className="text-3xl font-bold mb-6">글 작성</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    className="w-full border p-2 rounded"
                    placeholder="제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <textarea
                    className="w-full border p-2 rounded h-48"
                    placeholder="내용"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-500"
                >
                    등록
                </button>
            </form>
        </div>
    );
}
