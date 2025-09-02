'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchUser, uploadProfileImg, modifyNickName, modifyIntroduce } from "@/lib/UserAPI";
import ThemeToggle from "@/common/thema";
import ReactMarkdown from "react-markdown";

export default function SettingsTab() {
    return (
        <Suspense fallback={<div className="p-8 text-sm">로딩...</div>}>
            <SettingsPage />
        </Suspense>
    );
}

function SettingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [member, setMember] = useState(null);
    const [isMySetting, setIsMySetting] = useState(false);
    const [profileUrl, setProfileUrl] = useState('');
    const [linked, setLinked] = useState({google: false, github: false});
    const [form, setForm] = useState({
        nickName: '',
        introduce: '',   // introduce = README 형식
    });
    const [error, setError] = useState("");

    // 소셜 로그인 연동
    const startLink = (provider) => {
        if (provider !== 'google' && provider !== 'github') return;
        const url = `/api/DiFF/auth/link/${provider}?mode=link`;
        window.location.href = url;
    };

    const onClickRemove = () => {
        setProfileUrl('');
        alert('프로필 제거 로직 연결 예정');
    };

    const onClickWithdraw = () => {
        alert('회원탈퇴 로직 연결 예정');
    };

    useEffect(() => {
        const accessToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');
        const myNickName = typeof window !== 'undefined' && localStorage.getItem('nickName');

        if (!accessToken) {
            router.replace('/DiFF/home/main');
            return;
        }

        const nickName = searchParams.get("nickName");

        fetchUser(nickName)
            .then(async (res) => {
                const fetchedMember = res.member;
                setMember(fetchedMember);
                setProfileUrl(fetchedMember?.profileUrl || "");
                setLoading(false);
                setForm({
                    nickName: fetchedMember?.nickName || "",
                    introduce: fetchedMember?.introduce || "",
                });

                if (!nickName || nickName === myNickName) {
                    setIsMySetting(true);
                } else {
                    setIsMySetting(false);
                }
            })
            .catch(err => {
                console.error("마이페이지 오류:", err);
                setLoading(false);
                router.replace('/DiFF/home/main');
            });

        const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        fetch(`${base}/api/DiFF/auth/linked`, {
            headers: {Authorization: `Bearer ${accessToken}`},
            credentials: 'include',
        })
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => {
                setLinked({
                    google: !!data.google,
                    github: !!data.github,
                });
            })
            .catch(() => {
            });
    }, [router, searchParams]);

    // 폼 변경 핸들러
    const handleChange = e => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    // 닉네임 수정
    const handleSubmitNickName = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await modifyNickName({nickName: form.nickName});
            setError(res.msg || "닉네임이 수정되었습니다 ✅");
            localStorage.setItem("nickName", form.nickName);
            setMember((prev) => ({...prev, nickName: form.nickName}));
        } catch (err) {
            console.error("닉네임 수정 실패:", err);
            if (err.response) {
                setError(err.response.data?.msg || "닉네임 수정에 실패했습니다 ❌");
            } else {
                setError("서버와 연결할 수 없습니다 ❌");
            }
        }
    };

    // introduce 수정 (README 형식)
    const handleSubmitIntroduce = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await modifyIntroduce({introduce: form.introduce});
            setMember((prev) => ({...prev, introduce: form.introduce}));
            setError(res.msg || "프로필이 저장되었습니다 ✅");
        } catch (err) {
            console.error("introduce 수정 실패:", err);
            if (err.response) {
                setError(err.response.data?.msg || "자기소개 수정에 실패했습니다 ❌");
            } else {
                setError("서버와 연결할 수 없습니다 ❌");
            }
        }
    };

    return (
        <section className="px-4 dark:bg-gray-900 dark:text-white">
            <div className="mx-auto max-w-6xl">

                {/* 상단 탭 타이틀 */}
                <div className="flex items-center text-gray-500">
                    <Link href="/DiFF/member/profile" className="p-4 -mb-px">Profile</Link>
                    <Link href="/DiFF/member/repository" className="p-4 -mb-px">Repositories</Link>
                    <span className="text-black p-4 -mb-px font-semibold border-b-2 border-black">Settings</span>
                </div>
                <div className="h-px w-full bg-gray-300 mb-10"/>

                {/* 메인 2컬럼 레이아웃 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                    {/* LEFT : 아바타, 닉네임, 테마, 연동 */}
                    <div className="flex flex-col items-center">

                        {/* 아바타 */}
                        <div
                            className="relative h-28 w-28 overflow-hidden rounded-full border border-gray-300 bg-gray-100">
                            {profileUrl ? (
                                <img src={profileUrl} alt="avatar" className="h-full w-full object-cover"/>
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-6xl">
                                    <i className="fa-solid fa-skull"></i>
                                </div>
                            )}
                        </div>

                        {/* 프로필 업로드/제거 */}
                        <div className="mt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => document.getElementById('profileUpload')?.click()}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-400"
                            >
                                프로필 업로드
                            </button>
                            <button
                                type="button"
                                onClick={onClickRemove}
                                className="px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800"
                            >
                                프로필 제거
                            </button>
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
                                    } catch (err) {
                                        console.error('업로드 실패:', err);
                                        alert('업로드 실패');
                                    }
                                }}
                            />
                        </div>

                        {/* 닉네임 */}
                        <form onSubmit={handleSubmitNickName} className="mt-6 flex flex-col items-start w-full px-6">
                            <label className="text-lg font-semibold">닉네임</label>
                            <input
                                name="nickName"
                                value={form.nickName ?? ""}
                                className="mb-2 w-full p-2.5 border border-neutral-300 rounded-lg bg-neutral-100"
                                onChange={handleChange}
                                placeholder="nickname"
                            />
                            <button
                                type="submit"
                                className="py-2.5 px-5 w-full bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700"
                            >
                                UPDATE
                            </button>

                            {/* 성공/실패 메시지 */}
                            {error && (
                                <p
                                    className={`mt-2 text-sm ${
                                        error.includes("성공") ? "text-green-600" : "text-red-600"
                                    }`}
                                >
                                    {error}
                                </p>
                            )}
                        </form>

                        {/* 테마 */}
                        <div className="mt-10 flex items-center gap-3">
                            <div className="text-lg font-semibold">테마</div>
                            <ThemeToggle/>
                        </div>

                        {/* 소셜 연동 */}
                        <div className="mt-6 flex items-center justify-center gap-3">
                            {/* 구글 */}
                            <button
                                type="button"
                                onClick={() => !linked.google && startLink('google')}
                                disabled={linked.google}
                                className={
                                    `px-4 py-2 rounded text-white ` +
                                    (linked.google
                                        ? 'bg-gray-400 cursor-not-allowed opacity-60'
                                        : 'bg-red-500 hover:bg-red-400')
                                }
                            >
                                {linked.google ? '구글 연동 완료' : '구글 연동'}
                            </button>

                            {/* 깃허브 */}
                            <button
                                type="button"
                                onClick={() => !linked.github && startLink('github')}
                                disabled={linked.github}
                                className={
                                    `px-4 py-2 rounded text-white ` +
                                    (linked.github
                                        ? 'bg-gray-400 cursor-not-allowed opacity-60'
                                        : 'bg-gray-800 hover:bg-gray-700')
                                }
                            >
                                {linked.github ? '깃 연동 완료' : '깃허브 연동'}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT : Profile README, 회원탈퇴 */}
                    <div>
                        {/* Profile README (introduce 컬럼 활용) */}
                        <div className="mt-4 w-full">
                            <h3 className="mb-3 text-2xl font-bold">Profile README</h3>
                            <form onSubmit={handleSubmitIntroduce} className="flex flex-col gap-3">
                              <textarea
                                  name="introduce"
                                  value={form.introduce ?? ""}
                                  onChange={handleChange}
                                  className="min-h-[200px] rounded-md border border-gray-300 bg-white p-4 text-gray-700"
                                  placeholder={`마크다운 형식으로 기술/자기소개 작성\n예) ![Java](https://img.shields.io/badge/Java-ED8B00?logo=openjdk&logoColor=white)\n\n저는 Spring Boot와 React를 좋아합니다!`}
                              />
                                <button
                                    type="submit"
                                    className="self-end rounded bg-neutral-800 px-4 py-2 text-white hover:bg-neutral-700"
                                >
                                    Save
                                </button>
                            </form>

                            {/* 미리보기 */}
                            <div className="mt-6 border rounded-md p-4 bg-gray-50">
                                <h4 className="font-semibold mb-2">Preview</h4>
                                <ReactMarkdown>{form.introduce}</ReactMarkdown>
                            </div>
                        </div>

                        {/* 회원탈퇴 */}
                        <div className="mt-10">
                            <div className="mb-3 text-lg font-semibold">회원탈퇴</div>
                            <button
                                type="button"
                                onClick={onClickWithdraw}
                                className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
                            >
                                탈퇴하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}