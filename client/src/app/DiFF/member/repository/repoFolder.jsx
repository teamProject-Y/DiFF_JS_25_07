'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import { getGithubRepos } from '@/lib/repositoryAPI';

export default function RepoFolder({repositories, onSelect, onFetchRepos, onCreateRepo, onImportRepo}) {
    const [openChoice, setOpenChoice] = useState(false);
    const openModal = useCallback(() => setOpenChoice(true), []);
    const closeModal = useCallback(() => setOpenChoice(false), []);

    // ESC 닫기
    useEffect(() => {
        if (!openChoice) return;
        const onKey = (e) => e.key === 'Escape' && closeModal();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [openChoice, closeModal]);

    return (
        <motion.div
            key="grid"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="w-full h-[520px] overflow-y-auto p-8 grid gap-8 grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] auto-rows-auto content-start"
        >
            <motion.div
                key="repo-plus"
                layoutId="repo-plus"
                className="cursor-pointer flex flex-col items-center justify-center"
                onClick={openModal}
                title="Add Repository"
            >
                <div className="relative w-[9rem] h-[9rem]">
                    <i className="fa-solid fa-folder-plus text-[9rem] text-neutral-200 hover:text-neutral-400
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></i>
                </div>
                <span className="font-bold text-lg">Add Repository</span>
            </motion.div>

            {repositories?.length > 0 ? (
                repositories.map((repo, idx) => (
                    <motion.div
                        key={repo.id}
                        layoutId={`repo-${repo.id}`}
                        className="flex flex-col items-center cursor-pointer"
                        onClick={() => onSelect(repo.id)}
                        title={repo.name}
                    >
                        <i className="fa-solid fa-folder text-[9rem] text-neutral-400 hover:text-neutral-500 transition"></i>
                        <h3 className="font-bold text-lg text-center">
                            {repo.name || `Repository ${idx + 1}`}
                        </h3>
                    </motion.div>
                ))
            ) : (
                <p>등록된 레포지토리가 없습니다.</p>
            )}

            {/* 선택 모달 */}
            <AddRepoChoiceModal
                open={openChoice}
                onClose={closeModal}
                onCreate={onCreateRepo}
                onImport={onImportRepo}
            />
        </motion.div>
    );
}

function AddRepoChoiceModal({open, onClose, onImport, onCreate}) {
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

    const getAccessToken = () =>
        (typeof window !== 'undefined' &&
            (localStorage.getItem('accessToken') || localStorage.getItem('access_token'))) || '';

    // 모달 열릴 때 깃허브 리포 불러오기
    useEffect(() => {
        if (!open) return;
        setGhErr('');
        setGhLoading(true);
        (async () => {
            try {
                const json = await getGithubRepos();
                if (json?.resultCode && String(json.resultCode).startsWith('F')) {
                    throw new Error(json?.msg || '깃허브 리포 불러오기 실패');
                }
                const list = Array.isArray(json?.data)
                    ? json.data
                    : Array.isArray(json?.data1)
                        ? json.data1
                        : [];
                setGhList(list);
            } catch (e) {
                setGhErr(e?.message || '요청 실패');
            } finally {
                setGhLoading(false);
            }
        })();
    }, [open]);

    const filteredGh = useMemo(() => {
        const q = ghQuery.trim().toLowerCase();
        if (!q) return ghList;
        return ghList.filter((r) => {
            const n = (r?.name || r?.full_name || '').toLowerCase();
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
                setErr(res?.msg || '생성 실패');
            }
        } catch (e) {
            setErr(e?.message || '요청 실패');
        } finally {
            setSubmitting(false);
        }
    };

    const submitImportRepo = async () => {
        const repo = filteredGh.find(r => String(r.id) === String(ghSelectedId));

        if (!repo) {
            setGhErr('가져올 리포지토리를 선택하세요.');
            return;
        }
        setGhErr('');
        setSubmitting(true);
        try {
            const res = await onImport?.(repo); // 부모가 importGithubRepo 호출
            if (res?.ok) {
                onClose();
                setGhSelectedId(null);
                setGhQuery('');
            } else {
                setGhErr(res?.msg || '가져오기 실패');
            }
        } catch (e) {
            setGhErr(e?.message || '요청 실패');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (touchedName && name.trim()) setErr('');
    }, [name, touchedName]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="add-repo-choice"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    className="fixed inset-0 flex items-center justify-center bg-black/40"
                    style={{zIndex: 200}}
                    onClick={onClose}
                    aria-modal="true"
                    role="dialog"
                >
                    <motion.div
                        initial={{y: 12, opacity: 0, scale: 0.98}}
                        animate={{y: 0, opacity: 1, scale: 1}}
                        exit={{y: 12, opacity: 0, scale: 0.98}}
                        transition={{type: 'spring', stiffness: 240, damping: 22}}
                        className="w-[min(900px,92vw)] h-[min(600px,88vh)] rounded-xl bg-white p-6 shadow-xl relative
                            overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1 rounded-full"
                            type="button"
                        >
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>

                        <h2 className="text-2xl font-bold m-2 pb-4">Add Repository</h2>

                        {/*<div className="flex justify-around text-lg text-gray-600 font-bold my-4">*/}
                        {/*    <div>Create directly here</div>*/}
                        {/*    <div>Import from GitHub</div>*/}
                        {/*</div>*/}
                        <div className="flex-1 min-h-0 flex gap-4">
                            <form onSubmit={submitCreate} className="w-[45%] rounded-lg border p-4 flex flex-col mr-2">
                                <p className="text-lg font-bold mb-3">Create directly here</p>
                                <div className="mt-3">
                                    <label className="block font-medium mb-1 px-2">Repository Name *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onBlur={() => setTouchedName(true)}
                                        placeholder=" "
                                        aria-invalid={nameInvalid}
                                        aria-describedby={nameInvalid ? 'name-error' : undefined}
                                        className={`w-full rounded-lg px-3 py-2 border
                                            ${nameInvalid
                                            ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400'
                                            : ''
                                        }`}
                                    />

                                        <p id="name-error" className={`mt-1 text-xs pl-3
                                        ${nameInvalid
                                            ? 'text-red-500'
                                            : 'text-white'
                                        }`}>
                                            리포지토리 이름을 입력하세요.
                                        </p>

                                </div>
                                <div className="mt-2 mb-5">
                                    <label className="block font-medium mb-1 px-2">Visibility *</label>
                                    <div className="relative">
                                        {/* 토글 버튼 */}
                                        <button
                                            ref={visBtnRef}
                                            type="button"
                                            aria-haspopup="listbox"
                                            aria-expanded={visOpen}
                                            onClick={() => setVisOpen(v => !v)}
                                            className="hover:bg-neutral-200 focus:bg-neutral-200 border w-full
                                                rounded-lg font-medium px-4 py-2 inline-flex items-center justify-between"
                                        >
                                            {visibility}
                                            <svg
                                                className="w-2.5 h-2.5 ms-3"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 10 6"
                                            >
                                                <path
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="m1 1 4 4 4-4"
                                                />
                                            </svg>
                                        </button>

                                        {visOpen && (
                                            <div
                                                ref={visMenuRef}
                                                className="absolute z-30 mt-1 right-0 top-full left-0 bg-white border divide-y
                                                divide-gray-100 rounded-lg shadow-md w-full dark:bg-gray-700"
                                                role="listbox"
                                                tabIndex={-1}
                                            >
                                                <ul className="py-1 font-medium text-gray-700 dark:text-gray-200 w-full">
                                                    {['Public', 'Private'].map(opt => (
                                                        <li
                                                            key={opt}
                                                            role="option"
                                                            aria-selected={visibility === opt}
                                                            onClick={() => {
                                                                setVisibility(opt);
                                                                setVisOpen(false);
                                                            }}
                                                            className="cursor-pointer px-4 py-2 hover:bg-gray-100 w-full
                                                                    dark:hover:bg-gray-600 dark:hover:text-white">
                                                            {opt}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="my-2">
                                    <label className="block font-medium mb-1 px-2">Description</label>
                                    <textarea
                                        value={desc}
                                        onChange={(e) => setDesc(e.target.value)}
                                        placeholder=" "
                                        rows={3}
                                        className="w-full border rounded-lg px-3 py-2 resize-none"
                                    />
                                </div>

                                {err && <p className="text-red-500 text-sm">{err}</p>}
                                <div className="flex-grow"></div>

                                <div className="mt-auto pt-2">
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300"
                                    >
                                        Create Repository
                                    </button>
                                </div>
                            </form>

                            {/* 오른쪽: 깃허브에서 가져오기 */}
                            <div className="w-[55%]">
                                <div className="rounded-lg border p-4 flex flex-col h-full">
                                    <p className="text-lg font-bold mb-6">Import from GitHub</p>

                                    <input
                                        type="text"
                                        value={ghQuery}
                                        onChange={(e) => setGhQuery(e.target.value)}
                                        placeholder="Search repository"
                                        className="w-full border rounded-lg px-3 py-2 mb-3"
                                    />

                                    <div
                                        className="flex-1 min-h-0 border rounded-lg overflow-y-auto p-2 mb-5"
                                        style={{ scrollbarGutter: 'stable', maxHeight: 360 }}
                                    >
                                        {ghLoading && <p className="text-sm text-neutral-500 px-1 py-2">Loading...</p>}
                                        {ghErr && <p className="text-sm text-red-500 px-1 py-2">{ghErr}</p>}
                                        {!ghLoading && !ghErr && filteredGh.length === 0 && (
                                            <p className="text-sm text-neutral-500 px-1 py-2">검색 결과가 없습니다.</p>
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
                                                        onClick={() => setGhSelectedId(selectId)}
                                                        className={`flex items-center justify-between gap-3 cursor-pointer rounded-md px-3 py-2 ${
                                                            selected ? 'bg-gray-100 border border-gray-300' : 'hover:bg-gray-50 border border-transparent'
                                                        }`}
                                                        title={repoName}
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <span className={`inline-block w-3 h-3 rounded-full border ${
                                                                selected ? 'bg-gray-800 border-gray-800' : 
                                                                    'bg-white border-gray-400'}`} />
                                                            <div className="min-w-0">
                                                                <div className="truncate font-medium">{repoName}</div>
                                                                {owner && <div className="text-xs text-neutral-400 truncate">@{owner}</div>}
                                                            </div>
                                                        </div>
                                                        <span className={`text-xs px-2 py-0.5 rounded-lg border text-gray-500${
                                                            isPrivate ? 'bg-rose-100 text-rose-700' : ''
                                                        }`}>
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
                                        className="mt-3 w-full px-4 py-2 rounded-lg bg-black text-white disabled:opacity-60"
                                    >
                                        {submitting ? 'Importing…' : 'Import Selected'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
