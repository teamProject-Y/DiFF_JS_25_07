// member/settings/page

'use client';

import {useEffect, useState, Suspense} from 'react';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {fetchUser, uploadProfileImg, modifyUser } from "@/lib/UserAPI";
import TechSettings from './techSettings';
import ThemeToggle from "@/common/thema";


export default function SettingsTab() {
    return (
        <Suspense fallback={<div className="p-8 text-sm">로딩...</div>}>
            <SettingsPage/>
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
    const [selectedFile, setSelectedFile] = useState(null);
    const [linkedGithub, setLinkedGithub] = useState(false);
    const [linked, setLinked] = useState({google: false, github: false});
    const [form, setForm] = useState({
        nickName: '',
        password: '',
    });
    const [error, setError] = useState("");

    const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

    // 소셜 로그인 통합, 연동
    const startLink = (provider) => {
        if (provider !== 'google' && provider !== 'github') return;

        const url = `/api/DiFF/auth/link/${provider}?mode=link`;
        window.location.href = url;
    };

    const onClickRemove = () => {
        // TODO: 삭제 API 연결(deleteProfileImg)
        setProfileUrl('');
        alert('프로필 제거 로직 연결 예정');
    };

    const onClickWithdraw = () => {
        // TODO: 회원탈퇴 API 연결
        alert('회원탈퇴 로직 연결 예정');
    };

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

        (async () => {
            try {
                const res = await fetchUser(); // 내 프로필만 보이는 페이지니까 nickName 없이 호출
                const m = res?.member || res;
                setMember(m);
                setProfileUrl(m?.profileUrl || m?.profileImg || ''); // 백엔드 필드명 양쪽 다 대비
            } catch (e) {
                console.error('settings: fetchUser 실패', e);
            }
        })();

        const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        fetch(`${base}/api/DiFF/auth/linked`, {
            headers: {Authorization: `Bearer ${accessToken}`},
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
    }, [router, searchParams]);



    useEffect(() => {
        const accessToken = typeof window !== "undefined" && localStorage.getItem('accessToken');
        if (!accessToken) {
            router.replace('/DiFF/member/login');
            return;
        }

        fetchUser()
            .then(user => {
                setMember(user);
                setForm({
                    id: user.id || "",
                    loginId: user.loginId || "",
                    name: user.name || "",
                    nickName: user.nickName || "",
                    email: user.email || "",
                });
            })
            .catch(() => {
                router.replace('/DiFF/home/main');
            });
    }, [router]);

    // 3. 폼 변경 핸들러
    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 4. 회원정보 수정 요청
    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        try {
            await modifyUser(form);
            router.push("/DiFF/member/settings");
        } catch {
            setError("정보 수정에 실패했습니다.");
        }
    };

    return (
        <section className="px-4 dark:bg-gray-900 dark:text-white">
            <div className="mx-auto max-w-6xl">

                {/* 상단 탭 타이틀 영역 */}
                <div className="mb-3 flex items-center gap-6 text-2xl font-semibold">
                    {isMySetting && (
                    <Link href="/DiFF/member/profile" className="text-gray-400 hover:text-gray-700">Profile</Link>
                        )}
                    <span className="text-black hover:text-gray-700">Settings</span>
                </div>
                <div className="h-px w-full bg-gray-300 mb-10"/>

                {/* 중앙 본문 프레임 */}
                <div className="flex flex-col items-center">
                    {/* 아바타 */}
                    <div className="relative h-28 w-28 overflow-hidden rounded-full border border-gray-300 bg-gray-100">
                        {profileUrl ? (
                            <img src={profileUrl} alt="avatar" className="h-full w-full object-cover"/>
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-4xl">🟡</div>
                        )}
                    </div>

                    {/* 업로드/제거 버튼 */}
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
                                    console.log('업로드 성공:', url);
                                } catch (err) {
                                    console.error('업로드 실패:', err);
                                    alert('업로드 실패');
                                }
                            }}
                        />
                    </div>

                    {/* 연동 */}
                    <div className="mt-10 grid w-full max-w-2xl grid-cols-[90px_1fr] items-center gap-y-6">

                        <form>
                            <label className="text-lg font-semibold">닉네임</label>
                            <input name="nickName" value={form.nickName ?? ""} className="mb-4 w-96 p-2.5 border border-neutral-300 rounded-lg bg-neutral-100" onChange={handleChange} placeholder="nickname"/>
                            <button type="submit"
                                    className="py-2.5 px-5 w-96 bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700">
                                UPDATE
                            </button>
                        </form>

                        <br/>

                        <div className="text-lg font-semibold">테마</div>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                        </div>

                        <div className="text-lg font-semibold">연동</div>
                        <div>
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

                    {/* Technologies & Tools */}
                    <div className="mt-10 w-full max-w-2xl">
                        <h3 className="mb-3 text-2xl font-bold">Technologies &amp; Tools</h3>
                        <ul className="flex flex-wrap gap-2">
                            <TechSettings/>
                        </ul>
                    </div>

                    {/* introduce */}
                    <div className="mt-10 w-full max-w-2xl">
                        <h3 className="mb-3 text-2xl font-bold">introduce</h3>
                        <div className="min-h-[120px] rounded-md border border-gray-300 bg-gray-100 p-6 text-gray-600">
                            {/* TODO: 자기소개 편집/저장 폼 연결 */}
                            없음
                        </div>
                    </div>

                    {/* 회원탈퇴 */}
                    <div className="mt-10 w-full max-w-2xl">
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
        </section>
    );
}