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
import {
    fetchUser,
    followMember,
    unfollowMember,
    getFollowingList
} from '@/lib/UserAPI';
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

    const [replyMenuOpen, setReplyMenuOpen] = useState(null);

    // === 팔로우 칩용 state ===
    const [authorId, setAuthorId] = useState(null);
    const [myId, setMyId] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [member, setMember] = useState(null);
    const [isMyPost, setIsMyPost] = useState(false);
    const [hoverUnfollow, setHoverUnfollow] = useState(false);

    const textareaRef = useRef(null);

    const norm = (s) => (s ?? '').toString().trim().toLowerCase();

    const getId = (m) => Number(
        m?.id ??
        m?.memberId ??
        m?.userId ??
        m?.targetId ??
        m?.followingId ??
        m?.followingsId ??
        m?.user?.id ??
        m?.target?.id ??
        0
    );

    const getNick = (m) =>
        (m?.nickName ?? m?.nickname ?? m?.name ?? m?.user?.nickName ?? m?.user?.name ?? m?.extra__writer ?? '').toString().trim();

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
                console.log("api 응답: ", art)
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
                const like = await fetchArticleLikes(id);
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

// ESC & outside click to close
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && setReplyMenuOpen(null);
        const onDown = (e) => {
            if (!replyMenuOpen) return;
            const btn = menuBtnRef.current;
            const menu = menuRef.current;
            if (menu && menu.contains(e.target)) return;
            if (btn && btn.contains(e.target)) return;
            setReplyMenuOpen(null);
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onDown);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onDown);
        };
    }, [replyMenuOpen]);

    // 팔로우 상태 초기화 useEffect 교체
    useEffect(() => {
        (async () => {
            if (!article?.extra__writer) return;
            if (myId === null) return;

            try {

                // 1) 작성자 id
                const u = await fetchUser(article.extra__writer);
                const targetId = Number(u?.member?.id) || 0;
                const authorNickN = norm(article.extra__writer);
                setAuthorId(targetId);

                // 🔒 ID로 내 글 판정 (myId가 아직 없으면 일단 진행, 다음 렌더에서 막힘)
                if (myId && targetId && myId === targetId) {
                    setIsMyPost(true);
                    setMember(null);
                    return;
                }
                setIsMyPost(false);

                // 2) 내 팔로잉 리스트
                const fl = await getFollowingList(); // <-- 인자 없이 호출 (null 이슈 회피)
                const list = fl?.followingList || fl?.data1 || fl?.list || fl?.items || [];

                // 디버깅: 이 블록 "안에서만" 찍어라
                console.log('[FOLLOW DEBUG] authorId=', targetId, 'authorNick=', article.extra__writer);
                console.table((list || []).slice(0, 5).map(m => ({
                    rawId: m?.id ?? m?.memberId ?? m?.followingId ?? m?.targetId ?? m?.user?.id,
                    normId: getId(m),
                    nick: getNick(m)
                })));

                // ID 우선 → 닉네임 보강
                const isFollowing =
                    (targetId && list.some(m => getId(m) === targetId)) ||
                    list.some(m => norm(getNick(m)) === authorNickN);

                setMember({id: targetId || null, isFollowing, nickName: article.extra__writer});
                console.log('[FOLLOW DEBUG] isFollowing=', isFollowing);
            } catch (e) {
                console.error('❌ 작성자 member 구성 실패:', e);
                setMember({id: null, isFollowing: false, nickName: article.extra__writer});
            }
        })();
    }, [id, article?.extra__writer, myId]);

    // 내 회원 ID 로드
    useEffect(() => {
        (async () => {
            try {
                const me = await fetchUser(); // nickName 전달 X → 현재 로그인 사용자
                setMyId(Number(me?.member?.id) || null);
            } catch (e) {
                console.error('내 정보 로드 실패:', e);
                setMyId(null);
            }
        })();
    }, [id]);

    // 글 아이디 바뀌면 팔로우 관련 상태 초기화 (잔존 상태 제거)
    useEffect(() => {
        setIsMyPost(false);
        setMember(null);
        setIsFollowing(false);
    }, [id]);

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

    // const refreshFollowFromServer = async (id) => {
    //     try {
    //         const fl = await getFollowingList();
    //         const list = fl?.followingList || fl?.data1 || fl?.list || fl?.items || [];
    //         const now =
    //             (id && list.some(m => getId(m) === Number(id))) ||
    //             list.some(m => getNick(m) === (authorNick ?? '').trim());
    //         setIsFollowing(!!now);
    //     } catch (e) {
    //         console.error('❌ 팔로우 재확인 실패:', e);
    //     }
    // };
    //
    // const onFollowToggle = async () => {
    //     if (!authorId || followBusy) return;
    //     setFollowBusy(true);
    //     try {
    //         if (isFollowing) {
    //             const res = await unfollowMember(authorId);
    //             const ok = res?.resultCode?.startsWith?.('S-') || res?.success === true || (res?.msg || '').includes('팔로우 중이 아닙니다');
    //             if (!ok) throw new Error(res?.msg || '언팔로우 실패');
    //         } else {
    //             const res = await followMember(authorId);
    //             const ok = res?.resultCode?.startsWith?.('S-') || res?.success === true || (res?.msg || '').includes('이미 팔로우');
    //             if (!ok) throw new Error(res?.msg || '팔로우 실패');
    //         }
    //         await refreshFollowFromServer(authorId);
    //     } catch (e) {
    //         console.error('❌ 팔/언 실패:', e);
    //         // 필요하면 alert(e.message);
    //     } finally {
    //         setFollowBusy(false);
    //     }
    // };

    // const isOwn = !!article?.extra__writer
    //     && ( (typeof window !== 'undefined' && localStorage.getItem('nickName')) || '' )
    //         .trim().toLowerCase()
    //     === article.extra__writer.trim().toLowerCase();

    const handleInput = (e) => {
        const textarea = textareaRef.current;
        textarea.style.height = "auto"; // 입력 전 높이 초기화
        textarea.style.height = textarea.scrollHeight + "px";
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

                        <div className="flex items-center">
                            {/* 공유 버튼 */}
                            <button
                                type="button"
                                className="p-2 hover:text-gray-900 flex items-center"
                                onClick={async () => {
                                    try {
                                        const url = `${window.location.origin}/DiFF/article/detail?id=${article.id}`;
                                        await navigator.clipboard.writeText(url);
                                        alert("링크가 복사되었습니다.");
                                    } catch {
                                        const url = `${window.location.origin}/DiFF/article/detail?id=${article.id}`;
                                        const input = document.createElement("input");
                                        input.value = url;
                                        document.body.appendChild(input);
                                        input.select();
                                        document.execCommand("copy");
                                        document.body.removeChild(input);
                                        alert("링크가 복사되었습니다.");
                                    }
                                }}
                            >
                                <i className="fa-solid fa-share-nodes"></i>
                            </button>

                            {/* 더보기 메뉴 (작성자 글일 때만 보임) */}
                            {isMyPost && (
                                <div className="relative">
                                    <button
                                        ref={menuBtnRef}
                                        type="button"
                                        aria-haspopup="menu"
                                        aria-expanded={menuOpen}
                                        onClick={() => setMenuOpen(v => !v)}
                                        onKeyDown={(e) => {
                                            if (e.key === "ArrowDown" && !menuOpen) {
                                                e.preventDefault();
                                                setMenuOpen(true);
                                            }
                                        }}
                                        className="py-2 hover:text-gray-900"
                                    >
                                        <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
                                    </button>

                                    {menuOpen && (
                                        <div
                                            ref={menuRef}
                                            role="menu"
                                            className="absolute right-0 mt-2 z-10 w-44 border origin-top-right rounded-lg bg-white shadow-sm
                       divide-y divide-gray-100 font-normal dark:bg-gray-700 dark:divide-gray-600"
                                        >
                                            <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                                                {article.userCanModify && (
                                                    <li>
                                                        <Link
                                                            href={`/DiFF/article/modify?id=${article.id}`}
                                                            role="menuitem"
                                                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                                            onClick={() => setMenuOpen(false)}
                                                        >
                                                            <i className="fa-solid fa-pen"></i> Edit
                                                        </Link>
                                                    </li>
                                                )}
                                                {article.userCanDelete && (
                                                    <li>
                                                        <button
                                                            type="button"
                                                            role="menuitem"
                                                            onClick={() => handleDelete(article.id)}
                                                            className="w-full text-left block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white text-red-500"
                                                        >
                                                            <i className="fa-solid fa-trash-can"></i> Delete
                                                        </button>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* article info */}
                    <div className="text-gray-600 my-4 px-2 flex justify-between items-end">
                        <div className="flex items-center gap-2">
                            {/* 닉네임 */}
                            <div
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = `/DiFF/member/profile?nickName=${encodeURIComponent(article.extra__writer)}`;
                                }}
                                className="mx-2 hover:underline hover:text-black cursor-pointer text-md font-semibold"
                            >
                                {article.extra__writer}
                            </div>

                            {/* 팔로우/언팔로우 버튼 (상대방 프로필일 때만 보이도록) */}
                            {!isMyPost && member?.id && (
                                <div className="flex">
                                    <button
                                        onMouseEnter={() => setHoverUnfollow(true)}
                                        onMouseLeave={() => setHoverUnfollow(false)}
                                        onClick={async () => {
                                            try {
                                                if (member.isFollowing) {
                                                    await unfollowMember(member.id);
                                                    setMember(prev => ({...prev, isFollowing: false}));
                                                    typeof setFollowerCount === 'function' &&
                                                    setFollowerCount(prev => Math.max(0, prev - 1));
                                                } else {
                                                    await followMember(member.id);
                                                    setMember(prev => ({...prev, isFollowing: true}));
                                                    typeof setFollowerCount === 'function' &&
                                                    setFollowerCount(prev => prev + 1);
                                                }
                                            } catch (err) {
                                                console.error("❌ 팔로우/언팔로우 실패:", err);
                                                alert("처리 실패");
                                            }
                                        }}
                                        className={`py-1 text-sm rounded-full border transition w-20 
                                          ${
                                            member.isFollowing
                                                ? hoverUnfollow
                                                    ? "text-red-500 border hover:border-red-500"
                                                    : "border text-gray-500 bg-gray-100"
                                                : "hover:bg-gray-100 border-gray-700"
                                        }`}
                                        aria-label={
                                            member.isFollowing
                                                ? (hoverUnfollow ? "Unfollow" : "Following")
                                                : "Follow"
                                        }
                                    >
                                        {member.isFollowing ? (hoverUnfollow ? "Unfollow" : "Following") : "Follow"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 오른쪽 날짜 영역 기존 그대로 */}
                        <div className="text-gray-500">
                            {new Date(article.regDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                            })}
                        </div>
                    </div>


                    {/* 본문 */}
                    <div
                        className="prose max-w-none whitespace-pre-wrap leading-relaxed text-lg text-gray-800 border-t border-b py-6">
                        <ToastViewer content={article.body} showImages={true}/>
                    </div>

                    {/* 댓글 입력 */}
                    <div className="mt-10">
                        <form onSubmit={handleSubmitreply} className="relative">
                            <label htmlFor="comment" className="sr-only">댓글 작성</label>

                            <div
                                className="relative rounded-2xl border border-black/10 dark:border-white/15
                                 bg-white/80 dark:bg-black/40 backdrop-blur-sm
                                 shadow-sm transition-all
                                 focus-within:border-black/20 dark:focus-within:border-white/30"
                            >
                                {/* textarea */}
                                <textarea
                                    id="comment"
                                    ref={textareaRef}
                                    value={reply}
                                    onInput={handleInput}
                                    onChange={(e) => setReply(e.target.value)}
                                    onKeyDown={(e) => {
                                        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                                            e.preventDefault();
                                            if (reply.trim()) handleSubmitreply(e);
                                        }
                                    }}
                                    maxLength={1000}
                                    placeholder="What are your thoughts?"
                                    className="block w-full resize-none bg-transparent
                                       p-4 pr-40 text-sm min-h-[48px] max-h-[192px] overflow-y-auto
                                       text-gray-900 dark:text-gray-100
                                       placeholder-gray-400 dark:placeholder-gray-500
                                       focus:outline-none"
                                />

                                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {reply.trim().length}/1000
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={!reply.trim()}
                                        className="px-4 py-2 rounded-full
                                         bg-black text-white dark:bg-white dark:text-black
                                         text-xs font-medium
                                         shadow-sm hover:shadow-md
                                         transition-all
                                         disabled:opacity-40 disabled:cursor-not-allowed
                                         active:scale-[0.98]"
                                    >
                                        Comment
                                    </button>
                                </div>
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
                                <div key={r.id} className="relative mb-2 border-b pb-4">
                                    <div className="flex gap-3">
                                        {/* Avatar */}
                                        <Link
                                            href={`/DiFF/member/profile?nickName=${encodeURIComponent(r.extra__writer)}`}
                                            className="mr-1"
                                        >
                                            {r.profileUrl ? (
                                                <img
                                                    src={r.profileUrl}
                                                    alt={`${r.extra__writer} profile`}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div
                                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold">
                                                    <i className="fa-solid fa-skull"></i>
                                                </div>
                                            )}
                                        </Link>

                                        {/* Right side */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    {/* Header: nickname + date (고정) */}
                                                    <div className="leading-6 break-words mt-1">
                                                        <Link
                                                            href={`/DiFF/member/profile?nickName=${encodeURIComponent(r.extra__writer)}`}
                                                            className="font-semibold text-lg hover:underline"
                                                        >
                                                            {r.extra__writer}
                                                        </Link>
                                                        &nbsp;ㆍ&nbsp;
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(r.regDate).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric",
                                                            })}
                                                        </span>
                                                    </div>

                                                    {r.isEditing ? (
                                                        <div className="m-1 mt-3">
                                                            <textarea
                                                                className="w-full bg-transparent resize-none min-h-[30px] max-h-[240px] overflow-y-auto
                                                                          rounded-md border border-black/10 dark:border-white/15 p-2 text-sm
                                                                          focus:outline-none focus:ring-1 focus:ring-black/10 dark:focus:ring-white/20"
                                                                value={r.editBody ?? r.body ?? ""}
                                                                onInput={(e) => {
                                                                    e.target.style.height = "auto";
                                                                    e.target.style.height = Math.min(e.target.scrollHeight, 240) + "px";
                                                                }}
                                                                onChange={(e) =>
                                                                    setReplies((prev) =>
                                                                        prev.map((item) =>
                                                                            item.id === r.id ? {
                                                                            ...item,
                                                                                editBody: e.target.value
                                                                        } : item
                                                                          )
                                                                      )
                                                                  }
                                                              />
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <button
                                                                    onClick={async () => {
                                                                        const nextBody = r.editBody ?? "";
                                                                        const res = await modifyReply(r.id, nextBody);
                                                                        if (res.resultCode?.startsWith?.("S-")) {
                                                                            setReplies((prev) =>
                                                                                prev.map((item) =>
                                                                                    item.id === r.id
                                                                                        ? {
                                                                                            ...item,
                                                                                            body: nextBody,
                                                                                            isEditing: false,
                                                                                            editBody: undefined
                                                                                        }
                                                                                        : item
                                                                                )
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs
                                                                             shadow-sm hover:shadow-md transition"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        setReplies((prev) =>
                                                                            prev.map((item) =>
                                                                                item.id === r.id
                                                                                    ? {
                                                                                        ...item,
                                                                                        isEditing: false,
                                                                                        editBody: undefined
                                                                                    }
                                                                                    : item
                                                                            )
                                                                        )
                                                                    }
                                                                    className="px-3 py-1.5 rounded-full border border-black/15 dark:border-white/20 text-xs
                             hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="m-1 mt-3 flex items-center gap-3 text-gray-500">
              <span className="whitespace-pre-wrap align-baseline text-gray-800 dark:text-gray-100">
                {r.body}
              </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right controls: like + menu (고정) */}
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={() => handleReplyLikeToggle(r.id, r.liked)}
                                                        aria-label="이 댓글 좋아요"
                                                        aria-pressed={r.liked}
                                                        className="p-1 flex items-center gap-1"
                                                        title="like"
                                                    >
                                                        <i
                                                            className={`${
                                                                r.liked ? "fa-solid text-red-500" : "fa-regular text-gray-500"
                                                            } fa-heart text-base`}
                                                        />
                                                        {r.likeCount !== 0 &&
                                                            <span className="text-sm">{r.likeCount}</span>}
                                                    </button>

                                                    {(r.userCanModify || r.userCanDelete) && (
                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                ref={r.id === replyMenuOpen ? menuBtnRef : null}
                                                                aria-haspopup="menu"
                                                                aria-expanded={replyMenuOpen === r.id}
                                                                onClick={() =>
                                                                    setReplyMenuOpen(replyMenuOpen === r.id ? null : r.id)
                                                                }
                                                                className="text-gray-600 dark:text-gray-300"
                                                                title="More"
                                                            >
                                                                <i className="fa-solid fa-ellipsis-vertical text-sm"></i>
                                                            </button>

                                                            {replyMenuOpen === r.id && (
                                                                <div
                                                                    ref={menuRef}
                                                                    role="menu"
                                                                    className="absolute right-0 mt-2 z-20 min-w-36 overflow-hidden rounded-xl
                             border border-black/10 dark:border-white/15 py-1
                             bg-white dark:bg-gray-800 shadow-lg"
                                                                >
                                                                    {r.userCanModify && (
                                                                        <button
                                                                            role="menuitem"
                                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                            onClick={() => {
                                                                                setReplyMenuOpen(null);
                                                                                setReplies((prev) =>
                                                                                    prev.map((item) =>
                                                                                        item.id === r.id
                                                                                            ? {
                                                                                                ...item,
                                                                                                isEditing: true,
                                                                                                editBody: item.body
                                                                                            }
                                                                                            : item
                                                                                    )
                                                                                );
                                                                            }}
                                                                        >
                                                                            <i className="fa-solid fa-pen"></i> Edit
                                                                        </button>
                                                                    )}
                                                                    {r.userCanDelete && (
                                                                        <button
                                                                            role="menuitem"
                                                                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400
                                 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                            onClick={async () => {
                                                                                setReplyMenuOpen(null);
                                                                                if (confirm("Are you sure you want to delete this comment?")) {
                                                                                    const res = await deleteReply(r.id);
                                                                                    if (res.resultCode?.startsWith?.("S-")) {
                                                                                        setReplies((prev) => prev.filter((item) => item.id !== r.id));
                                                                                        alert("Comment deleted.");
                                                                                    }
                                                                                }
                                                                            }}
                                                                        >
                                                                            <i className="fa-solid fa-trash-can"></i> Delete
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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