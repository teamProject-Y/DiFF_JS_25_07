'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import LanguageChart from "./languageChart";
import AnalysisHistoryChart from "./analysisHistoryChart.jsx";
import TotalAnalysisChart from "./totalAnalysisChart.jsx";
import {getAnalysisHistory, getLanguageDistribution, renameRepository} from "@/lib/RepositoryAPI";
import CommitList from "@/app/DiFF/member/repository/commitList";

export default function RepoInfo({
                                     repo,
                                     onClose,
                                     useExternalSidebar = false,
                                 }) {

    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(repo?.name ?? '');
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState("history");

    useEffect(() => {
        if (repo?.id) {
            getAnalysisHistory(repo.id).then(setHistory);
        }
    }, [repo?.id]);
    useEffect(() => {
        setNameInput(repo?.name ?? '');
    }, [repo?.name]);

    const onSaveName = async () => {
        try {
            const response = await renameRepository(repo.id, nameInput);
            console.log("res: ", response);
            setEditingName(false);
        } catch (e) {
            console.error(e);
            alert('이름 저장 중 오류가 발생했습니다.');
        }
    };

    function connectionUrl(url) {
        const res = connectRepository(url);
        console.log("connect repository res: ", res);
    }

    // 언어 비율 데이터
    const [languages, setLanguages] = useState([]);
    useEffect(() => {
        if (repo?.id) {
            getLanguageDistribution(repo.id)
                .then((data) => {
                    setLanguages(data);
                })
                .catch((err) => {
                    console.error("[RepoInfo] API error =", err);
                });
        }
    }, [repo?.id]);

    const visibility = repo?.aprivate ? 'private' : 'public';

    const nameRef = useRef(null);
    const enterEdit = () => {
        setEditingName(true);
        setTimeout(() => nameRef.current?.focus?.(), 0);
    };
    const cancelEdit = () => {
        setEditingName(false);
        setNameInput(repo?.name ?? '');
    };
    const onKeyDownName = (e) => {
        if (e.key === 'Enter') onSaveName();
        if (e.key === 'Escape') cancelEdit();
    };

    return (
        <motion.div
            key={`detail-${repo?.id ?? 'none'}`}
            // variants={container}
            initial="hidden"
            animate="show"
            exit="hidden"
            className={`absolute inset-0 p-4 overflow-y-auto`}
        >
            {/* 왼쪽 레일 */}
            {!useExternalSidebar && (
                <aside className="border-r bg-gray-50 p-4 overflow-y-scroll">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="w-full text-md text-gray-500 hover:text-gray-800"
                        >
                            <i className="fa-solid fa-angle-left"></i>
                        </button>
                    )}
                </aside>
            )}

            <div className="flex gap-3 h-full w-full overflow-y-scroll">
                <div className="max-w-[70%] min-w-[70%] flex flex-col">
                    <div className="flex-1 overflow-y-auto flex flex-col">

                        {/* ✅ 탭 버튼 */}
                        <div className="flex gap-2 mb-2">
                            <button
                                onClick={() => setActiveTab("history")}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    activeTab === "history"
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 dark:bg-neutral-700"
                                }`}
                            >
                                History
                            </button>
                            <button
                                onClick={() => setActiveTab("total")}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    activeTab === "total"
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 dark:bg-neutral-700"
                                }`}
                            >
                                Total
                            </button>
                        </div>

                        {/* ✅ 탭 내용 */}
                        <div className="h-[35%] rounded-xl border shadow-sm p-4 mb-3
                             bg-white border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-700">
                            {activeTab === "history" ? (
                                <AnalysisHistoryChart history={history} />
                            ) : (
                                <TotalAnalysisChart history={history} />
                            )}
                        </div>

                        {/* 하단 박스 */}
                        <div
                            className="flex-grow overflow-y-scroll rounded-xl border shadow-sm
                             bg-white border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-700">
                            {repo.url ?
                                <>
                                    <CommitList repo={repo}/>
                                </>
                                :
                                <>
                                    <div className="relative h-full w-full flex flex-col items-center justify-center p-6 text-center">

                                        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 mb-3">
                                            <i className="fa-brands fa-github text-3xl text-gray-600 dark:text-neutral-400" />
                                        </div>

                                        <div className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Connect a GitHub repository</div>
                                        <div className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                            Link your repo to enable analysis and commit history.
                                        </div>

                                        {/* URL 입력 + 연결 버튼 */}
                                        <form
                                            className="mt-4 w-full max-w-md flex items-center gap-2"
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                const url = e.currentTarget.repoUrl.value.trim();
                                                connectionUrl(url);
                                            }}
                                        >
                                            <div className="relative flex-1">
                                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                                                  <i className="fa-brands fa-github text-neutral-400" />
                                                </span>
                                                <input
                                                    type="url"
                                                    name="repoUrl"
                                                    placeholder="https://github.com/owner/repo"
                                                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                                                    required
                                                    pattern="https?://(www\.)?github\.com/[^/\s]+/[^/\s]+/?"
                                                    aria-label="GitHub Repository URL"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="px-3 py-2 rounded-lg bg-gray-100 dark:text-neutral-300 dark:bg-neutral-700 font-medium hover:opacity-60 transition"
                                            >
                                                Connect
                                            </button>
                                        </form>
                                    </div>
                                </>

                            }
                        </div>
                    </div>
                </div>

                <div className="w-[30%] flex flex-col gap-3">
                    <div className="rounded-xl border shadow-sm p-4
                     bg-white border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-700">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center min-w-0 flex-grow h-11">
                                {editingName ? (
                                    <>
                                        <input
                                            ref={nameRef}
                                            value={nameInput}
                                            onChange={(e) => setNameInput(e.target.value)}
                                            onKeyDown={onKeyDownName}
                                            className="flex-grow min-w-0 px-1 py-2 mr-2rounded-md border
                                            focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            placeholder="Repository name"
                                        />
                                        <button
                                            onClick={onSaveName}
                                            className="p-1"
                                            title="Save"
                                            aria-label="Save name"
                                        >
                                            <i className="fa-solid fa-check"></i>
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className=""
                                            title="Cancel"
                                            aria-label="Cancel edit"
                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xl font-semibold break-all pl-1">
                                            {repo?.name ?? 'Repository'}
                                        </p>
                                        <button
                                            onClick={enterEdit}
                                            className="pl-2 pb-1 text-xs text-neutral-300"
                                            title="Rename"
                                            aria-label="Rename repository"
                                        >
                                            <i className="fa-solid fa-pen"></i>
                                        </button>
                                    </>
                                )}
                            </div>

                        </div>

                        <div className="mt-2 flex w-full text-sm justify-between items-center">
                            <div className=""><i
                                className="fa-solid fa-calendar text-neutral-400"></i> {repo.regDate}</div>
                            <span className="ml-auto text-xs px-2 py-1 rounded-full border
                            bg-white border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-700">
                              {visibility}
                            </span>
                            {repo?.url && (
                                <a
                                    href={repo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={repo?.name}
                                    className="shrink-0"
                                >
                                    &nbsp;&nbsp;&nbsp;<i className="fa-brands fa-github text-2xl"></i>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* 통계 */}
                    <div className="rounded-xl border shadow-sm p-4
                    bg-white border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-700">
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-neutral-500 text-xs">Stars</div>
                                <div className="text-lg font-semibold mt-0.5">0</div>
                            </div>
                            <div>
                                <div className="text-neutral-500 text-xs">Forks</div>
                                <div className="text-lg font-semibold mt-0.5">0</div>
                            </div>
                            <div>
                                <div className="text-neutral-500 text-xs">Issues</div>
                                <div className="text-lg font-semibold mt-0.5">0</div>
                            </div>
                            <div>
                                <div className="text-neutral-500 text-xs">Watchers</div>
                                <div className="text-lg font-semibold mt-0.5">0</div>
                            </div>
                        </div>
                    </div>

                    {/* 언어 비율 */}
                    <div className="rounded-xl border flex-grow shadow-sm p-4 max-h-[45%]
                    bg-white border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-700">
                        <div className="font-semibold">Languages</div>
                            <LanguageChart languages={languages} />
                    </div>

                    <button className="w-full p-2 border rounded-xl transition-colors
                    shadow-sm text-red-500  hover:bg-red-500 hover:text-white
                        bg-white border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-700">
                        Delete Repository
                    </button>


                </div>

            </div>
        </motion.div>
    );
}