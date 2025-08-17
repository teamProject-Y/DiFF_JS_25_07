'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // ✅ 쿼리스트링용
import Link from 'next/link';
import { getArticle } from '@/lib/ArticleAPI';

function ArticleDetailInner() {
    console.log("✅ ArticleDetailInner 렌더됨");

    const searchParams = useSearchParams();
    const id = searchParams.get('id'); // ✅ ?id=25 읽어옴

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState('');

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

            {/* 하단 버튼 영역 */}
            <div className="mt-8 flex gap-4">
                <Link
                    href="/DiFF/article/list"
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                    목록으로
                </Link>
                <Link
                    href={`/DiFF/article/modify?id=${article.id}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    수정하기
                </Link>
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
