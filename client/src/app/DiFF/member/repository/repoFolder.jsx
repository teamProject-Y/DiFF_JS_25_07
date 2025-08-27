'use client';

import {useState, useCallback, useEffect, useRef} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {createRepository} from "@/lib/ArticleAPI";

export default function RepoFolder({repositories, onSelect, onFetchRepos, onCreateRepo}) {
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

    const handleImport = useCallback(() => {
        closeModal();
        onFetchRepos?.();
    }, [closeModal, onFetchRepos]);

    const handleCreate = async () => {
        if (!name.trim()) {
            setError("레포지토리 이름을 입력하세요.");
            return;
        }
        setLoading(true);
        setError("");

        try {
            const res = await createRepository({name});
            if (res?.resultCode?.startsWith("S-")) {
                alert(res.msg);
                setOpen(false);
                setRepoName("");

                // 새 레포 직접 state에 추가
                const newRepo = {
                    id: res.data, // 서버에서 newRepoId 내려줌
                    name,
                    url: "",
                    defaultBranch: "",
                    aprivate: false,
                };
                setRepositories((prev) => [...prev, newRepo]);
            } else {
                setError(res?.msg || "생성 실패");
            }
        } catch (err) {
            setError(err?.response?.data?.msg || "요청 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            key="grid"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="w-full p-8 grid gap-8 grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] auto-rows-auto content-start"
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
                onImport={handleImport}
                onCreate={handleCreate}
            />
        </motion.div>
    );
}

function AddRepoChoiceModal({open, onClose, onImport, onCreate}) {
    // 폼 상태
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [visOpen, setVisOpen] = useState(false);
    const [visibility, setVisibility] = useState('Public'); // 'Public' | 'Private'
    const [err, setErr] = useState('');

    // 외부 클릭 감지용 ref
    const visBtnRef = useRef(null);
    const visMenuRef = useRef(null);

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

    const submitCreate = (e) => {
        e?.preventDefault();
        if (!name.trim()) {
            setErr('레포지토리 이름을 입력하세요.');
            return;
        }
        setErr('');
        onCreate?.({name: name.trim(), description: desc.trim(), visibility});
    };

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

                        <div className="flex justify-around text-xl font-bold mb-4">
                            <div>Create directly here</div>
                            <div>Import from GitHub</div>
                        </div>
                        <div className="flex-1 min-h-0 flex gap-4">
                            <form onSubmit={submitCreate} className="w-1/2 border-r pr-4 mb-4 flex flex-col">
                                <div className="my-2">
                                    <label className="block font-medium mb-1 px-2">Repository Name *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder=" "
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div className="my-4">
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
                                        rows={4}
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
                            <div className="w-1/2 pl-4 py-3">
                                <div className="rounded-lg border p-4">
                                    <h3 className="font-semibold mb-2">Import from GitHub</h3>
                                    <p className="text-sm text-neutral-600">
                                        깃허브 계정의 리포지토리를 불러와 연결합니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
