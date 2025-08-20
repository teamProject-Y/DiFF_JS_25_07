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
                    setIsMyProfile(true);  // ✅ 내 프로필
                } else {
                    setIsMyProfile(false); // ✅ 다른 사람 프로필
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

                        {/* ✅ 나의 프로필일 때만 업로드 가능 */}
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

                                {/* 버튼 하나 */}
                                <button
                                    type="button"
                                    onClick={() => document.getElementById("profileUpload").click()}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-400"
                                >
                                    프로필 업로드
                                </button>

                                {/* 다크 모드 토글 */}
                                <ThemeToggle />
                            </div>
                        )}
                    </div>
                </div>

                {/* 사용자 정보 */}
                <table className="w-full border-collapse border border-neutral-300 mb-12">
                    <tbody>
                    <tr>
                        <th className="border p-2">가입일</th>
                        <td className="border p-2 text-center">{member.regDate}</td>
                    </tr>
                    <tr>
                        <th className="border p-2">아이디</th>
                        <td className="border p-2 text-center">{member.loginId}</td>
                    </tr>
                    <tr>
                        <th className="border p-2">이름</th>
                        <td className="border p-2 text-center">{member.name}</td>
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

                {/* ✅ 나의 프로필일 때만 보이는 버튼 */}
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

                {/* 🔹 뒤로가기 (누구 프로필이든 항상 보임) */}
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
