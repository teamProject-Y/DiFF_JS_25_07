// src/app/DiFF/article/write/page.js
'use client';
import {getDraftById, saveDraft} from "@/lib/DraftAPI";
import {Suspense, useEffect, useState, useCallback, useRef} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {writeArticle, getMyRepositories} from '@/lib/ArticleAPI';
import dynamic from 'next/dynamic';

const ToastEditor = dynamic(() => import('@/common/toastEditor'), {ssr: false});


export default function Page() {
    return (
        <Suspense fallback={<div className="p-4">Loading…</div>}>
            <WriteArticlePage/>
        </Suspense>
    );
}

export function WriteArticlePage() {
    const router = useRouter();
    const sp = useSearchParams();

    // 쿼리스트링
    const repoFromQuery = sp.get('repositoryId');

    // 상태
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [repos, setRepos] = useState([]);
    const [repositoryId, setRepositoryId] = useState(null);
    const [loadingRepos, setLoadingRepos] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [repoError, setRepoError] = useState('');
    const [draftId, setDraftId] = useState(sp.get('draftId'));
    // 로그인 체크
    useEffect(() => {
        const token = typeof window !== 'undefined' && localStorage.getItem('accessToken');
        if (!token) router.replace('/DiFF/member/login');
    }, [router]);

    // draftId 있으면 임시저장 불러오기
    useEffect(() => {
        if (draftId) {
            (async () => {
                try {
                    const draft = await getDraftById(draftId);
                    setTitle(draft.title || '');
                    setBody(draft.body || '');
                    setRepositoryId(draft.repositoryId || null);
                } catch (e) {
                    console.error("임시저장 불러오기 실패:", e);
                }
            })();
        }
    }, [draftId]);

    // 내 리포 목록 불러오기
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoadingRepos(true);
                setRepoError('');
                const list = await getMyRepositories();
                if (!mounted) return;
                setRepos(list);
                const init =
                    (repoFromQuery && Number(repoFromQuery)) ||
                    (list.length > 0 ? Number(list[0].id) : null);
                setRepositoryId(init);
            } catch (e) {
                setRepoError('리포지토리 목록을 불러오지 못했습니다.');
            } finally {
                setLoadingRepos(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [repoFromQuery]);

    // SHA-256 체크섬
    const makeChecksum = useCallback(async (text) => {
        if (!text) return '';
        const enc = new TextEncoder().encode(text);
        const buf = await crypto.subtle.digest('SHA-256', enc);
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }, []);

    // 게시물 작성
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!repositoryId) return setError('repositoryId가 없습니다.');
        if (!title.trim()) return setError('제목을 입력하세요.');
        if (!body.trim()) return setError('내용을 입력하세요.');

        try {
            setSubmitting(true);
            const checksum = await makeChecksum(body);

            const data = {
                title,
                body,
                checksum,
                repositoryId: Number(repositoryId),
                draftId: draftId ? Number(draftId) : null
            };

            const res = await writeArticle(data);

            console.log('📦 doWrite 응답:', res);

            if (res?.resultCode?.startsWith('S-')) {
                router.push(`/DiFF/article/list?repositoryId=${repositoryId}`);
            } else {
                setError(res?.msg || '작성 실패');
            }
        } catch (err) {
            if (err?.response?.status === 401) {
                router.replace('/DiFF/member/login');
            } else {
                setError(err?.response?.data?.msg || '요청 실패');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveDraft = async (e) => {
        e.preventDefault();
        setError('');

        if (!repositoryId) return setError('repositoryId가 없습니다.');
        if (!title.trim() && !body.trim()) return setError('빈 글은 저장할 수 없습니다.');

        try {
            setSubmitting(true);
            const checksum = await makeChecksum(body);

            const data = {
                id: draftId ? Number(draftId) : null, // 새 글이면 null
                title,
                body,
                checksum,
                repositoryId: Number(repositoryId)
            };

            const res = await saveDraft(data);

            console.log("💾 saveDraft 응답:", res);
            console.log("💾 resultCode:", res?.resultCode);
            console.log("💾 msg:", res?.msg);
            console.log("💾 data1 (draftId):", res?.data1);

            if (res && res.resultCode && res.resultCode.startsWith("S-")) {
                alert("임시저장 완료!");

                // 새 글일 때 draftId 갱신 → update 모드로 전환
                if (!draftId && res.data1) {
                    setDraftId(res.data1);
                }

                // 👉 작성 화면 그대로 유지 (router.push 제거)
            } else {
                console.error("❌ saveDraft 실패 응답:", res);
                setError(res?.msg || "임시저장 실패");
            }
        } catch (err) {
            console.error("💥 saveDraft error:", err);
            if (err?.response?.status === 401) {
                router.replace("/DiFF/member/login");
            } else {
                setError(err?.response?.data?.msg || err.message || "요청 실패");
            }
        } finally {
            setSubmitting(false);
        }
    };




    return (
<>
        <div>
            <button
                onClick={() => router.push('/DiFF/member/repository')}
            >
                <i className="fa-solid fa-angle-left"></i>
            </button>
        </div>

    <div className="container mx-auto mt-8 p-6 w-4/5 border border-neutral-300 rounded-xl">


            {/* 리포지토리 선택 */}
            <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">작성할 리포지토리</label>

                {loadingRepos ? (
                    <div className="text-sm text-gray-500">리포지토리 불러오는 중…</div>
                ) : repoError ? (
                    <div className="text-sm text-red-600">{repoError}</div>
                ) : repos.length === 0 ? (
                    <div className="text-sm text-red-600">내 리포지토리가 없습니다. 먼저 리포지토리를 생성하세요.</div>
                ) : (
                    <select
                        className="w-full border p-2 rounded"
                        value={repositoryId ?? ''}
                        onChange={(e) => setRepositoryId(Number(e.target.value))}
                    >
                        {repos.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name || r.repoName || `Repo#${r.id}`}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* 작성 폼 */}
            <form onSubmit={handleSubmit} className="space-y-4">

                {/* 제목 */}
                <input
                    className="w-full border p-2 rounded"
                    placeholder="제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                {/* 본문 */}
                <ToastEditor initialValue={body} onChange={setBody}/>

                {repositoryId && <div className="text-sm text-gray-600">repositoryId: {repositoryId}</div>}
                {error && <div className="text-sm text-red-600">{error}</div>}

                {/* 버튼들 */}
                <div className="flex justify-between text-center">
                    <button
                        type="submit"
                        disabled={submitting || !repositoryId}
                        className={`px-6 py-2 text-white rounded ${submitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-500'}`}
                    >
                        {submitting ? '업로드 중...' : '작성하기'}
                    </button>

                    <button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={submitting || !repositoryId}
                        className={`px-6 py-2 text-white rounded ${
                            submitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-500'
                        }`}
                    >
                        {submitting ? '저장 중...' : '임시저장'}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push('/DiFF/article/drafts')}
                        className="px-6 py-2 text-white rounded bg-gray-600 hover:bg-gray-500"
                    >
                        임시저장 글로 가기
                    </button>
                </div>
            </form>
        </div>
</>
    );
}
