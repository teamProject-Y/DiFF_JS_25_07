// src/app/DiFF/article/write/page.js
'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { writeArticle, showRepo, getMyRepositories } from '@/lib/ArticleAPI';

export default function Page() {
    return (
        <Suspense fallback={<div className="p-4">Loading…</div>}>
            <WriteArticlePage />
        </Suspense>
    );
}

function WriteArticlePage() {
    const router = useRouter();
    const sp = useSearchParams();

    const bodyFromQuery = sp.get('body') || '';
    const repoFromQuery = sp.get('repositoryId');

    // 상태
    const [title, setTitle] = useState('');
    const [body, setBody] = useState(bodyFromQuery);
    const [repos, setRepos] = useState([]);     // 내 리포 목록
    const [repositoryId, setRepositoryId] = useState(null); // 선택 repo id
    const [loadingRepos, setLoadingRepos] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [repoError, setRepoError] = useState('');

    // 로그인 체크
    useEffect(() => {
        const token = typeof window !== 'undefined' && localStorage.getItem('accessToken');
        if (!token) router.replace('/DiFF/member/login');
    }, [router]);

    // 쿼리 body 동기화
    useEffect(() => { setBody(bodyFromQuery); }, [bodyFromQuery]);

    // 내 리포 목록 불러오기
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoadingRepos(true);
                setRepoError('');
                const list = await getMyRepositories(); // ⭐️ 목록 API
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
        return () => { mounted = false; };
    }, [repoFromQuery]);

    // SHA-256 체크섬
    const makeChecksum = useCallback(async (text) => {
        if (!text) return '';
        const enc = new TextEncoder().encode(text);
        const buf = await crypto.subtle.digest('SHA-256', enc);
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!repositoryId) return setError('repositoryId가 없습니다.');
        if (!title.trim()) return setError('제목을 입력하세요.');
        if (!body.trim())  return setError('내용을 입력하세요.');

        try {
            setSubmitting(true);
            const checksum = await makeChecksum(body);
            const data = { title, body, checksum, repositoryId: Number(repositoryId) };

            const res = await writeArticle(data); // ⭐️ doWrite 호출 → DB insert
            // 콘솔 확인(디버깅)
            console.log('📦 doWrite 응답:', res);
            console.log('📦 repository:', res?.data?.repository);
            console.log('📦 draft:', res?.data?.draft);
            console.log('📦 articleId:', res?.data?.articleId);

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

    return (
        <div className="container mx-auto mt-8 p-6 w-4/5 border border-neutral-300 rounded-xl">
            <button onClick={() => router.back()} className="text-xl mb-4">← 뒤로</button>
            <h1 className="text-3xl font-bold mb-6">Article Write</h1>

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

                {repositoryId && <div className="text-sm text-gray-600">repositoryId: {repositoryId}</div>}
                {error && <div className="text-sm text-red-600">{error}</div>}

                <button
                    type="submit"
                    disabled={submitting || !repositoryId}
                    className={`px-6 py-2 text-white rounded ${submitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-500'}`}
                >
                    {submitting ? '업로드 중...' : '작성하기'}
                </button>
            </form>
        </div>
    );
}
