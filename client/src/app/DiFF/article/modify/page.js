'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getArticle, modifyArticle } from '@/lib/ArticleAPI';
import LoadingOverlay from '@/common/LoadingOverlay';
import ToastEditor from "@/common/toastEditor";

/** 바깥 컴포넌트는 Suspense 래퍼만 담당 (CSR bail-out 해결) */
export default function ModifyArticlePage() {
    return (
        <Suspense fallback={<div>로딩...</div>}>
            <ModifyArticlePageInner />
        </Suspense>
    );
}

function ModifyArticlePageInner() {

    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [article, setArticle] = useState(null);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState('');

    // 권한 확인, 게시물 불러오기
    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const art = await getArticle(id); // 토큰 자동 첨부됨
                if (!art?.userCanModify) {
                    alert('수정 권한이 없습니다.');
                    router.replace(`/DiFF/article/detail?id=${id}`);
                    return;
                }
                setArticle(art);
                setTitle(art.title ?? '');
                setBody(art.body ?? '');
            } catch (e) {
                const status = e?.response?.status;
                if (status === 401) {
                    alert('로그인이 필요합니다.');
                    router.replace('/DiFF/member/login');
                } else if (status === 403) {
                    alert('수정 권한이 없습니다.');
                    router.replace(`/DiFF/article/detail?id=${id}`);
                } else {
                    console.error('[ModifyArticle] 불러오기 오류:', e);
                    setErrMsg('게시글을 불러오지 못했습니다.');
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [id, router]);

    // 수정 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!id) {
                alert('잘못된 접근입니다. (id 없음)');
                return;
            }

            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('로그인이 필요합니다.');
                router.replace('/DiFF/member/login');
                return;
            }

            // 서버에 보낼 최소 데이터만 구성
            const modifiedArticle = {
                id: Number(id),
                title: title,
                body: body,
                userCanModify: true,
            };

            console.log("body: ", body);

            const modifyRd = await modifyArticle(modifiedArticle, token); // 토큰 포함해서 API 호출
            alert('수정이 완료되었습니다.');
            console.log(modifyRd);
            router.push(`/DiFF/article/detail?id=${id}`);
        } catch (e) {
            console.error('❌ 수정 실패:', e);
            alert('수정에 실패했습니다. 다시 시도해주세요.');
        }
    };

    return (
        <>
            <LoadingOverlay show={loading} />

            {errMsg ? (
                <div className="p-6 w-5/6 mx-auto">
                    <p className="text-red-500">{errMsg}</p>
                </div>
            ) : (
            <div className="py-6 w-5/6 mx-auto">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 작성하세요"
                        className="p-2 rounded"
                    />
                    <ToastEditor
                        key={id}
                        initialValue={article?.body ?? ''}
                        onChange={setBody}
                    />
                    <div className="flex gap-4 mt-4">
                        <Link
                            href={`/DiFF/article/detail?id=${id}`}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                        >
                            취소
                        </Link>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                            수정하기
                        </button>
                    </div>
                </form>
            </div>
            )}
        </>
    );
};
