'use client';

import {useEffect, useMemo, useRef, useState, Suspense} from 'react';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {fetchUser, uploadProfileImg, modifyNickName, modifyIntroduce, deleteUser} from "@/lib/UserAPI";
import { updateNotificationSetting } from "@/lib/NotificationAPI";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {oneDark} from "react-syntax-highlighter/dist/cjs/styles/prism";
import {useDialog} from "@/common/commonLayout";

export default function SettingsTab() {
    return (
        <Suspense fallback={<div className="p-8 text-sm">Loading...</div>}>
            <SettingsPage/>
        </Suspense>
    );
}

function SettingsPage() {
    const router = useRouter();
    const { alert, confirm } = useDialog();
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
    const [editingNick, setEditingNick] = useState(false);
    const nickRef = useRef(null);

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
            title: "Comment",
            desc: "When someone comments on your post.",
        },
        {
            key: "follow",
            title: "Follow",
            desc: "When someone follows you.",
        },
        {
            key: "article",
            title: "New Article",
            desc: "When someone you follow publishes a new article.",
        },
        {
            key: "draft",
            title: "Draft",
            desc: "When your post is saved as a draft.",
        },
    ];

    const handleToggle = async (type) => {
        const newValue = !settings[type];
        setSettings((prev) => ({ ...prev, [type]: newValue }));

        try {
            await updateNotificationSetting(type, newValue);
        } catch (err) {
            setSettings((prev) => ({ ...prev, [type]: !newValue }));
        }
    };

    // 소셜 로그인 연동
    const startLink = (provider) => {
        if (provider !== 'google' && provider !== 'github') return;
        const url = `/api/DiFF/auth/link/${provider}?mode=link`;
        window.location.href = url;
    };

    const onClickRemove = async () => {
        const ok = await confirm({
            intent: "danger",
            title: "Are you sure you want to delete your account?",
            message: "This action cannot be undone.",
            confirmText: "Delete account",
            cancelText: "Cancel",
        });
        if (!ok) return;

        try {
            const res = await deleteUser(member.id);
            if (res?.resultCode?.startsWith("S-")) {
                alert({intent: "neutral", title: "Goodbye, see you next time."});
                router.push("/DiFF/member/logout")
            } else {
                alert({intent: "warning", title: res?.msg ?? "Server error. Please try again later."});
            }
        } catch (err) {
            console.error("Deletion failed: ", err);
            alert({intent: "danger", title: "Server error. Please try again later."});
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

        const base = process.env.NEXT_PUBLIC_HOMEPAGE_URL || '';
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

        const ok = await confirm({
            intent: 'Info',
            title: 'Do you want to delete your profile picture?',
            confirmText: 'Delete',
            cancelText: 'Cancel',
        });
        if (!ok) return;

        setRemoving(true);
        try {
            await uploadProfileImg(null);
            setProfileUrl('');
            setMember(prev => ({ ...prev, profileUrl: '' }));

        } catch (e) {
            await alert({
                intent: 'danger',
                title: 'Failed to delete.',
                message: e?.response?.data?.msg || e.message || '',
            });
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
            setBanner({type: 'success', msg: res.msg || "Nickname updated successfully."});
        } catch (err) {
            console.error("Failed to update nickname:", err);
            if (err.response) {
                setBanner({type: 'error', msg: err.response.data?.msg || "Failed to update nickname."});
            } else {
                setBanner({type: 'error', msg: "Server error. Please try again later."});
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
            setBanner({type: 'success', msg: res.msg || "README updated successfully."});
        } catch (err) {
            console.error("introduce 수정 실패:", err);
            if (err.response) {
                setBanner({type: 'error', msg: err.response.data?.msg || "Failed to update README."});
            } else {
                setBanner({type: 'error', msg: "Server error. Please try again later."});
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
        const textarea = e.target;
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
    };


    if (loading) return <PageSkeleton/>;

    // 닉네임 저장
    const onSaveNick = async () => {
        if (!dirtyNick) {
            setEditingNick(false);
            return;
        }
        setBanner(null);
        try {
            const res = await modifyNickName({ nickName: form.nickName });
            localStorage.setItem("nickName", form.nickName);
            setMember((prev) => ({ ...prev, nickName: form.nickName }));
            setBanner({ type: "success", msg: res.msg || "Nickname updated successfully." });
            setEditingNick(false);
        } catch (err) {
            console.error("닉네임 수정 실패:", err);
            if (err.response) {
                setBanner({ type: "error", msg: err.response.data?.msg || "Failed to update nickname." });
            } else {
                setBanner({ type: "error", msg: "Server error. Please try again later." });
            }
        }
    };
// 닉네임 편집 취소
    const cancelEditNick = () => {
        setForm((prev) => ({ ...prev, nickName: member?.nickName || "" }));
        setEditingNick(false);
    };

    return (
        <section className="h-screen flex flex-col px-4 dark:text-neutral-300 overflow-hidden">
            <div className="shrink-0">
                <div className="mx-auto max-w-6xl">
                    <div className="flex items-center text-neutral-500">
                        <TopTab href="/DiFF/member/profile" label="Profile"/>
                        <TopTab href="/DiFF/member/repository" label="Repositories"/>
                        <TopTab active href="#" label="Settings"/>
                    </div>
                    <div className="h-px w-full bg-neutral-200 dark:bg-neutral-700"/>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pt-10">
                <div className="mx-auto max-w-6xl pb-16">
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

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center min-w-0 flex-grow h-11">
                                                {editingNick ? (
                                                    <>
                                                        <input
                                                            ref={nickRef}
                                                            value={form.nickName}
                                                            onChange={(e) => setForm({ ...form, nickName: e.target.value })}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") onSaveNick();
                                                                if (e.key === "Escape") cancelEditNick();
                                                            }}
                                                            className="flex-grow min-w-0 w-[80%] px-2 py-1 mr-2 rounded-md border text-xl font-semibold
                                                                        focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                            placeholder="nickname"
                                                        />
                                                        <button
                                                            onClick={onSaveNick}
                                                            className="p-1"
                                                            title="Save"
                                                            aria-label="Save nickname"
                                                        >
                                                            <i className="fa-solid fa-check"></i>
                                                        </button>
                                                        <button
                                                            onClick={cancelEditNick}
                                                            className="p-1"
                                                            title="Cancel"
                                                            aria-label="Cancel edit"
                                                        >
                                                            <i className="fa-solid fa-xmark"></i>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="break-all pr-2 text-3xl font-bold">
                                                            {member?.nickName ?? "nickname"}
                                                        </p>
                                                        <button
                                                            onClick={() => setEditingNick(true)}
                                                            className="pb-1 text-base text-neutral-400"
                                                            title="Rename"
                                                            aria-label="Rename nickname"
                                                        >
                                                            <i className="fa-solid fa-pen"></i>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="my-1 text-base text-neutral-500 dark:text-neutral-500">
                                            {member?.email || '-'}
                                        </div>

                                        {/* 소셜 연동 */}
                                        <div className="flex items-center gap-2">
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
                                </div>
                            </Card>

                            <Card className="p-4 space-y-4">
                                <h2 className="text-lg font-semibold mb-2 pt-3">Notification Settings</h2>

                                <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                    {items.map((item) => {
                                        const isOn = settings[item.key];
                                        return (
                                            <div
                                                key={item.key}
                                                className="flex items-center justify-between py-3"
                                            >
                                                <div className="pr-2">
                                                    <div className="mb-1 text-base font-medium">{item.title}</div>
                                                    <p className="text-sm text-neutral-500">{item.desc}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggle(item.key)}
                                                    className={`w-16 rounded px-3 py-1.5 text-sm font-medium transition-colors
                                                          border
                                                          ${isOn
                                                        ? "border-gray-700 text-gray-700 dark:text-neutral-400 dark:border-neutral-400 " +
                                                        "dark:bg-neutral-900 hover:bg-gray-100 dark:hover:neutral-800"
                                                        : "border-red-500 text-red-500 hover:bg-red-500/10"
                                                    }`}
                                                >
                                                    {isOn ? "ON" : "OFF"}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
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
                                        onClick={onClickRemove}
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
                            <Card className="flex-1 flex flex-col">
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

                                <form id="introduceForm" onSubmit={handleSubmitIntroduce} className="flex flex-col gap-3 h-full">
                                    {activeMdTab === "write" ? (
                                        <textarea
                                            name="introduce"
                                            value={form.introduce ?? ""}
                                            onChange={handleChange}
                                            onInput={handleInput}
                                            className="flex-1 rounded-md border border-neutral-300 bg-white p-4 text-neutral-800 outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"

                                            placeholder={`마크다운 형식으로 자기소개 작성\n예) ![Java](https://img.shields.io/badge/Java-ED8B00?logo=openjdk&logoColor=white)\n\n저는 Spring Boot와 React를 좋아합니다!`}
                                        />
                                    ) : (
                                        <div className="markdown flex-1 rounded-md border border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900/60">
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
                                    <div className="flex items-center justify-end text-xs text-neutral-500">
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
            </div>

        </section>
    );
}

function Card({children, className}) {
    return (
        <div className={className}>
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
        "bg-neutral-100 shadow-sm hover:bg-neutral-300 active:bg-neutral-800 " +
        "dark:bg-neutral-900 dark:text-white dark:hover:neutral-800";

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
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/120px-Google_%22G%22_logo.svg.png"
                     alt="googe" className="w-4 h-4"/>
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