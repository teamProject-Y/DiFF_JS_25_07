"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

async function fetchArticle(id) {
    const API_BASE = process.env.BACKEND_URL || 'http://localhost:8080';
    const res = await fetch(`${API_BASE}/DiFF/article/${id}`);
    if (!res.ok) throw new Error('Failed to fetch article');
    return await res.json();
}

async function fetchComments(id) {
    const API_BASE = process.env.BACKEND_URL || 'http://localhost:8080';
    const res = await fetch(`${API_BASE}/DiFF/article/${id}/comments`);
    if (!res.ok) throw new Error('Failed to fetch comments');
    return await res.json();
}

export default function ArticleDetailPage({ params }) {
    const { id } = params; // `params`에서 id 추출
    const router = useRouter();
    const [article, setArticle] = useState(null);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        if (!id) return;
        fetchArticle(id)
            .then(data => setArticle(data.article))
            .catch(error => console.error(error));

        fetchComments(id)
            .then(data => setComments(data.comment))
            .catch(error => console.error(error));
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const body = e.target.body.value.trim();
        if (!body) return;

        const res = await fetch('/DiFF/article/comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body, articleId: id }),
        });

        const result = await res.json();
        if (result.resultCode.startsWith('S-')) {
            setComments([...comments, result.data]);
            e.target.body.value = ''; // 댓글 입력 필드 초기화
        }
    };

    if (!article) return <p>Loading article...</p>;

    return (
        <>
            <button onClick={() => router.back()} className="text-4xl pl-10 cursor-pointer">
                ←
            </button>

            <div className="container mx-auto my-6 p-6 bg-neutral-100 rounded-xl">
                <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
                <div className="text-sm text-neutral-600 mb-4">
                    작성일: {article.regDate.substring(0, 10)} | 조회수: {article.hit}
                </div>

                <div className="prose mb-4">{article.body}</div>

                <div className="flex items-center space-x-4 mb-6">
                    <button
                        onClick={toggleLike}
                        className={`px-4 py-2 border rounded ${article.userReaction === 1 ? 'bg-neutral-300' : ''}`}
                    >
                        👍 {article.extra_goodReactionPoint}
                    </button>
                </div>

                <hr />

                <section className="mt-6">
                    <h2 className="text-2xl mb-4">Comment</h2>

                    {comments.map(c => (
                        <div key={c.id} className="mb-4 p-4 border rounded">
                            <strong>{c.extra_writer}</strong>
                            <p>{c.body}</p>
                        </div>
                    ))}

                    <form onSubmit={handleCommentSubmit} className="mt-6">
                        <input
                            name="body"
                            type="text"
                            placeholder="나도 한마디 하기!"
                            className="w-full p-2 border rounded mb-2"
                        />
                        <button type="submit" className="px-4 py-2 bg-neutral-800 text-white rounded">
                            게시
                        </button>
                    </form>
                </section>
            </div>
        </>
    );
}

// app/DiFF/article/detail/[id]/page.js
export default function ArticleDetailPage({ params }) {
    const { id } = params; // 동적 라우팅을 통해 article의 ID를 가져옵니다.

    return (
        <Suspense fallback={<p>Loading...</p>}>
            <ArticleDetail id={id} />
        </Suspense>
    );
}
