'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from "axios";

export default function WriteArticle() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const repositoryId = searchParams.get('repositoryId'); // 필요하면 같이 넘겨 글을 특정 레포에 작성

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

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
            const res = await axios.post(
                'http://localhost:8080/api/DiFF/article/doWrite',
                { title, body, repositoryId },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: token ? `Bearer ${token}` : ''
                    }
                }
            );
            console.log('✅ 작성 성공:', res.data);
            // 글 작성 후 페이지 이동
            router.push(`/DiFF/article/list?repositoryId=${repositoryId}`);
        } catch (err) {
            console.error('❌ 작성 실패');
            console.log('status:', err.response?.status);
            console.log('data:', err.response?.data);
            console.log('message:', err.message);

            // 토큰 만료 시 로그인으로
            if (err.response?.status === 401) {
                router.replace('/DiFF/member/login');
            }
        }
    };


    return (
        <div className="container mx-auto mt-8 p-6 w-4/5 border border-neutral-300 rounded-xl">
            <button onClick={() => router.back()} className="text-xl mb-4">← 뒤로</button>
            <h1 className="text-3xl font-bold mb-6">Article Write</h1>

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
                    바른치킨 고고
                </button>
            </form>
        </div>
    );
}
