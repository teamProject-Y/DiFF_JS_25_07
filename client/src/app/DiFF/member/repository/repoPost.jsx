// src/common/RepoPost.jsx
'use client';

import {useEffect, useState} from 'react';
import {fetchArticles} from '@/lib/ArticleAPI';

/** 폴더 라벨 SVG: 제목/날짜 텍스트만 그리는 헤더 */
function FolderLabelSVG({title, dateText, commitShort}) {
    return (<svg viewBox="0 0 960 160" className="w-full h-[150px] select-none" shapeRendering="crispEdges">
            <path
                d="M24 40 H330 L360 56 H940 V150 H24 V40"
                fill="none"
                stroke="#111"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
                strokeLinecap="round"
            />

        {/* 2) 회색바 '아래' 한 줄 + 오른쪽 삐쭉(위로 튀는 노치) */}
        <rect
            x="36" y="62" width="904" height="22"            /* ← 필요하면 숫자만 미세 조정 */
            fill="#e5e7eb"
            stroke="#111" strokeWidth="1"
        />

        <path
            d="M24 84 H900 L915 72 H940"  // 84 = 62 + 22
            fill="none"
            stroke="#111" strokeWidth={1}
            vectorEffect="non-scaling-stroke"
        />

            {/* 4) 텍스트들 */}
            {/* 제목: 좌상단 */}
            <text x="36" y="54" fontSize="26" fontWeight="700" fill="#111">
                {title}
            </text>

        <text
            x="932" y="72"                                   /* ← 위 path의 915 72와 같은 높이 */
            fontSize="14" fontWeight="700" fill="#111"
            textAnchor="end" dominantBaseline="middle"
        >
            {commitShort}
        </text>

            {/* 날짜: 날짜바 안쪽 좌측 */}
        <text x="52" y="73" fontSize="16" fill="#111" dominantBaseline="middle">
            {dateText}
        </text>

        </svg>);
}

/** 게시물 카드 */
function PostCard({post}) {
    const {title, dateText, likes, comments, commitShort} = post;
    return (<div className="rounded-2xl bg-base-100 shadow-sm ring-1 ring-base-200 overflow-hidden">
        <FolderLabelSVG title={title} rightText={dateText} commitShort={commitShort}/>
        <div className="px-6 pb-5 -mt-2">
            <div className="mb-1 flex items-center gap-6 text-sm text-base-content/70">
                <span title="likes">❤️ {likes}</span>
                <span title="comments">💬 {comments}</span>
            </div>
            <div className="text-xs text-base-content/50">평가 지표 영역 (추후 바인딩)</div>
        </div>
    </div>);
}

/** ✨ 외부 탭만 사용: 내부 탭 없음, “게시물 목록”만 렌더 */
export default function RepoPost({repoId}) {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');

    // API 응답 → 화면 모델로 매핑 (응답 형태가 달라도 견고하게)
    const mapArticles = (payload) => {
        // payload는 fetchArticles 가 반환한 res.data 전체
        const root = payload ?? {};
        // ResultData 형태: { data: { articles: [...] } } 또는 평문 { articles: [...] }
        const articles = root?.data?.articles ?? root?.articles ?? root?.data ?? [];

        if (!Array.isArray(articles)) return [];

        return articles.map((a) => {
            const created = a?.createdAt || a?.created_at || a?.createdDate || a?.created_date || a?.regDate || '';

            // YYYY-MM-DD로 안정적으로 잘라 표기
            const dateText = typeof created === 'string' ? (created.includes('T') ? created.split('T')[0] : created).slice(0, 10) : 'Unknown';
            const fullHash = a?.checksum || a?.commitHash || a?.commit_id || a?.commitId || a?.latestCommit || '';
            const commitShort = typeof fullHash === 'string' && fullHash.length >= 6 ? fullHash.slice(0, 6) : '';

            return {
                id: a?.id ?? a?.articleId ?? a?.article_id ?? crypto.randomUUID(),
                title: a?.title ?? '(제목 없음)',
                dateText,
                likes: a?.likeCount ?? a?.likes ?? 0,
                comments: a?.commentCount ?? a?.comments ?? 0,
                commitShort,
            };
        });
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setError('');
            try {
                // ⚠️ 백엔드가 요구하는 파라미터명은 repositoryId (repoId 아님)
                const resp = await fetchArticles({
                    repositoryId: repoId, searchItem: 0, keyword: '', page: 1,
                });

                const mapped = mapArticles(resp);
                if (mounted) setPosts(mapped);
            } catch (e) {
                if (mounted) {
                    // 데모 데이터로 폴백
                    setPosts([{
                        id: 'demo-1', title: 'Title', dateText: '2020-10-10', likes: 11, comments: 123
                    }, {id: 'demo-2', title: 'title', dateText: '2000-09-10', likes: 11, comments: 123},]);
                    setError(e?.message || '요청 실패');
                    console.error('[RepoPost] fetchArticles error:', e);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [repoId]);

    return (<div className="absolute inset-0 overflow-y-auto p-6">
        {loading && <div className="py-10 text-center text-base-content/60">로딩 중…</div>}
        {!loading && error && (
            <div className="mb-4 rounded-lg border border-error/30 bg-error/5 p-3 text-sm text-error">
                {error}
            </div>)}
        {!loading && !posts.length && (<div className="py-10 text-center text-base-content/60">게시물이 없어.</div>)}
        {!loading && posts.length > 0 && (<div className="grid gap-6 md:grid-cols-2">
            {posts.map((p) => (<PostCard key={p.id} post={p}/>))}
        </div>)}
    </div>);
}
