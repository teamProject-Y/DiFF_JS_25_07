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

    const githubUrl =
        member?.githubUrl ||
        (member?.githubUsername ? `https://github.com/${member.githubUsername}` : '') ||
        (member?.github ? `https://github.com/${member.github}` : '');


    // 백엔드 미구현 부분은 "없음"으로 고정 표시
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

                    // ✅ 로그인한 사용자의 팔로잉 목록 조회 (내 기준)
                    const followRes = await getFollowingList(myNickName);
                    console.log("팔로잉 API 응답:", followRes);

                    const list = followRes.followingList || followRes.data1 || [];
                    console.log("팔로잉 리스트:", list);

                    // ✅ 상대방이 내 팔로잉 목록에 있는지 확인
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

                // ✅ 응답 구조에 맞게 꺼내기
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
                    // ✅ 올바른 키로 파싱
                    setFollowerList(res.followerList || res.data1 || []);
                })
                .catch((err) => console.error("팔로워 목록 로딩 오류:", err));
        }

        if (openModal === "following") {
            getFollowingList(nickName)
                .then((res) => {
                    console.log("팔로잉 API 응답:", res);
                    // ✅ 올바른 키로 파싱
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

                            {/* 이름/이메일 + 아이콘 */}
                            <div className="mt-4 self-center text-center">
                                <div className="text-xl font-semibold">{member.nickName}</div>

                                {/*{member.email && (*/}
                                {/*    <a*/}
                                {/*        href={`mailto:${member.email}`}*/}
                                {/*        className="mt-1 block text-sm font-semibold text-gray-700 hover:underline"*/}
                                {/*        title="이메일 보내기"*/}
                                {/*    >*/}
                                {/*        {member.email}*/}
                                {/*    </a>*/}
                                {/*)}*/}

                                {/* 아이콘들 (깃허브, 이메일) */}
                                <div className="UserProfile_icons__mCrr mt-3 flex items-center justify-center gap-3">
                                    {/* GitHub 아이콘 (새 창) */}
                                    {githubUrl && (
                                        <a
                                            href={githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            data-testid="github"
                                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                                            aria-label="GitHub 프로필"
                                            title="GitHub 프로필"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                                className="h-5 w-5"
                                            >
                                                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.4 7.86 10.94.58.1.79-.25.79-.56v-2.02c-3.2.7-3.87-1.54-3.87-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.73.08-.72.08-.72 1.18.08 1.8 1.22 1.8 1.22 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.72-1.56-2.55-.29-5.23-1.28-5.23-5.72 0-1.27.46-2.3 1.22-3.12-.12-.3-.53-1.48.12-3.09 0 0 .99-.32 3.24 1.19a11.3 11.3 0 0 1 5.9 0c2.25-1.51 3.24-1.19 3.24-1.19.65 1.61.24 2.79.12 3.09.76.82 1.22 1.85 1.22 3.12 0 4.45-2.69 5.42-5.25 5.7.41.35.77 1.05.77 2.12v3.14c0 .31.21.66.79.55A10.5 10.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
                                            </svg>
                                        </a>
                                    )}

                                    {/* Email 아이콘 (mailto:) — 캡처 구조 맞춤 */}
                                    {member.email && (
                                        <a
                                            href={`mailto:${member.email}`}
                                            className=" rounded-full"
                                            aria-label="이메일 보내기"
                                            title={member.email}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 32 32"
                                                data-testid="email"
                                                className="h-5 w-5"
                                            >
                                                <path fill="currentColor" d="M16 16.871 1.019 5H30.98L16 16.871zm0 3.146L1 8.131V27h30V8.131L16 20.017z"/>
                                            </svg>
                                        </a>
                                    )}
                                </div>
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

                            {/* ✅ 팔로우/언팔로우 버튼 (상대방 프로필일 때만 보이도록) */}
                            {!isMyProfile && (
                                <div className="mt-4 flex justify-center">
                                    <button
                                        onClick={async () => {
                                            try {
                                                if (member.isFollowing) {
                                                    console.log("👉 언팔로우 요청:", member.id);
                                                    await unfollowMember(member.id);

                                                    setMember(prev => ({ ...prev, isFollowing: false }));
                                                    // ✅ 상대방 프로필이므로 followerCount 조정
                                                    setFollowerCount(prev => Math.max(0, prev - 1));
                                                } else {
                                                    console.log("👉 팔로우 요청:", member.id);
                                                    await followMember(member.id);

                                                    setMember(prev => ({ ...prev, isFollowing: true }));
                                                    // ✅ 상대방 프로필이므로 followerCount 조정
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