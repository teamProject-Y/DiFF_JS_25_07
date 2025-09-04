'use client';

import {useEffect, useMemo, useRef, useState, Suspense} from 'react';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {fetchUser, uploadProfileImg, modifyNickName, modifyIntroduce} from "@/lib/UserAPI";
import { updateNotificationSetting } from "@/lib/NotificationAPI";
import ThemeToggle from "@/common/thema";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {oneDark} from "react-syntax-highlighter/dist/cjs/styles/prism";


export default function SettingsTab() {
    return (
        <Suspense fallback={<div className="p-8 text-sm">Loading...</div>}>
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
    const [linked, setLinked] = useState({google: false, github: false});
    const [form, setForm] = useState({nickName: '', introduce: ''});

    const [banner, setBanner] = useState(null);
    const [activeMdTab, setActiveMdTab] = useState('write');
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [removing, setRemoving] = useState(false);

    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    const [settings, setSettings] = useState({
        reply: member?.allowReplyNotification ?? false,
        follow: member?.allowFollowNotification ?? false,
        article: member?.allowArticleNotification ?? false,
        draft: member?.allowDraftNotification ?? false,
    });

//  알림 아이템
    const items = [
        {
            key: "reply",
            title: "Comment Notification",
            desc: "Get notified when someone comments on your post.",
        },
        {
            key: "follow",
            title: "Follow Notification",
            desc: "Get notified when someone follows you.",
        },
        {
            key: "article",
            title: "New Article Notification",
            desc: "Get notified when someone you follow publishes a new article.",
        },
        {
            key: "draft",
            title: "Draft Notification",
            desc: "Get notified when your post is saved as a draft.",
        },
    ];


    //  토글 핸들러
    const handleToggle = async (type) => {
        const newValue = !settings[type];
        setSettings((prev) => ({ ...prev, [type]: newValue }));

        try {
            await updateNotificationSetting(type, newValue);
            console.log(`✅ ${type} 알림 변경:`, newValue);
        } catch (err) {
            console.error("❌ 알림 설정 실패:", err);
            // 실패 시 롤백
            setSettings((prev) => ({ ...prev, [type]: !newValue }));
        }
    };

    // 소셜 로그인 연동
    const startLink = (provider) => {
        if (provider !== 'google' && provider !== 'github') return;
        const url = `/api/DiFF/auth/link/${provider}?mode=link`;
        window.location.href = url;
    };

    const onClickRemove = () => {
        setProfileUrl('');
        setBanner({type: 'info', msg: '프로필 제거 로직 연결 예정'});
    };

    const onClickWithdraw = () => setConfirmOpen(true);

    useEffect(() => {
        const accessToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');
        const myNickName = typeof window !== 'undefined' && localStorage.getItem('nickName');

        if (!accessToken) {
            router.replace('/DiFF/home/main');
            return;
        }

        const nickName = searchParams.get("nickName");

        fetchUser(nickName)
            .then((res) => {
                const fetchedMember = res.member;
                setMember(fetchedMember);
                setProfileUrl(fetchedMember?.profileUrl || "");
                setForm({
                    nickName: fetchedMember?.nickName || "",
                    introduce: fetchedMember?.introduce || "",
                });
                setSettings({
                    reply: fetchedMember.allowReplyNotification,
                    follow: fetchedMember.allowFollowNotification,
                    article: fetchedMember.allowArticleNotification,
                    draft: fetchedMember.allowDraftNotification,
                });
                setLoading(false);

                setIsMySetting(!nickName || nickName === myNickName);
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
            .then(data => setLinked({google: !!data.google, github: !!data.github}))
            .catch(() => {
            });
    }, [router, searchParams]);

    const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

    const handleRemoveAvatar = async () => {
        if (!isMySetting || !profileUrl) return;
        if (!confirm("프로필 사진을 삭제할까요?")) return;

        setRemoving(true);
        setBanner(null);
        try {
            await uploadProfileImg(null);
            setProfileUrl('');
            setMember((prev) => ({...prev, profileUrl: ''}));
            setBanner({type: 'success', msg: '프로필 사진을 삭제했습니다'});
        } catch (e) {
            setBanner({type: 'error', msg: e.message || '삭제에 실패했습니다'});
        } finally {
            setRemoving(false);
        }
    };

    const dirtyNick = useMemo(
        () => form.nickName !== (member?.nickName || ''),
        [form.nickName, member?.nickName]
    );

    const dirtyIntro = useMemo(
        () => form.introduce !== (member?.introduce || ''),
        [form.introduce, member?.introduce]
    );

    // 닉네임 수정
    const handleSubmitNickName = async (e) => {
        e.preventDefault();
        setBanner(null);
        try {
            const res = await modifyNickName({nickName: form.nickName});
            localStorage.setItem("nickName", form.nickName);
            setMember((prev) => ({...prev, nickName: form.nickName}));
            setBanner({type: 'success', msg: res.msg || "닉네임이 수정되었습니다"});
        } catch (err) {
            console.error("닉네임 수정 실패:", err);
            if (err.response) {
                setBanner({type: 'error', msg: err.response.data?.msg || "닉네임 수정에 실패했습니다"});
            } else {
                setBanner({type: 'error', msg: "서버와 연결할 수 없습니다"});
            }
        }
    };

    // introduce 수정 (README 형식)
    const handleSubmitIntroduce = async (e) => {
        e.preventDefault();
        if (!dirtyIntro) return;
        setBanner(null);

        try {
            const res = await modifyIntroduce({introduce: form.introduce});
            setMember((prev) => ({...prev, introduce: form.introduce}));
            setBanner({type: 'success', msg: res.msg || "프로필이 저장되었습니다"});
        } catch (err) {
            console.error("introduce 수정 실패:", err);
            if (err.response) {
                setBanner({type: 'error', msg: err.response.data?.msg || "자기소개 수정에 실패했습니다"});
            } else {
                setBanner({type: 'error', msg: "서버와 연결할 수 없습니다"});
            }
        }
    };

    // README 저장 단축키: ⌘/Ctrl + Enter
    useEffect(() => {
        const handler = (e) => {
            const cmd = e.metaKey || e.ctrlKey;
            if (cmd && e.key === 'Enter') {
                const formEl = document.getElementById('introduceForm');
                if (formEl) {
                    e.preventDefault();
                    formEl.requestSubmit();
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleInput = (e) => {
        const textarea = textareaRef.current;
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
    };

    if (loading) return <PageSkeleton/>;

    return (
        <section className="min-h-full px-4 pb-16">
            <div className="mx-auto max-w-6xl">

                {/* 상단 탭 타이틀 */}
                <div className="flex items-center text-neutral-500">
                    <TopTab href="/DiFF/member/profile" label="Profile"/>
                    <TopTab href="/DiFF/member/repository" label="Repositories"/>
                    <TopTab active href="#" label="Settings"/>
                </div>
                <div className="h-px w-full bg-neutral-200 dark:bg-neutral-800 mb-10"/>

                {/* 배너 */}
                {banner && (
                    <div
                        className={
                            "mb-6 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all " +
                            (banner.type === 'success'
                                ? "border-green-400/40 bg-green-50/50 text-green-700 dark:border-green-500/30 dark:bg-green-900/20 dark:text-green-300"
                                : banner.type === 'error'
                                    ? "border-red-400/40 bg-red-50/50 text-red-700 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-300"
                                    : "border-neutral-300/60 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-300")
                        }
                    >
                        <span className="inline-block h-2 w-2 rounded-full bg-current opacity-60"/>
                        <span>{banner.msg}</span>
                    </div>
                )}

                {/* 메인 2컬럼 */}
                <div className="flex gap-6 px-2">

                    {/* LEFT : 아바타/닉네임/테마/연동 */}
                    <div className="flex flex-col gap-4">

                        {/* 아바타 카드 */}
                        <Card>
                            <div className="flex items-start gap-4">
                                <div
                                    className="relative h-28 w-28 overflow-hidden rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900">
                                    {profileUrl ? (
                                        <img src={profileUrl} alt="avatar" className="h-full w-full object-cover"/>
                                    ) : (
                                        <div
                                            className="flex h-full w-full items-center justify-center text-6xl text-neutral-400">
                                            <i className="fa-solid fa-skull"></i>
                                        </div>
                                    )}

                                    {isMySetting && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-neutral-900/70 py-1 text-[12px] text-neutral-200 backdrop-blur"
                                        >
                                            <i className="fa-regular fa-camera"></i>
                                            <span>Edit</span>
                                        </button>
                                    )}
                                    <input
                                        ref={fileInputRef}
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
                                                setBanner({type: 'success', msg: '프로필 이미지가 업데이트되었습니다'});
                                            } catch (err) {
                                                console.error('업로드 실패:', err);
                                                setBanner({type: 'error', msg: '업로드 실패'});
                                            }
                                        }}
                                    />
                                </div>

                                <div className="flex-1 px-2">
                                    <div className="text-sm text-neutral-500">계정</div>
                                    <div className="mt-1 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                                        {member?.email || '-'}
                                    </div>

                                    {/* 소셜 연동 */}
                                    <div className="mt-4 flex items-center gap-2">
                                        <LinkBtn
                                            brand="google"
                                            label={linked.google ? "Connected" : "Connect"}
                                            onClick={() => !linked.google && startLink("google")}
                                            disabled={linked.google}
                                        />

                                        <LinkBtn
                                            brand="github"
                                            label={linked.github ? "Connected" : "Connect"}
                                            onClick={() => !linked.github && startLink("github")}
                                            disabled={linked.github}
                                        />

                                    </div>
                                </div>
                                <ThemeToggle/>

                            </div>
                        </Card>

                        {/* 닉네임 카드 */}
                        <Card>
                            <form onSubmit={handleSubmitNickName} className="flex flex-col gap-3">
                                <label
                                    className="text-sm font-medium text-neutral-600 dark:text-neutral-300">닉네임</label>
                                <input
                                    name="nickName"
                                    value={form.nickName ?? ""}
                                    onChange={handleChange}
                                    placeholder="nickname"
                                    className="w-full rounded-lg border border-neutral-300 bg-neutral-100 p-2.5 text-neutral-900 outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                />
                                <button
                                    type="submit"
                                    disabled={!dirtyNick}
                                    className={
                                        "rounded-lg px-4 py-2 text-sm text-white " +
                                        (dirtyNick
                                            ? "bg-neutral-900 hover:bg-neutral-800"
                                            : "bg-neutral-600/50 cursor-not-allowed")
                                    }
                                >
                                    UPDATE
                                </button>
                            </form>
                        </Card>

                        <Card className="p-4 space-y-4">
                            <h2 className="text-lg font-semibold mb-2">Notification Settings</h2>

                            {items.map((item) => (
                                <div
                                    key={item.key}
                                    className="flex items-center justify-between border-b pb-3 last:border-0"
                                >
                                    <div className="pr-2">
                                        <div className="mb-1 text-base font-medium">{item.title}</div>
                                        <p className="text-sm text-neutral-500">{item.desc}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleToggle(item.key)}
                                        className={`rounded px-3 py-1.5 text-sm self-end border transition-colors
              ${
                                            settings[item.key]
                                                ? "border-black text-black dark:border-black"
                                                : "border-red-500 text-red-500"
                                        }`}
                                    >
                                        {settings[item.key] ? "ON" : "OFF"}
                                    </button>
                                </div>
                            ))}
                        </Card>

                        <Card>
                            <div className="flex items-center justify-between">
                                <div className="pr-2">
                                    <div className="mb-1 text-lg font-semibold">Delete account</div>
                                    <p className="text-sm text-neutral-500">Your account and data will be permanently
                                        deleted.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClickWithdraw}
                                    className="rounded px-3 py-1.5 text-sm self-end border
                                    border-gray-300 hover:border-red-500 hover:text-red-500
                                    dark:border-gray-400 dark:hover:border-red-500"
                                >
                                    Delete account
                                </button>
                            </div>

                        </Card>
                    </div>

                    <div className="flex-grow flex flex-col gap-4">

                        {/* Profile README */}
                        <Card>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-2xl font-bold">Profile README</h3>

                                {/* Write / Preview 탭 */}
                                <div className="flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setActiveMdTab("write")}
                                        className={
                                            "px-3 py-1 text-sm " +
                                            (activeMdTab === "write"
                                                ? "bg-neutral-800 text-neutral-100"
                                                : "text-neutral-500 dark:text-neutral-300")
                                        }
                                    >
                                        Write
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveMdTab("preview")}
                                        className={
                                            "px-3 py-1 text-sm " +
                                            (activeMdTab === "preview"
                                                ? "bg-neutral-800 text-neutral-100"
                                                : "text-neutral-500 dark:text-neutral-300")
                                        }
                                    >
                                        Preview
                                    </button>
                                </div>
                            </div>

                            <form id="introduceForm" onSubmit={handleSubmitIntroduce} className="flex flex-col gap-3">
                                {activeMdTab === "write" ? (
                                    // ✍️ 작성 모드
                                    <textarea
                                        name="introduce"
                                        value={form.introduce ?? ""}
                                        onChange={handleChange}
                                        onInput={handleInput}
                                        className="min-h-[220px] rounded-md border border-neutral-300 bg-white p-4 text-neutral-800 outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                        placeholder={`마크다운 형식으로 자기소개 작성\n예) ![Java](https://img.shields.io/badge/Java-ED8B00?logo=openjdk&logoColor=white)\n\n저는 Spring Boot와 React를 좋아합니다!`}
                                    />
                                ) : (
                                    // 👀 미리보기 모드
                                    <div className="markdown min-h-[220px] rounded-md border border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900/60">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw]}
                                            components={{
                                                code({ node, inline, className, children, ...props }) {
                                                    const match = /language-(\w+)/.exec(className || "");
                                                    return !inline && match ? (
                                                        <SyntaxHighlighter
                                                            style={oneDark}
                                                            language={match[1]}
                                                            PreTag="div"
                                                            {...props}
                                                        >
                                                            {String(children).replace(/\n$/, "")}
                                                        </SyntaxHighlighter>
                                                    ) : (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                                ul: ({ node, ...props }) => (
                                                    <ul className="list-disc pl-6" {...props} />
                                                ),
                                                ol: ({ node, ...props }) => (
                                                    <ol className="list-decimal pl-6" {...props} />
                                                ),
                                            }}
                                        >
                                            {member.introduce}
                                        </ReactMarkdown>
                                    </div>
                                )}

                                {/* 하단 Save 버튼 */}
                                <div className="flex items-center justify-between text-xs text-neutral-500">
                                    <div>⌘/Ctrl + Enter 로 저장</div>
                                    <button
                                        type="submit"
                                        disabled={!dirtyIntro}
                                        className={
                                            "rounded bg-neutral-900 px-4 py-2 text-white " +
                                            (!dirtyIntro ? "opacity-50 cursor-not-allowed" : "hover:bg-neutral-800")
                                        }
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </Card>


                        {/* 회원탈퇴 */}
                        <Card>
                        </Card>
                    </div>
                </div>
            </div>

            {/*회원 탈퇴 모달*/}
            {confirmOpen && (
                <div className="fixed inset-0 z-50 grid place-items-center p-4">
                    {/* overlay */}
                    <button
                        aria-hidden
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={() => setConfirmOpen(false)}
                    />
                    {/* dialog */}
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirm-title"
                        className="
                  relative w-full max-w-md rounded-lg
                  border bg-white text-neutral-900 shadow-2xl ring-1 ring-black/5
                  dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700 dark:ring-0
                  transition-transform duration-200
                "
                    >
                        <div className="p-5">
                            <div id="confirm-title" className="text-lg font-semibold">
                                Are you sure you want to delete your account?
                            </div>
                            <p className="mt-1 px-1 text-sm text-neutral-500 dark:text-neutral-400">
                                This action cannot be undone.
                            </p>

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    onClick={() => setConfirmOpen(false)}
                                    className="
                                rounded-md px-4 py-2 text-sm
                                border border-neutral-200 bg-neutral-100 text-neutral-900 hover:bg-neutral-200
                                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400
                                dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700
                                dark:focus-visible:outline-neutral-500
                              "
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setConfirmOpen(false);
                                        alert('회원탈퇴 로직 연결 예정');
                                    }}
                                    className="
                                rounded-md px-4 py-2 text-sm
                                bg-red-600 text-white hover:bg-red-500
                                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500
                              "
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            )}
        </section>
    );
}

function Card({children}) {
    return (
        <div
            className="rounded-lg border border-neutral-200 bg-white px-4 py-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950/30">
            {children}
        </div>
    );
}

function TopTab({href, label, active}) {
    return active ? (
        <span
            className="p-4 -mb-px font-semibold text-black dark:text-neutral-300 border-b-2 border-black dark:border-neutral-300">
      {label}
    </span>
    ) : (
        <Link href={href} className="p-4 -mb-px hover:text-neutral-700 dark:hover:text-neutral-300">
            {label}
        </Link>
    );
}

function LinkBtn({label, onClick, disabled, brand}) {
    const base =
        "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition " +
        "border focus-visible:outline-none focus-visible:ring-2 " +
        "focus-visible:ring-neutral-400/60 focus-visible:ring-offset-2 " +
        "focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-950 " +
        "border-neutral-300 dark:border-neutral-700";

    const enabled =
        "bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 active:bg-neutral-800 " +
        "dark:bg-neutral-900 dark:text-white";

    const blocked =
        "bg-neutral-100 text-neutral-400 border-neutral-200 " +
        "dark:bg-neutral-800/40 dark:text-neutral-500 dark:border-neutral-700/80 " +
        "cursor-not-allowed pointer-events-none select-none shadow-none";

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-disabled={disabled ? "true" : "false"}
            aria-label={label}
            title={disabled ? "Connected" : "Connect"}
            className={`${base} ${disabled ? blocked : enabled}`}
        >
            {/* 브랜드 아이콘 */}
            {brand === "google" && (
                <i
                    className="fab fa-google text-md"
                    aria-hidden="true"
                />
            )}
            {brand === "github" && (
                <i
                    className="fab fa-github text-md"
                    aria-hidden="true"
                />
            )}

            <span className="tracking-tight">{label}</span>
        </button>
    );
}

function PageSkeleton() {
    return (
        <section className="px-4 pb-16">
            <div className="mx-auto max-w-6xl animate-pulse">
                <div className="h-9 w-64 bg-neutral-200 dark:bg-neutral-800 rounded mb-6"/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div className="h-44 rounded-2xl bg-neutral-200 dark:bg-neutral-800"/>
                        <div className="h-40 rounded-2xl bg-neutral-200 dark:bg-neutral-800"/>
                        <div className="h-24 rounded-2xl bg-neutral-200 dark:bg-neutral-800"/>
                    </div>
                    <div className="space-y-6">
                        <div className="h-96 rounded-2xl bg-neutral-200 dark:bg-neutral-800"/>
                        <div className="h-24 rounded-2xl bg-neutral-200 dark:bg-neutral-800"/>
                    </div>
                </div>
            </div>
        </section>
    );
}