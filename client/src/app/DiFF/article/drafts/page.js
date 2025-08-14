// src/app/DiFF/article/drafts/page.js
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DraftsArticle, deleteDraft } from '@/lib/ArticleAPI';

export default function DraftsPage() {
    const router = useRouter();
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState('');

    // 로그인 체크 + 목록 로딩
    useEffect(() => {
        const token =
            typeof window !== 'undefined' && localStorage.getItem('accessToken');
        if (!token) {
            router.replace('/DiFF/member/login');
            return;
        }

        (async () => {
            try {
                setLoading(true);
                setError('');
                const data = await DraftsArticle();
                // 백엔드 응답 형태에 맞춰서 안전하게 파싱
                const list = data?.drafts ?? data?.data?.drafts ?? data ?? [];
                setDrafts(Array.isArray(list) ? list : []);
            } catch (e) {
                console.error(e);
                setError('임시저장 목록을 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        })();
    }, [router]);

    const handleOpen = (draft) => {
        // 작성 페이지로 이동할 때 repositoryId와 body를 함께 전달
        const qs = new URLSearchParams({
            repositoryId: String(draft.repositoryId ?? ''),
            body: draft.body ?? '',
        }).toString();
        router.push(`/DiFF/article/write?${qs}`);
    };

    const handleDelete = async (id) => {
        if (!id) return;
        const ok = window.confirm('이 초안을 삭제할까요?');
        if (!ok) return;

        try {
            setDeletingId(id);
            const res = await deleteDraft(id);

            const resultCode =
                res?.resultCode ?? res?.ResultCode ?? res?.code ?? '';
            if (String(resultCode).startsWith('S-')) {
                // 낙관적 UI: 목록에서 제거
                setDrafts((prev) => prev.filter((d) => d.id !== id));
            } else {
                const msg = res?.msg || '삭제에 실패했습니다.';
                alert(msg);
            }
        } catch (e) {
            console.error(e);
            alert('삭제 요청에 실패했습니다.');
        } finally {
            setDeletingId(null);
        }
    };

    const content = useMemo(() => {
        if (loading) return <div className="p-6">로딩중...</div>;
        if (error) return <div className="p-6 text-red-600">{error}</div>;
        if (!drafts.length)
            return <div className="p-6">임시저장 글이 없습니다.</div>;

        return (
            <ul className="space-y-3">
                {drafts.map((draft) => (
                    <li
                        key={draft.id}
                        className="border rounded p-3 flex items-start justify-between gap-3"
                    >
                        <button
                            className="text-left flex-1 hover:bg-gray-50 rounded p-1"
                            onClick={() => handleOpen(draft)}
                            title="작성 페이지로 이동"
                        >
                            <div className="font-medium truncate">
                                {draft.title || '(제목 없음)'}
                            </div>
                            <div className="text-sm text-gray-600 break-words line-clamp-2">
                                {draft.body || '(내용 없음)'}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                                checksum: {draft.checksum ?? '-'}
                            </div>
                            <div className="text-xs text-gray-500">
                                regDate: {draft.regDate ?? '-'}
                            </div>
                            <div className="text-xs text-gray-500">
                                repositoryId: {draft.repositoryId ?? '-'}
                            </div>
                        </button>

                        <button
                            onClick={() => handleDelete(draft.id)}
                            disabled={deletingId === draft.id}
                            className={`shrink-0 px-3 py-2 rounded border text-sm ${
                                deletingId === draft.id
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                            }`}
                            title="초안 삭제"
                        >
                            {deletingId === draft.id ? '삭제중…' : '삭제'}
                        </button>
                    </li>
                ))}
            </ul>
        );
    }, [loading, error, drafts, deletingId]);

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold mb-4">임시저장 목록</h1>
            {content}
        </div>
    );
}
