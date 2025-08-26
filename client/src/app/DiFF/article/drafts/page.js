// src/app/DiFF/article/drafts/page.js
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DraftsArticle, deleteDraft } from '@/lib/DraftAPI';

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
        console.log('[DraftsPage] mount. accessToken exist?', Boolean(token));

        if (!token) {
            console.log('[DraftsPage] no token -> redirect to login');
            router.replace('/DiFF/member/login');
            return;
        }

        (async () => {
            try {
                setLoading(true);
                setError('');
                console.log('[DraftsPage] calling DraftsArticle()');
                const data = await DraftsArticle();
                console.log('[DraftsPage] DraftsArticle() response:', data);

                // 백엔드 응답 형태에 맞춰서 안전하게 파싱
                const list = data?.drafts ?? data?.data?.drafts ?? data ?? [];
                console.log('[DraftsPage] parsed drafts length:', Array.isArray(list) ? list.length : 'not array');

                setDrafts(Array.isArray(list) ? list : []);
            } catch (e) {
                console.error('[DraftsPage] load drafts error:', e);
                setError('임시저장 목록을 불러오지 못했습니다.');
            } finally {
                setLoading(false);
                console.log('[DraftsPage] loading finished');
            }
        })();
    }, [router]);

    const handleOpen = (draft) => {
        console.log('[DraftsPage] open clicked. draft:', draft);
        if (!draft?.id) {
            console.warn('[DraftsPage] draftId 없음, 이동 불가');
            return;
        }
        router.push(`/DiFF/article/write?draftId=${draft.id}`);
    };


    const handleDelete = async (id) => {
        if (!id) return;
        console.log('[DraftsPage] delete clicked. id:', id);

        const ok = window.confirm('이 초안을 삭제할까요?');
        if (!ok) {
            console.log('[DraftsPage] delete canceled by user');
            return;
        }

        try {
            setDeletingId(id);
            console.log('[DraftsPage] calling deleteDraft()', id);

            const res = await deleteDraft(id);
            console.log('[DraftsPage] deleteDraft() response:', res);

            const resultCode = res?.resultCode ?? res?.ResultCode ?? res?.code ?? '';
            const isSuccess =
                res?.status === 200 || // ✅ HTTP status 200이면 성공
                (typeof resultCode === 'string' && resultCode.startsWith('S-')) ||
                res?.success === true ||
                (typeof res?.msg === 'string' && res.msg.includes('성공'));

            if (isSuccess) {
                setDrafts((prev) => {
                    const next = prev.filter((d) => d.id !== id);
                    console.log(
                        '[DraftsPage] remove from list. before:',
                        prev.length,
                        'after:',
                        next.length
                    );
                    return next;
                });
                console.log('[DraftsPage] delete success for id:', id);
            } else {
                const msg = res?.msg || '삭제에 실패했습니다.';
                console.warn('[DraftsPage] delete failed. server msg:', msg);
                alert(msg);
            }
        } catch (e) {
            console.error('[DraftsPage] delete request error:', e);
            alert(e?.response?.data?.msg || '삭제 요청에 실패했습니다.');
        } finally {
            setDeletingId(null);
            console.log('[DraftsPage] delete finished for id:', id);
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
                                regDate: {draft.regDate
                                ? new Date(draft.regDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric"
                                })
                                : '-'}
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
        <div className="p-6 mt-20">
            <h1 className="text-xl font-semibold mb-4">임시저장 목록</h1>
            {content}
        </div>
    );
}
