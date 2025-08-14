"use client";

import { useState, useEffect } from 'react';
import { getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function ModifyArticle({ article }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { id } = router.query;
    const [title, setTitle] = useState(article.title);
    const [body, setBody] = useState(article.body);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/api/auth/signin');
        }
    }, [status, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/DiFF/article/doModify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, title, body }),
        });
        if (res.ok) router.back();
        else console.error('수정 실패');
    };

    return (
        <>
            <Head>
                <title>ARTICLE MODIFY</title>
            </Head>
            <button
                onClick={() => router.back()}
                className="block text-4xl pl-10 cursor-pointer"
            >
                <i className="fa-solid fa-angle-left"></i>
            </button>

            <div className="container mx-auto">
                <div className="title text-neutral-800 text-4xl font-bold mx-2 my-6">
                    <span>Article {id} Modify</span>
                </div>
                <div className="border bg-neutral-100 border-neutral-400 rounded-3xl px-8 py-5">
                    <form onSubmit={handleSubmit}>
                        <input type="hidden" name="id" value={id} />

                        <label>제목</label>
                        <div className="border border-neutral-500 rounded-md overflow-hidden">
                            <input
                                className="w-full p-2"
                                required
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <br />

                        <label>내용</label>
                        <div className="border border-neutral-500 rounded-md overflow-hidden">
              <textarea
                  className="w-full p-2"
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
              />
                        </div>
                        <br />

                        <div className="flex justify-end">
                            <button
                                className="border border-neutral-400 rounded-lg px-3 py-2 hover:bg-neutral-300"
                                type="submit"
                            >
                                수정하기
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export async function getServerSideProps(context) {
    const session = await getSession(context);
    if (!session) {
        return {
            redirect: {
                destination: '/api/auth/signin',
                permanent: false,
            },
        };
    }

    const { id } = context.params;
    const res = await fetch('http://localhost:8080/DiFF/article/getArticle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
    const article = await res.json();

    return {
        props: { article },
    };
}
