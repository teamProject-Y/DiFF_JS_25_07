'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchUser, uploadProfileImg } from "@/lib/UserAPI";
import { useEffect, useState, Suspense } from "react";
import ThemeToggle from "@/common/thema";

export default function MyInfoPage() {
    return (
        <Suspense fallback={<div>로딩...</div>}>
            <MyInfoInner />
        </Suspense>
    );
}

function MyInfoInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [profileUrl, setProfileUrl] = useState("");
    const [isMyProfile, setIsMyProfile] = useState(false);
    const [linked, setLinked] = useState({ google: false, github: false });

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
            .then(res => {
                setMember(res.member);
                setProfileUrl(res.member?.profileUrl || "");
                setLoading(false);
                if (!nickName || nickName === myNickName) {
                    setIsMyProfile(true);
                } else {
                    setIsMyProfile(false);
                }
            })
            .catch(err => {
                console.error("마이페이지 오류:", err);
                setLoading(false);
                router.replace('/DiFF/home/main');
            });
    }, [router, searchParams]);

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
        <section className="pt-24 text-xl px-4 dark:bg-gray-900">
            <div className="mx-auto max-w-4xl">

                {/* 프로필 이미지 */}
                <div className="text-center mb-8">
                    <div className="flex flex-col items-center">
                        {profileUrl ? (
                            <img
                                src={profileUrl}
                                alt="프로필"
                                className="w-32 h-32 rounded-full border mb-4 object-cover"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full border flex items-center justify-center mb-4 text-gray-400">
                                No Image
                            </div>
                        )}

                        {/* 본인 프로필만 출력 */}
                        {isMyProfile && (
                            <div className="flex items-center gap-3">
                                {/* 숨겨진 파일 input */}
                                <input
                                    id="profileUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        setSelectedFile(file);

                                        try {
                                            const url = await uploadProfileImg(file);
                                            setProfileUrl(url);
                                            console.log("업로드 성공:", url);
                                        } catch (err) {
                                            console.error("업로드 실패:", err);
                                            alert("업로드 실패");
                                        }
                                    }}
                                    className="hidden"
                                />

                                <button
                                    type="button"
                                    onClick={() => document.getElementById("profileUpload").click()}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-400"
                                >
                                    프로필 업로드
                                </button>

                                {/* 다크 모드 토글 */}
                                <ThemeToggle />

                                {/* 소셜 연동 버튼 */}
                                {/* 소셜 연동 버튼 */}
                                <div className="flex items-center gap-3 mt-3">
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
                                        {linked.google ? '구 연동 완료' : '구글 연동'}
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
                    </div>
                </div>

                {/* 사용자 정보 */}
                <table className="w-full border-collapse border border-neutral-300 mb-12">
                    <tbody>
                    <tr>
                        <th className="border p-2">가입일</th>
                        <td className="border p-2 text-center">{new Date(member.regDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                        })}</td>
                    </tr>
                    <tr>
                        <th className="border p-2">닉네임</th>
                        <td className="border p-2 text-center">{member.nickName}</td>
                    </tr>
                    <tr>
                        <th className="border p-2">이메일</th>
                        <td className="border p-2 text-center">{member.email}</td>
                    </tr>
                    {isMyProfile && (
                        <tr>
                            <th className="border p-2">회원정보 수정</th>
                            <td className="border p-2 text-center">
                                <Link
                                    href="/DiFF/member/modify"
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    수정
                                </Link>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>

                {/* 본인 프로필만 */}
                {isMyProfile && (
                    <>
                        <div className="text-center mb-6">
                            <button
                                onClick={() => router.push('/DiFF/member/repository')}
                                className="px-6 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"
                            >
                                내 레포지토리 보기
                            </button>
                        </div>

                        <div className="text-center mb-6">
                            <button
                                onClick={() => router.push('/DiFF/article/drafts')}
                                className="px-6 py-2 text-sm bg-black text-white rounded hover:bg-green-500"
                            >
                                임시저장
                            </button>
                        </div>
                    </>
                )}

                {/* 뒤로가기 (누구 프로필이든 항상 보임) */}
                <div className="text-center">
                    <button
                        onClick={() => router.replace('/DiFF/home/main')}
                        className="px-6 py-2 text-sm bg-neutral-800 text-white rounded hover:bg-neutral-700"
                    >
                        뒤로가기
                    </button>
                </div>
            </div>
        </section>
    );
}
