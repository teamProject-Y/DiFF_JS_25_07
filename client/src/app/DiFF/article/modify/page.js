'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getArticle, modifyArticle } from '@/lib/ArticleAPI';

export default function ModifyArticlePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState('');

    // 기존 게시글 불러오기
    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const article = await getArticle(id);
                setTitle(article.title || '');
                setBody(article.body || '');
            } catch (e) {
                console.error(e);
                setErrMsg('게시글을 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    // 수정 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await modifyArticle(id, { title, body });
            alert('수정 완료!');
            router.push(`/DiFF/article/detail?id=${id}`);
        } catch (e) {
            console.error(e);
            alert('수정 실패 ㅠㅠ');
        }
    };

    if (loading) return <p>불러오는 중...</p>;
    if (errMsg) return <p className="text-red-500">{errMsg}</p>;

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">게시글 수정 (Modify)</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목"
                    className="border p-2 rounded"
                />
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="내용"
                    className="border p-2 rounded min-h-[200px]"
                />
                <div className="flex gap-4 mt-4">
                    <Link href={`/DiFF/article/detail?id=${id}`}
                          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition">
                        취소
                    </Link>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                        수정 완료
                    </button>
                </div>
            </form>
        </div>
    );
}
