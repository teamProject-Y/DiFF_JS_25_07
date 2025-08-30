// member/profile/page.js
'use client';
import ReactMarkdown from "react-markdown";
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
    const [linked, setLinked] = useState({google: false, github: false});

    const [introduce] = useState('없음');
    const [stat] = useState({totalLikes: '없음', repoCount: '없음', postCount: '없음'});

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

                    // 로그인한 사용자의 팔로잉 목록 조회 (내 기준)
                    const followRes = await getFollowingList(myNickName);
                    console.log("팔로잉 API 응답:", followRes);

                    const list = followRes.followingList || followRes.data1 || [];
                    console.log("팔로잉 리스트:", list);

                    // 상대방이 내 팔로잉 목록에 있는지 확인
                    const following = list.some(m => m.id === fetchedMember.id);

                    console.log(`👉 로그인 사용자(${myNickName}) → target(${fetchedMember.nickName}) 팔로잉 여부 =`, following);

                    setMember(prev => ({ ...prev, isFollowing: following }));
                }
            })
            .catch(err => {
                console.error("마이페이지 오류:", err);
                setLoading(false);
                router.replace('/DiFF/home/main');
            });
    }, [router, searchParams]);


    useEffect(() => {
        const nickName = searchParams.get("nickName");

        const fetchCounts = async () => {
            try {
                const followingRes = await getFollowingList(nickName);
                const followerRes = await getFollowerList(nickName);

                // 응답 구조에 맞게 꺼내기
                const followingList = followingRes.followingList || followingRes.data1 || [];
                const followerList = followerRes.followerList || followerRes.data1 || [];

                setFollowingCount(followingList.length);
                setFollowerCount(followerList.length);

                console.log("📌 Following Count:", followingList.length);
                console.log("📌 Follower Count:", followerList.length);
            } catch (err) {
                console.error("❌ 팔로워/팔로잉 카운트 조회 실패:", err);
            }
        };

        fetchCounts();
    }, [searchParams]);


    useEffect(() => {
        const nickName = searchParams.get("nickName");

        if (openModal === "follower") {
            getFollowerList(nickName)
                .then((res) => {
                    console.log("팔로워 API 응답:", res);
                    // 올바른 키로 파싱
                    setFollowerList(res.followerList || res.data1 || []);
                })
                .catch((err) => console.error("팔로워 목록 로딩 오류:", err));
        }

        if (openModal === "following") {
            getFollowingList(nickName)
                .then((res) => {
                    console.log("팔로잉 API 응답:", res);
                    // 올바른 키로 파싱
                    setFollowingList(res.followingList || res.data1 || []);
                })
                .catch((err) => console.error("팔로잉 목록 로딩 오류:", err));
        }
    }, [openModal, searchParams]);


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

                {err && (
                    <div className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-700">{err}</div>
                )}

                {/* Tabs */}
                <div className="mb-3 flex items-center gap-6 text-2xl font-semibold">
                    <span className="text-black">Profile</span>
                    {isMyProfile && (
                        <Link
                            href="/DiFF/member/settings"
                            className="text-gray-400 hover:text-gray-700"
                        >
                            Settings
                        </Link>
                    )}
                </div>
                <div className="h-px w-full bg-gray-300 mb-8"/>

                {/* 2-Column Layout (좌: 프로필/스탯, 우: 소개/툴) */}
                <div className="grid grid-cols-1 gap-10 md:grid-cols-[280px,1fr]">

                    {/* Left */}
                    <aside>
                        <div className="flex flex-col items-start">
                            {/* 아바타 */}
                            <div
                                className="relative h-28 w-28 overflow-hidden rounded-full border border-gray-300 bg-gray-100 self-center">
                                {profileUrl ? (
                                    <img src={profileUrl} alt="avatar" className="h-full w-full object-cover"/>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-4xl">🟡</div>
                                )}
                            </div>

                            {/* 이름/이메일 */}
                            <div className="mt-4 text-center self-center">
                                <div className="text-xl font-semibold">{member.nickName}</div>
                                <a
                                    href={`mailto:${member.email}`}
                                    className="mt-1 block text-sm font-semibold text-gray-700"
                                >
                                    {member.email}
                                </a>
                            </div>

                            {/* 팔로잉/팔로워 */}
                            <div className="mt-4 flex items-center gap-4 text-sm self-center">
                                <button
                                    onClick={() => setOpenModal('following')}
                                    className="flex items-center gap-2 hover:underline"
                                >
                                    <span className="opacity-70">following :</span> {followingCount}
                                </button>
                                <button
                                    onClick={() => setOpenModal('follower')}
                                    className="flex items-center gap-2 hover:underline"
                                >
                                    <span className="opacity-70">follower :</span> {followerCount}
                                </button>
                            </div>

                            {/* 팔로우/언팔로우 버튼 (상대방 프로필일 때만 보이도록) */}
                            {!isMyProfile && (
                                <div className="mt-4 flex justify-center">
                                    <button
                                        onClick={async () => {
                                            try {
                                                if (member.isFollowing) {
                                                    console.log("👉 언팔로우 요청:", member.id);
                                                    await unfollowMember(member.id);

                                                    setMember(prev => ({ ...prev, isFollowing: false }));
                                                    // 상대방 프로필이므로 followerCount 조정
                                                    setFollowerCount(prev => Math.max(0, prev - 1));
                                                } else {
                                                    console.log("👉 팔로우 요청:", member.id);
                                                    await followMember(member.id);

                                                    setMember(prev => ({ ...prev, isFollowing: true }));
                                                    // 상대방 프로필이므로 followerCount 조정
                                                    setFollowerCount(prev => prev + 1);
                                                }
                                            } catch (err) {
                                                console.error("❌ 팔로우/언팔로우 실패:", err);
                                                alert("처리 실패");
                                            }
                                        }}
                                        className={`px-6 py-2 text-sm rounded text-white ${
                                            member.isFollowing
                                                ? "bg-red-600 hover:bg-red-500"
                                                : "bg-green-600 hover:bg-green-500"
                                        }`}
                                    >
                                        {member.isFollowing ? "언팔로우" : "팔로우"}
                                    </button>
                                </div>
                            )}


                            {/* 본인 프로필일 때만 표시 */}
                            {isMyProfile && (
                                <div className="mt-3 flex w-full flex-col items-center gap-2">
                                    {/* 구분선 */}
                                    <div className="my-4 h-px w-40 bg-gray-300 self-center"/>

                                    {/* Stats */}
                                    <div className="w-fit self-center text-left">
                                        <h4 className="text-2xl font-semibold mb-3">Stats</h4>
                                        <ul className="text-sm leading-7">
                                            <li>
                                                Total Like : <span className="font-medium">{stat.totalLikes}</span>
                                            </li>
                                            <li>
                                                Total Repository : <span className="font-medium">{stat.repoCount}</span>
                                            </li>
                                            <li>
                                                Posts : <span className="font-medium">{stat.postCount}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Right */}
                    <main>
                        <section className="mb-8">
                            <h3 className="mb-3 text-2xl font-bold">README</h3>
                            <div className="min-h-[120px] prose dark:prose-invert max-w-none">
                                {member?.introduce ? (
                                    <ReactMarkdown>{member.introduce}</ReactMarkdown>
                                ) : (
                                    "아직 자기소개가 없습니다."
                                )}
                            </div>
                        </section>
                    </main>
                </div>

                {/* 목록 모달 */}
                {openModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                        onClick={() => setOpenModal(null)}
                    >
                        <div
                            className="w-96 rounded-lg bg-white p-6 shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="mb-4 text-lg font-bold">
                                {openModal === 'follower' ? '팔로워' : '팔로잉'} 목록
                            </h2>
                            <ul className="max-h-60 space-y-2 overflow-y-auto">
                                {(openModal === 'follower' ? followerList : followingList)?.length ? (
                                    (openModal === 'follower' ? followerList : followingList).map((u, idx) => {
                                        const imgSrc =
                                            (typeof u?.profileImg === 'string' && u.profileImg.trim()) ||
                                            (typeof u?.profileUrl === 'string' && u.profileUrl.trim()) ||
                                            null;

                                        return (
                                            <li key={u?.id ?? u?.nickName ?? idx} className="flex items-center gap-3">
                                                <Link
                                                    href={`/DiFF/member/profile?nickName=${encodeURIComponent(u?.nickName ?? '')}`}
                                                    className="flex items-center gap-3 hover:underline"
                                                >
                                                    {imgSrc ? (
                                                        <img
                                                            src={imgSrc}
                                                            alt={u?.nickName || 'user'}
                                                            className="h-8 w-8 rounded-full border object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full border flex items-center justify-center text-neutral-500">
                                                            <i className="fa-solid fa-skull" />
                                                        </div>
                                                    )}

                                                    <span>{u?.nickName}</span>
                                                </Link>
                                            </li>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-gray-500">조회된 사용자가 없어.</p>
                                )}
                            </ul>

                            <button
                                onClick={() => setOpenModal(null)}
                                className="mt-4 rounded bg-gray-200 px-4 py-2 text-sm"
                            >
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