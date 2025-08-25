// member/profile/page.js
'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ThemeToggle from "@/common/thema";
import TechBadges from "@/common/techBadges/techBadges";
import { getMyTechKeys, getTechKeysByNickName } from "@/lib/TechAPI";

import {
    fetchUser,
    uploadProfileImg,
    followMember,
    unfollowMember,
    getFollowingList,
    getFollowerList,
} from '@/lib/UserAPI';

export default function ProfileTab() {
    return (
        <Suspense fallback={<div className="p-8 text-sm">로딩...</div>}>
            <ProfileInner />
        </Suspense>
    );
}

function ProfileInner() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');
    const [member, setMember] = useState(null);
    const [isMyProfile, setIsMyProfile] = useState(false);
    const [profileUrl, setProfileUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [techKeys, setTechKeys] = useState([]);

    const [followingCount, setFollowingCount] = useState(0);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingList, setFollowingList] = useState([]);
    const [followerList, setFollowerList] = useState([]);
    const [openModal, setOpenModal] = useState(null); // 'following' | 'follower' | null
    const [linked, setLinked] = useState({ google: false, github: false });

    // 백엔드 미구현 부분은 "없음"으로 고정 표시
    const [introduce] = useState('없음');
    const [stat] = useState({ totalLikes: '없음', repoCount: '없음', postCount: '없음' });

    useEffect(() => {
        const accessToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');
        if (!accessToken) return;

        const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        fetch(`${base}/api/DiFF/auth/linked`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            credentials: 'include',
        })
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => {
                // data = { google: bool, github: bool }
                setLinked({
                    google: !!data.google,
                    github: !!data.github,
                });
            })
            .catch(() => {
                // 필요 시 무시 또는 알림
            });
    }, []);


    useEffect(() => {
        const justLinked = searchParams.get('linked'); // google | github
        if (justLinked === 'google' || justLinked === 'github') {
            setLinked(prev => ({ ...prev, [justLinked]: true }));
            // 필요하면 쿼리스트링 정리
            // router.replace('/DiFF/home/main');
        }
    }, [searchParams]);

    useEffect(() => {
        const accessToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');
        const myNickName = typeof window !== 'undefined' && localStorage.getItem('nickName');

        if (!accessToken) {
            router.replace('/DiFF/member/login');
            return;
        }

        const nickName = searchParams.get("nickName");

        fetchUser(nickName)
            .then(async (res) => {
                const fetchedMember = res.member;
                setMember(fetchedMember);
                setProfileUrl(fetchedMember?.profileUrl || "");
                setLoading(false);

                if (!nickName || nickName === myNickName) {
                    setIsMyProfile(true);
                } else {
                    setIsMyProfile(false);

                    // ✅ 팔로잉 여부 체크
                    try {
                        const followRes = await getFollowingList(); // 로그인 사용자의 팔로잉 리스트
                        console.log("팔로잉 API 원본 응답:", followRes);

                        const list = followRes.data1 || followRes.data?.followingList || [];
                        console.log("팔로잉 리스트 추출:", list);
                        console.log("현재 프로필 fetchedMember.id:", fetchedMember.id);

                        // 개별 비교 디버깅
                        list.forEach(m => {
                            console.log(`👉 비교 대상 id=${m.id}, nickName=${m.nickName}  ===  targetId=${fetchedMember.id}`);
                        });

                        const following = list.some(m => m.id === fetchedMember.id);
                        console.log("📌 최종 팔로우 여부:", following);

                        setMember(prev => ({ ...prev, isFollowing: following }));
                    } catch (err) {
                        console.error("❌ 팔로잉 목록 조회 실패:", err);
                    }
                }
            })
            .catch(err => {
                console.error("마이페이지 오류:", err);
                setLoading(false);
                router.replace('/DiFF/home/main');
            });
    }, [router, searchParams]);


    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const followingRes = await getFollowingList();
                const followerRes = await getFollowerList();

                // 응답 구조에 따라 맞게 꺼내야 함 (data1Name, data1 구조 확인했었지?)
                const followingList = followingRes.data1 || [];
                const followerList = followerRes.data1 || [];

                setFollowingCount(followingList.length);
                setFollowerCount(followerList.length);

                console.log("📌 Following Count:", followingList.length);
                console.log("📌 Follower Count:", followerList.length);
            } catch (err) {
                console.error("❌ 팔로워/팔로잉 카운트 조회 실패:", err);
            }
        };

        fetchCounts();
    }, []);

    useEffect(() => {
        if (!member) return;
        const nickName = searchParams.get("nickName");
        const myNickName = typeof window !== 'undefined' && localStorage.getItem('nickName');
        const isMine = !nickName || nickName === myNickName;

        (async () => {
            try {
                const keys = isMine ? await getMyTechKeys() : await getTechKeysByNickName(member.nickName);
                setTechKeys(Array.isArray(keys) ? keys : []);
            } catch (e) {
                console.error(e);
                setTechKeys([]);
            }
        })();
    }, [member, searchParams]);

    useEffect(() => {
        if (openModal === "follower") {
            getFollowerList()
                .then((res) => {
                    console.log("팔로워 API 응답:", res);
                    setFollowerList(res.data1 || res); // 응답 구조에 따라 조정
                })
                .catch((err) => console.error("팔로워 목록 로딩 오류:", err));
        }

        if (openModal === "following") {
            getFollowingList()
                .then((res) => {
                    console.log("팔로잉 API 응답:", res);
                    setFollowingList(res.data1 || res);
                })
                .catch((err) => console.error("팔로잉 목록 로딩 오류:", err));
        }
    }, [openModal]);

    const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

    const handleUpload = async () => {
        if (!selectedFile) return alert("파일을 선택하세요!");
        try {
            const url = await uploadProfileImg(selectedFile);
            setProfileUrl(url);
            console.log("업로드 성공:", url);
        } catch {
            alert("업로드 실패");
        }
    };


    // 소셜 로그인 통합, 연동
    const startLink = (provider) => {
        if (provider !== 'google' && provider !== 'github') return;

        const url = `/api/DiFF/auth/link/${provider}?mode=link`;
        window.location.href = url;
    };

    if (loading) return <div>로딩...</div>;
    if (!member) return null;


    return (
        <section className="px-4 dark:bg-gray-900 dark:text-white">
            <div className="mx-auto max-w-6xl">
                {err && <div className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-700">{err}</div>}

                {/* Tabs */}
                <div className="mb-3 flex items-center gap-6 text-2xl font-semibold">
                    <span className="text-black">Profile</span>
                    {isMyProfile && (
                    <Link href="/DiFF/member/settings" className="text-gray-400 hover:text-gray-700">Settings</Link>
                    )}
                </div>
                <div className="h-px w-full bg-gray-300 mb-8" />

                {/* 2-Column Layout (좌: 프로필/스탯, 우: 소개/툴) */}
                <div className="grid grid-cols-1 gap-10 md:grid-cols-[280px,1fr]">
                    {/* Left */}
                    <aside>
                        <div className="flex flex-col items-start">
                            {/* 아바타만 가운데 정렬 */}
                            <div className="relative h-28 w-28 overflow-hidden rounded-full border border-gray-300 bg-gray-100 self-center">
                                {profileUrl ? (
                                    <img src={profileUrl} alt="avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-4xl">🟡</div>
                                )}

                            </div>

                            {/* 이름/이메일(왼쪽 정렬 유지) */}
                            <div className="mt-4 text-center self-center">
                                <div className="text-xl font-semibold">{member.nickName}</div>
                                <a href={`mailto:${member.email}`} className="mt-1 block text-sm font-semibold text-gray-700">
                                    {member.email}
                                </a>
                            </div>

                            {/* 팔로잉/팔로워 */}
                            <div className="mt-4 flex items-center gap-4 text-sm self-center">
                                <button onClick={() => setOpenModal('following')} className="flex items-center gap-2 hover:underline">
                                    <span className="opacity-70">following :</span> {followingCount}
                                </button>
                                <button onClick={() => setOpenModal('follower')} className="flex items-center gap-2 hover:underline">
                                    <span className="opacity-70">follower :</span> {followerCount}
                                </button>
                            </div>

                            {/* 타인 프로필: 팔로우/언팔로우 */}
                            {/* 본인 프로필만 출력 */}
                            {isMyProfile && (
                                // 아바타 바로 아래에 세로(column)로, 가운데 정렬
                                <div className="mt-3 flex w-full flex-col items-center gap-2">

                                    {/* 숨겨진 파일 input */}
                                    <input
                                        id="profileUpload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            try {
                                                const url = await uploadProfileImg(file);
                                                setProfileUrl(url);
                                                console.log('업로드 성공:', url);
                                            } catch (err) {
                                                console.error('업로드 실패:', err);
                                                alert('업로드 실패');
                                            }
                                        }}
                                    />

                                    {/* 업로드 버튼 */}
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('profileUpload')?.click()}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-400"
                                    >
                                        프로필 업로드
                                    </button>

                                    {/* 테마 토글 (버튼 아래, 중앙) */}

                                        <ThemeToggle />


                                    {/* 소셜 연동 버튼 (같은 줄, 중앙) */}
                                    <div className="mt-1 flex items-center justify-center gap-3">
                                        {/* 구글 */}
                                        <button
                                            type="button"
                                            onClick={() => !linked.google && startLink('google')}
                                            id="connect-google"
                                            disabled={linked.google}
                                            aria-disabled={linked.google}
                                            className={
                                                `px-4 py-2 rounded text-white ` +
                                                (linked.google
                                                    ? 'bg-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-red-500 hover:bg-red-400')
                                            }
                                            title={linked.google ? '이미 연동됨' : '구글 계정 연동'}
                                        >
                                            {linked.google ? '구글 연동 완료' : '구글 연동'}
                                        </button>

                                        {/* 깃허브 */}
                                        <button
                                            type="button"
                                            onClick={() => !linked.github && startLink('github')}
                                            id="connect-github"
                                            disabled={linked.github}
                                            aria-disabled={linked.github}
                                            className={
                                                `px-4 py-2 rounded text-white ` +
                                                (linked.github
                                                    ? 'bg-gray-400 cursor-not-allowed opacity-60'
                                                    : 'bg-gray-800 hover:bg-gray-700')
                                            }
                                            title={linked.github ? '이미 연동됨' : '깃허브 계정 연동'}
                                        >
                                            {linked.github ? '깃 연동 완료' : '깃허브 연동'}
                                        </button>
                                    </div>
                                </div>
                            )}


                            {/* 구분선 */}
                            <div className="my-4 h-px w-40 bg-gray-300 self-center" />

                            {/* Stats */}
                            <div className="w-fit self-center text-left">
                                <h4 className="text-2xl font-semibold mb-3">Stats</h4>
                                <ul className="text-sm leading-7">
                                    <li> Total Like : <span className="font-medium">{stat.totalLikes}</span></li>
                                    <li> Total Repository : <span className="font-medium">{stat.repoCount}</span></li>
                                    <li> Posts : <span className="font-medium">{stat.postCount}</span></li>
                                </ul>
                            </div>
                        </div>
                    </aside>

                    {/* Right */}
                    <main>
                        <section className="mb-8">
                            <h3 className="mb-3 text-2xl font-bold">introduce</h3>
                            <div className="min-h-[120px] rounded-md border border-gray-300 bg-gray-100 p-6 text-gray-600">
                                {introduce}
                            </div>
                        </section>

                        <section>
                            <h3 className="mb-3 text-2xl font-bold">Technologies &amp; Tools</h3>
                            <TechBadges keys={techKeys} />
                        </section>
                    </main>
                </div>

                {/* 목록 모달 */}
                {openModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                        onClick={() => setOpenModal(null)}
                    >
                        <div className="w-96 rounded-lg bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
                            <h2 className="mb-4 text-lg font-bold">
                                {openModal === 'follower' ? '팔로워' : '팔로잉'} 목록
                            </h2>
                            <ul className="max-h-60 space-y-2 overflow-y-auto">
                                {(openModal === 'follower' ? followerList : followingList)?.length ? (
                                    (openModal === 'follower' ? followerList : followingList).map((u, idx) => (
                                        <li key={idx} className="flex items-center gap-3">
                                            <Link
                                                href={`/DiFF/member/profile?nickName=${encodeURIComponent(u.nickName)}`}
                                                className="flex items-center gap-3 hover:underline"
                                            >
                                                <img
                                                    src={u.profileImg || u.profileUrl || ''}
                                                    alt={u.nickName}
                                                    className="h-8 w-8 rounded-full border object-cover"
                                                />
                                                <span>{u.nickName}</span>
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">조회된 사용자가 없어.</p>
                                )}
                            </ul>
                            <button onClick={() => setOpenModal(null)} className="mt-4 rounded bg-gray-200 px-4 py-2 text-sm">
                                닫기
                            </button>
                        </div>
                    </div>
                )}

                {/* 하단 네비 */}
                <div className="pt-8 text-center">
                    <button
                        onClick={() => router.replace('/DiFF/home/main')}
                        className="rounded bg-neutral-900 px-6 py-2 text-sm text-white hover:bg-neutral-800"
                    >
                        뒤로가기
                    </button>
                </div>
            </div>
        </section>
    );
}
