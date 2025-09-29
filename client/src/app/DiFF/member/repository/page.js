'use client';

import {useRouter, useSearchParams, usePathname} from 'next/navigation';
import {fetchUser} from "@/lib/UserAPI";
import {useEffect, useMemo, useState, useCallback} from "react";
import {LayoutGroup} from "framer-motion";
import {createRepository, importGithubRepo} from "@/lib/RepositoryAPI"

import RepoPost from "./repoPost";
import {AddRepoModal} from './addRepoModal';
import {RepoInfo} from './repoInfo';
import Link from "next/link";

const getAccessToken = () =>
    (typeof window !== 'undefined' &&
        (localStorage.getItem('accessToken') || localStorage.getItem('access_token'))) || '';

const genId = (r) =>
    String(
        r?.id ??
        r?.url ??
        r?.name ??
        (typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2))
    );

const normalizeRepos = (raw) =>
    (raw || []).map((r) => {
        const name = r?.name ?? r?.full_name ?? '';
        const url = r?.url ?? '';
        return {
            id: genId(r),
            name,
            url,
            defaultBranch: r?.defaultBranch ?? r?.default_branch ?? '',
            aprivate: !!(r?.aprivate ?? r?.aPrivate),
            regDate: r?.regDate
                ? new Date(r.regDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                })
                : null,
            updateDate: r?.updateDate
                ? new Date(r.updateDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                })
                : null,
            githubName: r?.githubName ?? null,
            githubOwner: r?.githubOwner ?? null,
        };
    });

export default function RepositoriesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [repositories, setRepositories] = useState([]);
    const [member, setMember] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRepoId, setSelectedRepoId] = useState(null);
    const [isMyRepos, setIsMyRepos] = useState(false);
    const [openChoice, setOpenChoice] = useState(false);
    const [linked, setLinked] = useState({github: false});

    const openModal = useCallback(() => setOpenChoice(true), []);
    const closeModal = useCallback(() => setOpenChoice(false), []);

    const [tab, setTab] = useState('posts');

    const visibleRepos = useMemo(
        () => (isMyRepos ? repositories : repositories.filter(r => !r.aprivate)),
        [repositories, isMyRepos]
    );

    useEffect(() => {
        if (visibleRepos.length === 0) {
            setSelectedRepoId(null);
            return;
        }
        if (!selectedRepoId || !visibleRepos.some(r => r.id === selectedRepoId)) {
            setSelectedRepoId(visibleRepos[0].id);
        }
    }, [visibleRepos, selectedRepoId]);

    useEffect(() => {
        const accessToken = getAccessToken();
        if (!accessToken) {
            router.replace('/DiFF/member/login');
            return;
        }

        const nickName = searchParams.get('nickName');
        const myNickName = typeof window !== 'undefined' && localStorage.getItem('nickName');
      
        setIsMyRepos(!nickName || nickName === myNickName);

        fetchUser(nickName)
            .then((res) => {
                setRepositories(normalizeRepos(res?.repositories || []));
                setLoading(false);
                setMember(res.member);
            })
            .catch(() => {
                setLoading(false);
                router.replace('/DiFF/home/main');
            });

        const base = "https://api.diff.io.kr/api/DiFF";
      
        fetch(`${base}/auth/linked`, {
            headers: {Authorization: `Bearer ${accessToken}`},
            credentials: 'include',
        })
            .then(res => (res.ok ? res.json() : Promise.reject(res)))
            .then(data => setLinked({google: !!data.google, github: !!data.github}))
            .catch(() => {
            });
    }, [router, searchParams]);

    const selectedRepo = useMemo(
        () => visibleRepos.find((r) => r.id === selectedRepoId) || null,
        [visibleRepos, selectedRepoId]
    );
  
    useEffect(() => {
        if (selectedRepo) setTab('posts');
    }, [selectedRepo?.id]);

    const onClose = useCallback(() => setSelectedRepoId(null), []);

    useEffect(() => {
        if (!openChoice) return;
        const onKey = (e) => e.key === 'Escape' && closeModal();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [openChoice, closeModal]);

    const handleCreate = async ({name, description, visibility}) => {

        const repoName = (name ?? '').trim();
        const aPrivate = visibility === 'Private';
        if (!repoName) {

            setError('Pleas enter the repository name.');
            return {ok: false, msg: 'Pleas enter the repository name.'};
        }
        setLoading(true);

        setError('');
        try {
            const payload = {
                name: repoName,
                description: (description ?? '').trim(),
                aPrivate: aPrivate,
                aprivate: aPrivate,
            };

            const res = await createRepository(payload);

            if (res?.resultCode?.startsWith('S-')) {
                const newRepo = {
                    id: res.data,
                    name: repoName,
                    url: '',
                    defaultBranch: '',
                    aprivate: aPrivate,
                };
                setRepositories((prev) => [...prev, newRepo]);
                setSelectedRepoId(newRepo.id);
                return {ok: true};
            } else {
                const msg = res?.msg || 'Failed to add repository.';
                setError(msg);
                return {ok: false, msg};
            }
        } catch (err) {
            const msg = err?.response?.data?.msg || 'Failed to request.';
            setError(msg);
            return {ok: false, msg};
        } finally {
            setLoading(false);
        }
    };

    const handleDeleted = useCallback((deletedId) => {
        setRepositories(prev => prev.filter(r => String(r.id) !== String(deletedId)));
        setSelectedRepoId(prev => (String(prev) === String(deletedId) ? null : prev));
    }, []);

    const handleImportRepo = async (payload) => {

        try {
            const res = await importGithubRepo(payload);
            if (res?.resultCode?.startsWith('S-')) {
                const newRepo = {
                    id: res.data,
                    name: payload?.name || payload?.full_name || '',
                    url: payload?.url || '',
                    defaultBranch: payload?.default_branch || '',
                    aprivate: !!payload?.private,
                    githubName: payload?.githubName || 'no',
                    githubOwner: payload?.githubOwner || '없어',
                };

                setRepositories((prev) => {
                    if (prev.some((p) => p.id === newRepo.id || p.name === newRepo.name)) return prev;
                    return [...prev, newRepo];
                });

                setSelectedRepoId(newRepo.id);
                return {ok: true};
            }
            return {ok: false, msg: res?.msg || '가져오기 실패'};
        } catch (e) {
            return {ok: false, msg: e?.response?.data?.msg || e?.message || '가져오기 실패'};
        }
    };

   if (loading) return  <div aria-label="Loading..." role="status" className="loader">
        <svg className="icon" viewBox="0 0 256 256">
            <line x1="128" y1="32" x2="128" y2="64" strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="24"></line>
            <line x1="195.9" y1="60.1" x2="173.3" y2="82.7" strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="24"></line>
            <line x1="224" y1="128" x2="192" y2="128" strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="24"></line>
            <line x1="195.9" y1="195.9" x2="173.3" y2="173.3" strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="24"></line>
            <line x1="128" y1="224" x2="128" y2="192" strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="24"></line>
            <line x1="60.1" y1="195.9" x2="82.7" y2="173.3" strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="24"></line>
            <line x1="32" y1="128" x2="64" y2="128" strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="24"></line>
            <line x1="60.1" y1="60.1" x2="82.7" y2="82.7" strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth="24"></line>
        </svg>
        <span className="loading-text">Loading...</span>
    </div>;

    const profileHref =
        isMyRepos ? '/DiFF/member/profile'
            : `/DiFF/member/profile?nickName=${encodeURIComponent(member?.nickName ?? '')}`;

    const repoHref =
        isMyRepos ? '/DiFF/member/repository'
            : `/DiFF/member/repository?nickName=${encodeURIComponent(member?.nickName ?? '')}`;

    const tabs = [
        { key: 'Profile',      label: 'Profile',      href: profileHref },
        { key: 'Repositories', label: 'Repositories', href: repoHref },
        { key: 'Settings',     label: 'Settings',     href: '/DiFF/member/settings', visible: isMyRepos },
    ].filter(t => t.visible !== false);

    const isActive = (t) => {
        const base = (t.href || '').split('?')[0];
        if (!base) return false;
        return pathname === base || pathname.startsWith(base + (base.endsWith('/') ? '' : '/'));
    };

    const startLink = (provider) => {
        if (provider !== 'github') return;
        const link = `/api/DiFF/auth/link/${provider}?mode=link`;
        window.location.href = link;
    };

    return (
        <LayoutGroup>
            <section className="px-4 dark:text-neutral-300">
                <div className="mx-auto max-w-6xl h-full">

                    {/* Tabs */}
                    <div className="flex items-center border-b dark:border-neutral-700">
                        {tabs.map(t => (
                            <TopTabLink
                                key={t.key}
                                href={t.href}
                                label={t.label}
                                active={isActive(t)}
                            />
                        ))}
                    </div>

                    <div className="h-px w-full bg-neutral-200 dark:bg-neutral-700 mb-10"/>

                    {error && <p className="mb-3 text-sm text-red-500">에러: {error}</p>}

                    <div className="relative">
                        {/* 탭 */}
                        {visibleRepos.length !== 0 && (
                        <div className="absolute -top-9 left-[230px] flex">
                            {[
                                {key: 'posts', label: 'Posts'},
                                {key: 'info', label: 'Info'},
                            ].map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    className={`px-4 py-2 text-sm border-t border-r border-l rounded-t-xl transition dark:border-neutral-700
                                        ${tab === t.key ?
                                        '-mb-px z-50 bg-gray-50 text-gray-900 dark:bg-neutral-800 dark:text-neutral-300'
                                        : 'bg-gray-200 text-gray-400 dark:bg-neutral-600 dark:text-neutral-300' +
                                        'dark:bg-neutral-800 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-700'}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        )}

                        <div className="grid grid-cols-[230px_1fr] items-start">

                        {/* 왼쪽 사이드바 */}
                            <aside
                                className="h-[calc(100vh-220px)] overflow-y-auto rounded-l-lg border-t border-l border-b
                                bg-gray-100 dark:bg-neutral-800/50 dark:border-neutral-700">
                                <ul className="p-4 space-y-2">
                                    {isMyRepos &&
                                        <li onClick={openModal}
                                            className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer
                                            hover:bg-gray-200 text-gray-700 dark:hover:bg-neutral-800/50 dark:text-neutral-400">
                                            <i className="fa-solid fa-folder-plus text-neutral-400"/>
                                            <span className="truncate">add repository</span>
                                        </li>
                                    }
                                    {visibleRepos.map((r) => {
                                        const sel = r.id === selectedRepoId;
                                        return (
                                            <li
                                                key={r.id}
                                                onClick={() => setSelectedRepoId(r.id)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer 
                                                ${sel ? 'bg-gray-200 text-gray-900 dark:bg-neutral-800/80 dark:text-neutral-300'
                                                    : 'hover:bg-gray-200 text-gray-700 dark:hover:bg-neutral-800/50 dark:text-neutral-400'}`}
                                                title={r.name}
                                            >
                                                <i className={`fa-solid ${sel ? 'fa-folder-open text-blue-400'
                                                    : 'fa-folder text-blue-300/60'}`}/>

                                                <span className="truncate">{r.name}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </aside>

                            {/* 메인 컨텐츠 */}
                            <div
                                className="relative border rounded-r-lg h-[calc(100vh-220px)] overflow-hidden
                                 bg-gray-50 border-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700">

                                {/* 리포 없을 때 */}
                                {visibleRepos.length === 0 ? (
                                    <div className="absolute inset-0 flex items-center justify-center p-8">
                                        <div
                                            className="relative w-full max-w-lg rounded-2xl border-2 border-dashed p-12 text-center shadow-sm transition-all
                                            border-gray-200 bg-white dark:bg-neutral-900 dark:border-neutral-700">
                                            <div
                                                className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full
                                                bg-blue-200/50">
                                                <i className="fa-regular fa-folder-open text-3xl text-blue-500 dark:text-blue-300"/>
                                            </div>

                                            <h3 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-neutral-300">
                                                No repositories yet
                                            </h3>

                                            {isMyRepos ? (
                                                <>
                                                    <p className="mt-2 text-sm text-gray-500 dark:text-neutral-500">
                                                        Create a new repository or import one from GitHub to get
                                                        started.
                                                    </p>

                                                    <div className="mt-6 flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={openModal}
                                                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50"
                                                        >
                                                            <i className="fa-solid fa-plus"/>
                                                            Create / Import Repository
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="mt-6 text-sm text-gray-400">
                                                    No repositories available.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                ) : (
                                    <>
                                        {tab === 'info' && selectedRepo ? (
                                            <RepoInfo
                                                key={`detail-${selectedRepoId ?? 'none'}`}
                                                repo={selectedRepo}
                                                isMyRepo={isMyRepos}
                                                onChangeRepo={(id) => setSelectedRepoId(String(id))}
                                                onClose={onClose}
                                                useExternalSidebar={true}
                                                onRenamed={(id, newName) => {

                                                    setRepositories((prev) =>
                                                        prev.map((r) => (r.id === id ? { ...r, name: newName } : r))
                                                    );
                                                }}
                                                onDeleted={handleDeleted}
                                            />
                                        ) : null}

                                        {tab === 'posts' && selectedRepo ? (
                                            <RepoPost
                                                key={`posts-${selectedRepoId ?? 'none'}`}
                                                repoId={selectedRepo.id}
                                                repoName={selectedRepo.name}
                                                isMyRepo={isMyRepos}
                                            />
                                        ) : null}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {isMyRepos && (
                <AddRepoModal
                    open={openChoice}
                    onClose={closeModal}
                    isGithubLinked={linked.github}
                    onLinkGithub={() => startLink('github')}
                    onCreate={handleCreate}
                    onImport={handleImportRepo}
                />
            )}
        </LayoutGroup>
    );
}

function TopTabLink({ href, label, active }) {
    return (
        <Link
            href={href}
            className={`group relative grid items-end p-4 pb-4 ml-2 -mb-px whitespace-nowrap duration-100
                ${active
                ? "border-b-2 border-black dark:border-neutral-400"
                : "hover:border-b-2 hover:border-gray-500 dark:hover:border-neutral-400"}`}
        >
            {/* 숨은 복제 텍스트: 폰트 굵기 전환 부드럽게 */}
            <span
                aria-hidden
                className="col-start-1 row-start-1 font-semibold h-0 overflow-hidden pointer-events-none select-none duration-100"
            >
                {label}
            </span>

            {/* 실제 라벨 */}
            <span
                className={`col-start-1 row-start-1 leading-none transition-[font-weight,color] duration-100
                    ${active
                    ? "font-semibold"
                    : "text-gray-500 dark:text-neutral-600 group-hover:text-gray-700 dark:group-hover:text-gray-300 duration-100"}`}
            >
                {label}
            </span>
        </Link>
    );
}