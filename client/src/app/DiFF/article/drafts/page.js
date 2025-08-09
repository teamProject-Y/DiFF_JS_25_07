'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DraftsArticle } from '@/lib/ArticleAPI';

export default function DraftsPage() {
    const router = useRouter();
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 로그인 체크 + 목록 로딩
    useEffect(() => {
        const token = typeof window !== 'undefined' && localStorage.getItem('accessToken');
        if (!token) {
            router.replace('/DiFF/member/login');
            return;
        }
        (async () => {
            try {
                const data = await DraftsArticle();
                setDrafts(data?.drafts ?? []);
            } catch (e) {
                console.error(e);
                alert('임시저장 목록을 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        })();
    }, [router]);

    const handleClick = (draft) => {
        router.push(`/DiFF/article/write?body=${encodeURIComponent(draft.body)}`);
    };

    if (loading) return <div className="p-6">로딩중...</div>;

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold mb-4">임시저장 목록</h1>

            {drafts.length === 0 ? (
                <div>임시저장 글이 없습니다.</div>
            ) : (
                <ul className="space-y-3">
                    {drafts.map((draft) => (
                        <li
                            key={draft.id}
                            className="border rounded p-3 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleClick(draft)}
                        >
                            <div className="font-medium">{draft.title ?? 'drafts'}</div>
                            <div className="text-sm text-gray-600">checksum: {draft.checksum}</div>
                            <div className="text-sm text-gray-600">regDate: {draft.regDate}</div>
                            <div className="text-sm text-gray-600">repositoryId: {draft.repositoryId}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
