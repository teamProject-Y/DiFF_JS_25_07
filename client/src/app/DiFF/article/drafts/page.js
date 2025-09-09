// src/app/DiFF/article/drafts/page.js
'use client';

import {useEffect, useState, useMemo} from 'react';
import {useRouter} from 'next/navigation';
import {DraftsArticle, deleteDraft} from '@/lib/DraftAPI';
import { useDialog } from '@/common/commonLayout';

export default function DraftsPage() {
    const router = useRouter();
    const { alert, confirm } = useDialog();

    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState('');

    // 로그인 체크 + 목록 로딩
    useEffect(() => {
        const token = typeof window !== 'undefined' && localStorage.getItem('accessToken');
        if (!token) {
            router.replace('/DiFF/member/login');
            return;
        }

        (async () => {
            try {
                setLoading(true);
                setError('');
                const data = await DraftsArticle();
                const list = data?.drafts ?? data?.data?.drafts ?? data ?? [];
                setDrafts(Array.isArray(list) ? list : []);
            } catch (e) {
                console.error('[DraftsPage] load drafts error:', e);
                setError('임시저장 목록을 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        })();
    }, [router]);

    const handleOpen = (draft) => {
        if (!draft?.id) return;
        router.push(`/DiFF/article/write?draftId=${draft.id}`);
    };

    const handleDelete = async (id) => {
        const ok = await confirm({
            title: "Delete this draft?",
            message: "This action cannot be undone.",
            intent: "danger",
            confirmText: "Delete",
        });
        if (ok) await doDeleteDraft(id);
    };

    const doDeleteDraft = async (id) => {
        if (!id) return;
        try {
            setDeletingId(id);
            const res = await deleteDraft(id);
            const resultCode = res?.resultCode ?? res?.ResultCode ?? '';
            const isSuccess =
                res?.status === 200 ||
                (typeof resultCode === 'string' && resultCode.startsWith('S-')) ||
                res?.success === true ||
                (typeof res?.msg === 'string' && res.msg.includes('성공'));

            if (isSuccess) {
                setDrafts(prev => prev.filter(d => d.id !== id));
            } else {
                const msg = res?.msg || '삭제에 실패했습니다.';
                console.warn('[DraftsPage] delete failed. server msg:', msg);
                alert({ intent: "danger", title: "Failed to delete. Please try again." });
            }
        } catch (e) {
            console.error('[DraftsPage] delete request error:', e);
            alert({ intent: "danger", title: `Failed to delete: ${e?.response?.data?.msg || e?.message || ''}` });
        } finally {
            setDeletingId(null);
        }
    };

    const content = useMemo(() => {
        if (loading) return <div className="p-6">Loading...</div>;
        if (error) return <div className="p-6 text-red-600">{error}</div>;
        if (!drafts.length) return <div className="p-6">You don’t have any saved drafts.</div>;

        return (
            <ul className="space-y-3">
                {drafts.map((draft) => (
                    <li
                        key={draft.id}
                        className="border rounded-lg p-5 flex items-start justify-between gap-3 hover:bg-gray-100
                       dark:border-neutral-700 dark:hover:bg-neutral-800 dark:text-neutral-300"
                    >
                        <button
                            className="text-left flex-1 p-1"
                            onClick={() => handleOpen(draft)}
                            title="Go to Write"
                        >
                            <div className="text-xl font-semibold truncate mb-3">
                                {draft.title || '(No title)'}
                            </div>
                            <div className="text-gray-600 dark:text-neutral-400 break-words line-clamp-2 mb-5">
                                {draft.body || '(No body)'}
                            </div>
                            <div className="flex flex-col gap-1 mt-1 text-sm text-gray-500 dark:text-neutral-500">
                                <p>checksum: {draft.checksum ?? '-'}</p>
                                <p>
                                    Created At.{' '}
                                    {draft.regDate
                                        ? new Date(draft.regDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })
                                        : '-'}
                                </p>
                                <p>Repository: {draft.extra__repositoryName}</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleDelete(draft.id)}
                            disabled={deletingId === draft.id}
                            className={`shrink-0 px-3 py-2 rounded border text-sm ${
                                deletingId === draft.id
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'hover:text-red-500 hover:border-red-500'
                            }`}
                            title="Delete draft"
                        >
                            {deletingId === draft.id ? 'Deleting...' : 'Delete'}
                        </button>
                    </li>
                ))}
            </ul>
        );
    }, [loading, error, drafts, deletingId, confirm]);

    return (
        <div className="pb-6 px-32 h-full min-h-0 flex flex-col">
            <div className="flex items-center border-b dark:border-neutral-700 mb-3">
                <button className="p-4 -mb-px font-semibold text-black dark:text-neutral-200 border-b-2 border-black dark:border-neutral-400">
                    Drafts
                </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">{content}</div>
        </div>
    );
}