"use client";

import { useState, useEffect } from 'react';
import { getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function WriteArticle() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [boardId, setBoardId] = useState('');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/api/auth/signin');
        }
    }, [status, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/DiFF/article/doWrite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ boardId, title, body }),
        });
        if (res.ok) {
            router.back();
        } else {
            console.error('작성 실패');
        }
    };

    return (
        <>
            <Head>
                <title>ARTICLE WRITE</title>
            </Head>
            <button
                onClick={() => router.back()}
                className="block text-4xl pl-10 cursor-pointer"
            >
                <i className="fa-solid fa-angle-left"></i>
            </button>

            <div className="container mx-auto mt-8 p-6 w-4/5 border border-neutral-300 rounded-xl overflow-hidden">
                <div className="font-semibold text-4xl text-neutral-800 px-1 py-6">
                    Article Write
                </div>

                <form onSubmit={handleSubmit} className="w-full">
                    <div className="flex justify-center flex-col">
                        <div className="flex px-3">
                            <select
                                name="boardId"
                                required
                                value={boardId}
                                onChange={(e) => setBoardId(e.target.value)}
                                className="block px-8 border border-neutral-500 rounded-lg overflow-hidden"
                            >
                                <option value="" disabled hidden>
                                    게시판 선택
                                </option>
                                <option value="1">공지사항</option>
                                <option value="2">자유 게시판</option>
                                <option value="3">질문과 답변</option>
                            </select>
                            <div className="flex-grow ml-4">
                                <input
                                    className="w-full px-4 py-2 border border-neutral-500 rounded-lg"
                                    type="text"
                                    name="title"
                                    placeholder="제목을 입력하세요"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <br />
                        <section>
              <textarea
                  className="resize-none w-full h-96 p-4 border border-neutral-500 rounded-lg"
                  name="body"
                  placeholder="내용을 입력하세요"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
              />
                        </section>
                        <br />
                    </div>

                    <div className="text-right px-2 pb-2">
                        <button
                            type="submit"
                            className="py-2.5 px-5 w-32 text-base font-large bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700"
                        >
                            Write
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);
    if (!session) {
        return {
            redirect: { destination: '/api/auth/signin', permanent: false },
        };
    }
    return { props: {} };
}
