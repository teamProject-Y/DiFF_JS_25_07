'use client';

import {useState, useCallback, useEffect, useRef, useMemo} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {getGithubRepos} from '@/lib/RepositoryAPI';

export function AddRepoModal({
                                 open,
                                 onClose,
                                 onImport,
                                 onCreate,
                                 isGithubLinked = false,
                                 onLinkGithub,
                             }) {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [visOpen, setVisOpen] = useState(false);
    const [visibility, setVisibility] = useState('Public');
    const [err, setErr] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [touchedName, setTouchedName] = useState(false);

    // 외부 클릭 감지용
    const visBtnRef = useRef(null);
    const visMenuRef = useRef(null);

    // input 검증용
    const nameInvalid = touchedName && !name.trim();

    // github repo용
    const [ghList, setGhList] = useState([]);
    const [ghLoading, setGhLoading] = useState(false);
    const [ghErr, setGhErr] = useState('');
    const [ghQuery, setGhQuery] = useState('');
    const [ghSelectedId, setGhSelectedId] = useState(null);

    const resetAll = useCallback(() => {
        setName('');
        setDesc('');
        setVisibility('Public');
        setTouchedName(false);
        setErr('');
        setSubmitting(false);
        setVisOpen(false);

        setGhLoading(false);
        setGhErr('');
        setGhQuery('');
        setGhSelectedId(null);
    }, []);

    useEffect(() => {
        if (!open) resetAll();
    }, [open, resetAll]);

    useEffect(() => {
        if (!visOpen) return;
        const handleDown = (e) => {
            const inBtn = visBtnRef.current?.contains(e.target);
            const inMenu = visMenuRef.current?.contains(e.target);
            if (!inBtn && !inMenu) setVisOpen(false);
        };
        document.addEventListener('mousedown', handleDown);
        return () => document.removeEventListener('mousedown', handleDown);
    }, [visOpen]);

    const normalizeGhRepos = (raw = []) =>
        raw.map((r) => ({
            id: String(r.id ?? r.githubId ?? r.repoId ?? r.name ?? Math.random()),
            name: r?.name ?? r?.full_name?.split('/')?.pop() ?? 'Unknown',
            aPrivate: Boolean(r?.private ?? r?.aprivate ?? r?.aPrivate),
            url: r?.html_url ?? r?.url ?? null,
            default_branch: r?.default_branch ?? r?.defaultBranch ?? null,
            githubName: r?.githubName ?? null,
            githubOwner: r?.githubOwner ?? null,
        }));

    useEffect(() => {
        if (!open) return;
        if (!isGithubLinked) {
            setGhList([]);
            setGhSelectedId(null);
            setGhQuery('');
            setGhErr('');
            setGhLoading(false);
        }
    }, [open, isGithubLinked]);

    useEffect(() => {
        if (!open || !isGithubLinked) return;
        setGhErr('');
        setGhLoading(true);
        (async () => {
            try {
                const json = await getGithubRepos();
                if (json?.resultCode && String(json.resultCode).startsWith('F')) {
                    throw new Error(json?.msg || 'github repository get failed');
                }

                const list = Array.isArray(json?.data)
                    ? json.data
                    : Array.isArray(json?.data1)
                        ? json.data1
                        : [];

                const normalized = normalizeGhRepos(list);
                setGhList(normalized);

            } catch (e) {
                setGhErr(e?.message || 'request failed');
            } finally {
                setGhLoading(false);
            }
        })();
    }, [open, isGithubLinked]);

    const filteredGh = useMemo(() => {
        const q = ghQuery.trim().toLowerCase();
        if (!q) return ghList;
        return ghList.filter((r) => {
            const n = (r?.githubName || r?.name || 'Unknown').toLowerCase();
            return n.includes(q);
        });
    }, [ghList, ghQuery]);

    const submitCreate = async (e) => {
        e?.preventDefault();
        setTouchedName(true);

        if (!name.trim()) {
            return;
        }
        setErr('');
        setSubmitting(true);
        try {
            const res = await onCreate?.({
                name: name.trim(),
                description: desc.trim(),
                visibility,
            });
            if (res?.ok) {
                onClose();
                setName('');
                setDesc('');
                setVisibility('Public');
                setTouchedName(false);
            } else {
                setErr(res?.msg || 'add failed');
            }
        } catch (e) {
            setErr(e?.message || 'request failed');
        } finally {
            setSubmitting(false);
        }
    };

    const submitImportRepo = async () => {
        const repo = filteredGh.find((r) => String(r.id) === String(ghSelectedId));

        if (!repo) {
            setGhErr('choose your repository.');
            return;
        }
        setGhErr('');
        setSubmitting(true);

        try {
            const payload = {
                githubId: String(repo.id),
                name: repo?.name || repo?.full_name || '',
                url: repo?.url || '',
                defaultBranch: repo?.default_branch || '',
                aPrivate: !!repo?.aPrivate,
                githubName: repo?.githubName || '',
                githubOwner: repo?.githubOwner || '',
            };

            const res = await onImport?.(payload);
            if (res?.ok) {
                onClose();
                setGhSelectedId(null);
                setGhQuery('');
            } else {
                setGhErr(res?.msg || 'Failed fetching repositories');
            }
        } catch (e) {
            setGhErr(e?.message || 'Failed requesting repositories');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (touchedName && name.trim()) setErr('');
    }, [name, touchedName]);

    const handleLinkGithub = useCallback(() => {
        if (typeof onLinkGithub === 'function') onLinkGithub();
        else window.location.href = '/api/DiFF/auth/link/github?mode=link';
    }, [onLinkGithub]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="add-repo-choice"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    className="fixed inset-0 flex items-center justify-center bg-neutral-950/50"
                    style={{zIndex: 200}}
                    onClick={onClose}
                    aria-modal="true"
                    role="dialog">
                    <motion.div
                        initial={{y: 12, opacity: 0, scale: 0.98}}
                        animate={{y: 0, opacity: 1, scale: 1}}
                        exit={{y: 12, opacity: 0, scale: 0.98}}
                        transition={{type: 'spring', stiffness: 240, damping: 22}}
                        className="w-[min(60vw)] h-[min(80vh)] rounded-xl
                                 bg-white p-6 shadow-xl relative overflow-hidden flex flex-col
                                 border border-neutral-200 dark:bg-neutral-950 dark:border-neutral-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1 rounded-full
                                   text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900
                                   dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                            type="button">
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>

                        <h2 className="text-2xl font-bold m-2 pb-4 text-neutral-900 dark:text-neutral-100">
                            Add Repository
                        </h2>

                        <div className="flex-1 min-h-0 flex gap-4">
                            <form
                                onSubmit={submitCreate}
                                className="w-[45%] bg-white rounded-lg border p-4 flex flex-col mr-2
                                            border-neutral-200 dark:bg-neutral-950/60 dark:border-neutral-800">
                                <p className="text-lg font-bold mb-3 text-neutral-900 dark:text-neutral-100">
                                    Create directly here
                                </p>

                                <div className="mt-3">
                                    <label
                                        className="block font-medium mb-1 px-2 text-neutral-700 dark:text-neutral-300">
                                        Repository Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onBlur={() => setTouchedName(true)}
                                        placeholder=" "
                                        aria-invalid={nameInvalid}
                                        aria-describedby={nameInvalid ? 'name-error' : undefined}
                                        className={`w-full rounded-lg px-3 py-2 border border-neutral-300
                                                    text-neutral-900 placeholder-neutral-400
                                                    focus:outline-none focus:ring-1 focus:ring-neutral-900
                                                    dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-100 dark:placeholder-neutral-500
                                                    ${nameInvalid ? 'border-red-500 focus:ring-red-500 dark:focus:ring-red-400' : ''}`} />
                                    <p id="name-error"
                                       className={`mt-1 text-xs pl-2 ${nameInvalid ? 'text-red-500' : 'text-transparent'}`}>
                                        Please enter repository name
                                    </p>
                                </div>

                                <div className="mt-2 mb-5">
                                    <label
                                        className="block font-medium mb-1 px-2 text-neutral-700 dark:text-neutral-300">
                                        Visibility *
                                    </label>
                                    <div className="relative">
                                        <button
                                            ref={visBtnRef}
                                            type="button"
                                            aria-haspopup="listbox"
                                            aria-expanded={visOpen}
                                            onClick={() => setVisOpen((v) => !v)}
                                            className="border w-full rounded-lg font-medium px-4 py-2 inline-flex items-center justify-between
                                                       border-neutral-300 hover:bg-neutral-100 focus:bg-neutral-100
                                                       dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-100
                                                       dark:hover:bg-neutral-800 dark:focus:bg-neutral-800">
                                            {visibility}
                                            <svg
                                                className="w-2.5 h-2.5 ms-3"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 10 6">
                                                <path
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="m1 1 4 4 4-4" />
                                            </svg>
                                        </button>

                                        {visOpen && (
                                            <div
                                                ref={visMenuRef}
                                                className="absolute z-30 mt-1 right-0 top-full left-0 w-full
                                                             rounded-lg border shadow-md
                                                             bg-white border-neutral-200 divide-y divide-neutral-100
                                                             dark:bg-neutral-900 dark:border-neutral-800 dark:divide-neutral-800"
                                                role="listbox"
                                                tabIndex={-1}>
                                                <ul className="py-1 font-medium w-full text-neutral-700 dark:text-neutral-200">
                                                    {['Public', 'Private'].map((opt) => (
                                                        <li
                                                            key={opt}
                                                            role="option"
                                                            aria-selected={visibility === opt}
                                                            onClick={() => {
                                                                setVisibility(opt);
                                                                setVisOpen(false);
                                                            }}
                                                            className="cursor-pointer px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 w-full">
                                                            {opt}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="my-2">
                                    <label
                                        className="block font-medium mb-1 px-2 text-neutral-700 dark:text-neutral-300">
                                        Description
                                    </label>
                                    <textarea
                                        value={desc}
                                        onChange={(e) => setDesc(e.target.value)}
                                        placeholder=" "
                                        rows={5}
                                        className="w-full border rounded-lg px-3 py-2 resize-none focus:ring-1
                                                   border-neutral-300 text-neutral-900 focus:ring-neutral-900
                                                   dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-100 dark:focus:ring-neutral-100" />
                                </div>

                                {err && <p className="text-red-500 text-sm">{err}</p>}
                                <div className="flex-grow"></div>

                                <div className="mt-auto pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting || !name.trim()}
                                        className="w-full px-4 py-2 rounded-lg bg-neutral-900 text-white disabled:opacity-60 hover:bg-neutral-800
                                                   dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200">
                                        {submitting ? 'Creating…' : 'Create Repository'}
                                    </button>
                                </div>
                            </form>

                            <div className="w-[55%] bg-white rounded-lg border p-4
                            border-neutral-200 dark:bg-neutral-950/60 dark:border-neutral-800">
                                <div className="flex flex-col h-full">
                                    <p className="text-lg font-bold mb-6 text-neutral-900 dark:text-neutral-100">
                                        Import from GitHub
                                    </p>

                                    {!isGithubLinked ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center rounded-lg
                                                        border-2 border-dashed p-8 border-neutral-300 dark:border-neutral-700">
                                            <h4 className="text-base font-semibold mb-1 text-neutral-900 dark:text-neutral-100">
                                                Connect GitHub
                                            </h4>
                                            <p className="text-sm text-neutral-500 mb-5 dark:text-neutral-400">
                                                Link your GitHub account to import repositories.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={handleLinkGithub}
                                                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-1 text-sm font-medium text-white hover:bg-neutral-800
                                                            dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200">
                                                <i className="fa-brands fa-github text-2xl"/>
                                                Link GitHub
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                value={ghQuery}
                                                onChange={(e) => setGhQuery(e.target.value)}
                                                placeholder="Search repository"
                                                className="w-full border rounded-lg px-3 py-2 my-5
                                                         border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:ring-1 focus:ring-neutral-900
                                                         dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-neutral-100" />

                                            <div
                                                className="flex-1 min-h-0 border rounded-lg overflow-y-auto p-2 mb-8
                                                        border-neutral-300 dark:border-neutral-700"
                                                style={{scrollbarGutter: 'stable', maxHeight: 360}}>
                                                {ghLoading &&
                                                    <p className="text-sm text-neutral-500 px-1 py-2">Loading...</p>}
                                                {ghErr && <p className="text-sm text-red-500 px-1 py-2">{ghErr}</p>}
                                                {!ghLoading && !ghErr && filteredGh.length === 0 && (
                                                    <p className="text-sm text-neutral-500 px-1 py-2">No repositories
                                                        found.</p>
                                                )}

                                                <ul className="space-y-1 mb-4">
                                                    {filteredGh.map((r) => {
                                                        const key = `ghid:${r.id}`;
                                                        const selectId = String(r.id);
                                                        const selected = String(ghSelectedId) === selectId;

                                                        const repoName = r?.name || '(no-name)';
                                                        const owner = r.owner || '';
                                                        const isPrivate = !!r?.private;

                                                        return (
                                                            <li
                                                                key={key}
                                                                onClick={() =>
                                                                    setGhSelectedId((prev) => (prev === selectId ? null : selectId))
                                                                }
                                                                className={`flex items-center justify-between gap-3 cursor-pointer rounded-md px-3 py-2 border ${
                                                                    selected
                                                                        ? 'bg-neutral-100 border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700'
                                                                        : 'hover:bg-neutral-50 border-transparent dark:hover:bg-neutral-800'
                                                                }`}
                                                                title={repoName}>
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <span
                                                                        className={`inline-block w-3 h-3 rounded-full border ${
                                                                            selected
                                                                                ? 'bg-neutral-900 border-neutral-900 dark:bg-neutral-100 dark:border-neutral-100'
                                                                                : 'bg-white border-neutral-400 dark:bg-neutral-900 dark:border-neutral-600'
                                                                        }`} />
                                                                    <div className="min-w-0">
                                                                        <div className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                                                                            {repoName}
                                                                        </div>
                                                                        {owner && (
                                                                            <div className="text-xs text-neutral-400 truncate">@{owner}</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <span className={`text-xs px-2 py-0.5 rounded-lg border ${
                                                                        isPrivate
                                                                            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
                                                                            : 'border-neutral-200 bg-neutral-100 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                                                                    }`} >
                                                                    {isPrivate ? 'Private' : 'Public'}
                                                                </span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={submitImportRepo}
                                                disabled={submitting || !ghSelectedId}
                                                className="mt-auto w-full px-4 py-2 rounded-lg bg-neutral-900 text-white disabled:opacity-60 hover:bg-neutral-800
                                                           dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200">
                                                {submitting ? 'Importing…' : 'Import Selected'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
