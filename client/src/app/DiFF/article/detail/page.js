'use client';

import {Suspense, useEffect, useRef, useState} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import Link from 'next/link';
import {getArticle, deleteArticle, postReply, fetchReplies} from '@/lib/ArticleAPI';
import {deleteReply, modifyReply} from "@/lib/ReplyAPI";
import {
    likeArticle, unlikeArticle, fetchArticleLikes,
    likeReply, unlikeReply, fetchReplyLikes
} from "@/lib/reactionAPI";
import LoadingOverlay from "@/common/LoadingOverlay";
import ToastViewer from "@/common/toastViewer";

function ArticleDetailInner() {

    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState('');
    const [deleting, setDeleting] = useState(false);

    // 좋아요
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    // 댓글 상태
    const [replies, setReplies] = useState([]);
    const [reply, setReply] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);

    // 드롭다운
    const [menuOpen, setMenuOpen] = useState(false);
    const menuBtnRef = useRef(null);
    const menuRef = useRef(null);

    // 게시글 불러오기
    useEffect(() => {
        if (!id) {
            console.warn("⚠️ [DetailPage] id 없음 (쿼리스트링 미포함)");
            return;
        }

        let alive = true;

        (async () => {
            setLoading(true);
            setErrMsg('');

            try {
                const art = await getArticle(id);
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
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [id]);

    // 좋아요 불러오기
    useEffect(() => {
        if (!id) return;

        (async () => {
            try {
                const like = await fetchArticleLikes(id); // { liked: true/false, count: number }
                console.log("like 불러오기 응답", like);

                // 🔑 이전 상태와 비교 후 다를 때만 업데이트
                setLiked((prev) => (prev !== like.liked ? like.liked : prev));
                setLikeCount((prev) => (prev !== like.count ? like.count : prev));
            } catch (e) {
                console.error("❌ 좋아요 상태 불러오기 실패:", e);
            }
        })();
    }, [id]);

    // 댓글 목록 불러오기
    useEffect(() => {
        if (!id) return;

        (async () => {
            try {
                setReplyLoading(true);
                const res = await fetchReplies(id); // 서버에서 댓글 리스트 가져오기

                // 댓글별 좋아요 정보도 같이 불러오기
                const withLikes = await Promise.all(
                    (res.replies || []).map(async (r) => {
                        try {
                            const likeRes = await fetchReplyLikes(r.id); // { liked, count }
                            return {...r, liked: likeRes.liked, likeCount: likeRes.count};
                        } catch (e) {
                            console.error("❌ 댓글 좋아요 상태 불러오기 실패:", e);
                            return {...r, liked: false, likeCount: 0};
                        }
                    })
                );

                setReplies(withLikes);
            } catch (e) {
                console.error("❌ 댓글 불러오기 실패:", e);
            } finally {
                setReplyLoading(false);
            }
        })();
    }, [id]);

    // 드롭다운
    useEffect(() => {
        if (!menuOpen) return;
        const onDocDown = (e) => {
            if (menuRef.current?.contains(e.target)) return;
            if (menuBtnRef.current?.contains(e.target)) return;
            setMenuOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                setMenuOpen(false);
                menuBtnRef.current?.focus();
            }
        };
        document.addEventListener('mousedown', onDocDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDocDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [menuOpen]);

    // 게시글 삭제
    const handleDelete = async (id) => {

        if (!id) return;

        const ok = window.confirm("이 게시글을 삭제하시겠습니까?");
        if (!ok) return;

        if (!article.userCanDelete) return;

        try {
            setDeleting(true);
            const res = await deleteArticle(id);
            const resultCode = res?.resultCode ?? res?.ResultCode ?? res?.code ?? '';
            const isSuccess =
                res?.status === 200 ||
                (typeof resultCode === 'string' && resultCode.startsWith('S-')) ||
                res?.success === true ||
                (typeof res?.msg === 'string' && res.msg.includes('성공'));

            if (isSuccess) {
                alert("게시물이 삭제되었습니다.");
                router.push("/api/DiFF/article/list?repositoryId=" + article.repositoryId);
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

    // 좋아요 토글
    const handleLikeToggle = async () => {
        try {
            if (liked) {
                await unlikeArticle(id);
                setLiked(false);
                setLikeCount((c) => c - 1);
            } else {
                await likeArticle(id);
                setLiked(true);
                setLikeCount((c) => c + 1);
            }
        } catch (e) {
            console.error("좋아요 토글 실패:", e);
            alert("좋아요 처리 중 문제가 발생했습니다.");
        }
    };

    // 댓글 작성
    const handleSubmitreply = async (e) => {
        e.preventDefault();
        if (!reply.trim()) return;

        try {
            await postReply(id, reply);
            setReply('');
            // 다시 목록 불러오기
            const res = await fetchReplies(id);
            const withLikes = await Promise.all(
                (res.replies || []).map(async (r) => {
                    const likeRes = await fetchReplyLikes(r.id);
                    return {...r, liked: likeRes.liked, likeCount: likeRes.count};
                })
            );
            setReplies(withLikes);
        } catch (e) {
            console.error("❌ 댓글 작성 실패:", e);
            alert(e?.response?.data?.msg || "댓글 작성에 실패했습니다.");
        }
    };

    // 댓글 좋아요 토글
    const handleReplyLikeToggle = async (replyId, liked) => {
        try {
            if (liked) {
                await unlikeReply(replyId);
                setReplies((prev) =>
                    prev.map((item) =>
                        item.id === replyId ? {...item, liked: false, likeCount: item.likeCount - 1} : item
                    )
                );
            } else {
                await likeReply(replyId);
                setReplies((prev) =>
                    prev.map((item) =>
                        item.id === replyId ? {...item, liked: true, likeCount: item.likeCount + 1} : item
                    )
                );
            }
        } catch (e) {
            console.error("❌ 댓글 좋아요 토글 실패:", e);
            alert("댓글 좋아요 처리 중 오류가 발생했습니다.");
        }
    };

    if (!id) return <p className="text-red-500">잘못된 접근입니다 (id 없음)</p>;
    if (!article) return <p className="text-gray-500">게시글이 존재하지 않습니다.</p>;

    return (
        <>
            <LoadingOverlay show={loading}/>

            {errMsg ? (
                <div className="p-6 max-w-3xl mx-auto">
                    <p className="text-red-500">{errMsg}</p>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto">
                    {/* title */}
                    <div className="flex justify-between">
                        <h1 className="text-3xl font-bold mb-2">{article.title}</h1>

                        <div className="relative">
                            <button
                                ref={menuBtnRef}
                                type="button"
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                                onClick={() => setMenuOpen(v => !v)}
                                onKeyDown={(e) => {
                                    if (e.key === 'ArrowDown' && !menuOpen) {
                                        e.preventDefault();
                                        setMenuOpen(true);
                                    }
                                }}
                                className="p-2 hover:text-gray-900"
                            >
                                <i className="fa-solid fa-ellipsis-vertical"/>
                            </button>

                            {menuOpen && (
                                <div
                                    ref={menuRef}
                                    role="menu"
                                    className="absolute right-0 mt-2 z-10 w-44 border origin-top-right rounded-lg bg-white shadow-sm
                                                divide-y divide-gray-100 font-normal dark:bg-gray-700 dark:divide-gray-600"
                                    onKeyDown={(e) => {
                                        const items = Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]') || []);
                                        const i = items.indexOf(document.activeElement);
                                        let next = i;
                                        if (e.key === 'ArrowDown') {
                                            e.preventDefault();
                                            next = (i + 1) % items.length;
                                        }
                                        if (e.key === 'ArrowUp') {
                                            e.preventDefault();
                                            next = (i - 1 + items.length) % items.length;
                                        }
                                        if (e.key === 'Home') {
                                            e.preventDefault();
                                            next = 0;
                                        }
                                        if (e.key === 'End') {
                                            e.preventDefault();
                                            next = items.length - 1;
                                        }
                                        if (items[next]) items[next].focus();
                                    }}
                                >
                                    <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                        {article.userCanModify && (
                                            <li>
                                                <Link
                                                    href={`/DiFF/article/modify?id=${article.id}`}
                                                    role="menuitem"
                                                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                                    onClick={() => setMenuOpen(false)}
                                                >
                                                    수정
                                                </Link>
                                            </li>
                                        )}
                                        {article.userCanDelete && (
                                            <li>
                                                <Link
                                                    href={`/DiFF/article/modify?id=${article.id}`}
                                                    role="menuitem"
                                                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                                    onClick={() => setMenuOpen(false)}
                                                >
                                                    삭제
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                    <div className="py-1">
                                        <button
                                            type="button"
                                            role="menuitem"
                                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100
                                                    dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                                            onClick={async () => {
                                                try {
                                                    const url = `${window.location.origin}/DiFF/article/detail?id=${article.id}`;
                                                    // 표준 클립보드 API
                                                    await navigator.clipboard.writeText(url);
                                                    alert('링크가 복사되었습니다.');
                                                } catch {
                                                    // 구형 브라우저 폴백
                                                    const url = `${window.location.origin}/DiFF/article/detail?id=${article.id}`;
                                                    const input = document.createElement('input');
                                                    input.value = url;
                                                    document.body.appendChild(input);
                                                    input.select();
                                                    document.execCommand('copy');
                                                    document.body.removeChild(input);
                                                    alert('링크가 복사되었습니다.');
                                                } finally {
                                                    setMenuOpen(false);
                                                }
                                            }}
                                        >
                                            <i className="fa-solid fa-share-nodes mr-2"></i>
                                            링크 복사
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* article info */}
                    <div className="text-gray-600 mb-6 flex justify-between">
                        <div className="flex justify-start">
                            <div
                                onClick={(e) => {
                                    e.stopPropagation(); // 부모 Link 클릭 막기
                                    e.preventDefault();
                                    window.location.href = `/DiFF/member/profile?nickName=${encodeURIComponent(
                                        article.extra__writer
                                    )}`;
                                }}
                                className="mx-2 hover:underline hover:text-black cursor-pointer text-md font-semibold"
                            >
                                {article.extra__writer}
                            </div>
                            <div className="mx-2 text-gray-500">{new Date(article.regDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                            })}</div>
                        </div>
                        <div className="flex items-center gap-1 cursor-pointer" onClick={handleLikeToggle}>
                            <i
                                className={`${liked ? "fa-solid text-red-500" : "fa-regular text-gray-500"} fa-heart text-xl`}
                            ></i>
                            <span className="text-sm text-gray-700">{likeCount}</span>
                        </div>
                    </div>

                    {/* 본문 */}
                    <div
                        className="prose max-w-none whitespace-pre-wrap leading-relaxed text-lg text-gray-800 border-t border-b py-6">
                        <ToastViewer content={article.body} showImages={true}/>
                    </div>

                    {/* 하단 버튼 영역 */}
                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                        >
                            뒤로가기
                        </button>

                        {article.userCanModify && (
                            <Link
                                href={`/DiFF/article/modify?id=${article.id}`}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                            >
                                수정
                            </Link>
                        )}

                        {article.userCanDelete && (
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
                        )}
                    </div>

                    {/* 댓글 입력 */}
                    <div className="mt-10">
                        <form onSubmit={handleSubmitreply}>
                            <label htmlFor="chat" className="sr-only">댓글 작성</label>
                            <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                                <textarea
                                    id="chat"
                                    rows="1"
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    className="block resize-none mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300
                                               focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600
                                               dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="댓글을 입력하세요"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex justify-center p-4 text-blue-600 rounded-md cursor-pointer
                                               hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600"
                                >
                                    <svg
                                        className="w-5 h-5 rotate-90 rtl:-rotate-90"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 18 20"
                                    >
                                        <path
                                            d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z"/>
                                    </svg>
                                    <span className="sr-only">댓글 전송</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* 댓글 목록 */}
                    <div className="my-6 space-y-4">
                        {replyLoading ? (
                            <p className="text-gray-500">댓글 불러오는 중...</p>
                        ) : replies.length === 0 ? (
                            <p className="text-gray-500">아직 댓글이 없습니다.</p>
                        ) : (
                            replies.map((r) => (
                                <div key={r.id} className="mb-2 border-b pb-2">
                                    {r.isEditing ? (
                                        // 댓글 수정
                                        <div>
                                            <div className="text-sm text-gray-400 mb-4">
                                                {r.extra__writer} |
                                                {new Date(r.regDate).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric"
                                                })}
                                            </div>
                                            <textarea
                                                className="border w-full p-2 rounded-lg"
                                                rows="1"
                                                value={r.body}
                                                onChange={(e) =>
                                                    setReplies((prev) =>
                                                        prev.map((item) =>
                                                            item.id === r.id ? {...item, body: e.target.value} : item
                                                        )
                                                    )
                                                }
                                            />
                                            <div className="mt-1 flex gap-2">
                                                <button
                                                    onClick={async () => {
                                                        const res = await modifyReply(r.id, r.body);
                                                        if (res.resultCode.startsWith("S-")) {
                                                            setReplies((prev) =>
                                                                prev.map((item) =>
                                                                    item.id === r.id ? {
                                                                        ...item,
                                                                        isEditing: false
                                                                    } : item
                                                                )
                                                            );
                                                        }
                                                    }}
                                                    className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                                                >
                                                    저장
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setReplies((prev) =>
                                                            prev.map((item) =>
                                                                item.id === r.id ? {...item, isEditing: false} : item
                                                            )
                                                        )
                                                    }
                                                    className="px-2 py-1 bg-gray-400 text-white rounded text-xs"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // 일반 댓글 표시
                                        <div>
                                            {/* 일반 댓글 표시 */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        {/* 프로필 사진 */}
                                                        <Link href={`/DiFF/member/profile?nickName=${encodeURIComponent(r.extra__writer)}`}>
                                                            {r.profileUrl ? (
                                                                <img
                                                                    src={r.profileUrl}
                                                                    alt={`${r.extra__writer} 프로필`}
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                                                                    {r.extra__writer?.[0] ?? "?"}
                                                                </div>
                                                            )}
                                                        </Link>

                                                        {/* 닉네임 */}
                                                        <Link
                                                            href={`/DiFF/member/profile?nickName=${encodeURIComponent(r.extra__writer)}`}
                                                            className="font-semibold hover:underline"
                                                        >
                                                            {r.extra__writer}
                                                        </Link>
                                                    </div>

                                                    {/* 날짜 */}
                                                    <span>
      {new Date(r.regDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
      })}
    </span>
                                                </div>
                                            </div>


                                            <div className="flex justify-between items-center">
                                                <p>{r.body}</p>

                                                <div className="flex gap-2 items-center">
                                                    {/* 댓글 좋아요 버튼 */}
                                                    <button
                                                        onClick={() => handleReplyLikeToggle(r.id, r.liked)}
                                                        className="flex items-center gap-1 text-sm"
                                                    >
                                                        <i
                                                            className={`${
                                                                r.liked ? "fa-solid text-red-500" : "fa-regular text-gray-500"
                                                            } fa-heart`}
                                                        />
                                                        <span>{r.likeCount ?? 0}</span>
                                                    </button>

                                                    {/* 수정/삭제 버튼 */}
                                                    {r.userCanModify && (
                                                        <button
                                                            onClick={() =>
                                                                setReplies((prev) =>
                                                                    prev.map((item) =>
                                                                        item.id === r.id ? {
                                                                            ...item,
                                                                            isEditing: true
                                                                        } : item
                                                                    )
                                                                )
                                                            }
                                                            className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
                                                        >
                                                            수정
                                                        </button>
                                                    )}
                                                    {r.userCanDelete && (
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm("정말 삭제하시겠습니까?")) {
                                                                    const res = await deleteReply(r.id);
                                                                    if (res.resultCode.startsWith("S-")) {
                                                                        setReplies((prev) => prev.filter((item) => item.id !== r.id));
                                                                        alert("댓글이 삭제 되었습니다.");
                                                                    }
                                                                }
                                                            }}
                                                            className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                                                        >
                                                            삭제
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="h-32 w-full">

                    </div>
                </div>
            )}
        </>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<p>불러오는 중...</p>}>
            <ArticleDetailInner/>
        </Suspense>
    );
}
