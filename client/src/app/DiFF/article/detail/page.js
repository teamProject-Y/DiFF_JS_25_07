'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getArticle, deleteArticle } from '@/lib/ArticleAPI';

function ArticleDetailInner() {
    console.log("✅ ArticleDetailInner 렌더됨");

    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id'); // ✅ ?id=25 읽어옴

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [me, setMe] = useState(null);

    useEffect(() => {
        // 예시: localStorage 또는 API 통해 로그인 유저 정보 가져오기
        const stored = localStorage.getItem("loginedMemberId");
        if (stored) {
            setMe(Number(stored));
        }
    }, []);

    useEffect(() => {
        if (!id) {
            console.warn("⚠️ [DetailPage] id 없음 (쿼리스트링 미포함)");
            return;
        }

        let alive = true;

        (async () => {
            setLoading(true);
            setErrMsg('');

            console.log("🛰️ [DetailPage] useEffect 시작됨, id =", id);

            try {
                const art = await getArticle(id); // ArticleAPI.js 호출
                console.log("📡 [DetailPage] getArticle 응답:", art);

                if (!alive) return;
                if (!art) {
                    setErrMsg('게시글을 불러오지 못했습니다.');
                    setArticle(null);
                } else {
                    setArticle(art);
                }
            } catch (e) {
                if (!alive) return;
                console.error('❌ [DetailPage] fetch error:', e);
                setErrMsg('에러가 발생했습니다.');
                setArticle(null);
            } finally {
                if (alive) {
                    console.log("✅ [DetailPage] 로딩 종료");
                    setLoading(false);
                }
            }
        })();

        return () => {
            alive = false;
            console.log("🛑 [DetailPage] useEffect cleanup 실행됨");
        };
    }, [id]);

    const handleDelete = async (id) => {
        if (!id) return;
        const ok = window.confirm("이 게시글을 삭제하시겠습니까?");
        if (!ok) return;

        try {
            setDeleting(true);
            const res = await deleteArticle(id);
            console.log("[ArticleDetail] deleteArticle() response:", res);

            const resultCode = res?.resultCode ?? res?.ResultCode ?? res?.code ?? '';
            const isSuccess =
                res?.status === 200 ||
                (typeof resultCode === 'string' && resultCode.startsWith('S-')) ||
                res?.success === true ||
                (typeof res?.msg === 'string' && res.msg.includes('성공'));

            if (isSuccess) {
                alert("삭제 완료!");
                router.push("/DiFF/article/list?repositoryId=" + article.repositoryId);
            } else {
                const msg = res?.msg || "삭제에 실패했습니다.";
                alert(msg);
            }
        } catch (e) {
            console.error("[ArticleDetail] delete request error:", e);
            alert(e?.response?.data?.msg || "삭제 요청에 실패했습니다.");
        } finally {
            setDeleting(false);
        }
    };

    if (!id) return <p className="text-red-500">잘못된 접근입니다 (id 없음)</p>;
    if (loading) return <p className="text-gray-500">불러오는 중...</p>;
    if (errMsg) return <p className="text-red-500">{errMsg}</p>;
    if (!article) return <p className="text-gray-500">게시글이 존재하지 않습니다.</p>;

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* 제목 */}
            <h1 className="text-3xl font-bold mb-2">{article.title}</h1>

            {/* 작성자 + 날짜 */}
            <div className="text-sm text-gray-600 mb-6 flex gap-4">
                <span>✍ 작성자: {article.writer ?? '익명'}</span>
                <span>📅 작성일: {article.regDate}</span>
                {article.updateDate && (
                    <span>📝 수정일: {article.updateDate}</span>
                )}
            </div>

            {/* 본문 */}
            <div className="prose max-w-none whitespace-pre-wrap leading-relaxed text-lg text-gray-800 border-t border-b py-6">
                {article.body}
            </div>

            <div className="mt-8 flex gap-4">
                <Link
                    href={`/DiFF/article/list?repositoryId=${article.repositoryId}`}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                    목록으로
                </Link>

                {/* 로그인 사용자와 작성자가 동일할 때만 수정/삭제 버튼 노출 */}
                {me === article.memberId && (
                    <>
                        <Link
                            href={`/DiFF/article/modify?id=${article.id}`}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                            수정하기
                        </Link>
                        <button
                            onClick={() => handleDelete(article.id)}
                            disabled={deleting}
                            className={`px-4 py-2 rounded transition ${
                                deleting
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-red-500 text-white hover:bg-red-600"
                            }`}
                        >
                            {deleting ? "삭제중…" : "삭제하기"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<p>불러오는 중...</p>}>
            <ArticleDetailInner />
        </Suspense>
    );
}
