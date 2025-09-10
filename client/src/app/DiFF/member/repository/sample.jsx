import React, {useMemo, useState} from "react";
import LanguageChart from "@/app/DiFF/member/repository/languageChart";
import AnalysisHistoryChart from "@/app/DiFF/member/repository/analysisHistoryChart.jsx";
import TotalAnalysisChart from "@/app/DiFF/member/repository/totalAnalysisChart";
import AnalysisRecentChart from "@/app/DiFF/member/repository/analysisRecentChart";

// -------------------------------------------------------------
// META DATA (Info/Posts)
// -------------------------------------------------------------
const DATA = {
    repositories: [
        {
            id: "r1",
            name: "alpha-repo",
            htmlUrl: "https://github.com/teamProject-Y/DiFF",
            regDate: "2025-09-08T13:10:00Z",
            posts: [
                {
                    id: "a-1",
                    title: "Alpha Post 1",
                    hits: 120,
                    replies: 8,
                    reactions: 24,
                    isPublic: true,
                    analysis: true,
                    graph: {
                        gradeSecurity: "B",
                        vulnerabilities: 1,
                        gradeReliability: "B",
                        bugs: 2,
                        gradeMaintainability: "A",
                        codeSmells: 5,
                        gradeComplexity: "B",
                        complexity: 7,
                        gradeCoverage: "B",
                        coverage: 78,
                        duplicatedLinesDensity: 6
                    }
                },
                {
                    id: "a-2",
                    title: "Alpha Post 2",
                    hits: 98,
                    replies: 2,
                    reactions: 11,
                    isPublic: true,
                    analysis: false,
                    graph: null
                },
                {
                    id: "a-3",
                    title: "Alpha Post 3",
                    hits: 64,
                    replies: 1,
                    reactions: 3,
                    isPublic: false,
                    analysis: true,
                    graph: {
                        gradeSecurity: "A",
                        vulnerabilities: 0,
                        gradeReliability: "A",
                        bugs: 0,
                        gradeMaintainability: "B",
                        codeSmells: 8,
                        gradeComplexity: "C",
                        complexity: 12,
                        gradeCoverage: "B",
                        coverage: 72,
                        duplicatedLinesDensity: 9
                    }
                },
                {
                    id: "a-4",
                    title: "Alpha Post 4",
                    hits: 151,
                    replies: 6,
                    reactions: 19,
                    isPublic: true,
                    analysis: true,
                    graph: {
                        gradeSecurity: "C",
                        vulnerabilities: 3,
                        gradeReliability: "B",
                        bugs: 1,
                        gradeMaintainability: "B",
                        codeSmells: 10,
                        gradeComplexity: "B",
                        complexity: 9,
                        gradeCoverage: "C",
                        coverage: 61,
                        duplicatedLinesDensity: 13
                    }
                },
                {
                    id: "a-5",
                    title: "Alpha Post 5",
                    hits: 47,
                    replies: 0,
                    reactions: 2,
                    isPublic: false,
                    analysis: false,
                    graph: null
                },
                {
                    id: "a-6",
                    title: "Alpha Post 6",
                    hits: 210,
                    replies: 12,
                    reactions: 31,
                    isPublic: true,
                    analysis: true,
                    graph: {
                        gradeSecurity: "B",
                        vulnerabilities: 2,
                        gradeReliability: "C",
                        bugs: 4,
                        gradeMaintainability: "B",
                        codeSmells: 12,
                        gradeComplexity: "B",
                        complexity: 8,
                        gradeCoverage: "B",
                        coverage: 76,
                        duplicatedLinesDensity: 7
                    }
                },
                {
                    id: "a-7",
                    title: "Alpha Post 7",
                    hits: 33,
                    replies: 1,
                    reactions: 1,
                    isPublic: true,
                    analysis: false,
                    graph: null
                },
                {
                    id: "a-8",
                    title: "Alpha Post 8",
                    hits: 89,
                    replies: 3,
                    reactions: 6,
                    isPublic: true,
                    analysis: true,
                    graph: {
                        gradeSecurity: "A",
                        vulnerabilities: 0,
                        gradeReliability: "B",
                        bugs: 1,
                        gradeMaintainability: "A",
                        codeSmells: 4,
                        gradeComplexity: "B",
                        complexity: 6,
                        gradeCoverage: "A",
                        coverage: 90,
                        duplicatedLinesDensity: 4
                    }
                },
            ],
        },
        {
            id: "r2",
            name: "beta-repo",
            htmlUrl: "https://github.com/teamProject-Y/DiFF",
            regDate: "2025-09-08T13:10:00Z",
            posts: [
                // 3 posts
                {
                    id: "b-1",
                    title: "Beta Post 1",
                    hits: 40,
                    replies: 0,
                    reactions: 0,
                    isPublic: true,
                    analysis: false,
                    graph: null
                },
                {
                    id: "b-2",
                    title: "Beta Post 2",
                    hits: 71,
                    replies: 4,
                    reactions: 7,
                    isPublic: true,
                    analysis: true,
                    graph: {
                        gradeSecurity: "B",
                        vulnerabilities: 1,
                        gradeReliability: "B",
                        bugs: 1,
                        gradeMaintainability: "B",
                        codeSmells: 7,
                        gradeComplexity: "C",
                        complexity: 11,
                        gradeCoverage: "B",
                        coverage: 74,
                        duplicatedLinesDensity: 10
                    }
                },
                {
                    id: "b-3",
                    title: "Beta Post 3",
                    hits: 59,
                    replies: 2,
                    reactions: 3,
                    isPublic: false,
                    analysis: true,
                    graph: {
                        gradeSecurity: "C",
                        vulnerabilities: 2,
                        gradeReliability: "B",
                        bugs: 1,
                        gradeMaintainability: "C",
                        codeSmells: 14,
                        gradeComplexity: "C",
                        complexity: 13,
                        gradeCoverage: "C",
                        coverage: 60,
                        duplicatedLinesDensity: 15
                    }
                },
            ],
        },
        {id: "r3", name: "gamma-repo", posts: []},
        {
            id: "r4",
            name: "delta-repo",
            htmlUrl: "https://github.com/teamProject-Y/DiFF",
            regDate: "2025-09-08T13:10:00Z",
            posts: [
                // 5 posts
                {
                    id: "d-1",
                    title: "Delta Post 1",
                    hits: 125,
                    replies: 5,
                    reactions: 16,
                    isPublic: true,
                    analysis: true,
                    graph: {
                        gradeSecurity: "B",
                        vulnerabilities: 1,
                        gradeReliability: "A",
                        bugs: 0,
                        gradeMaintainability: "B",
                        codeSmells: 9,
                        gradeComplexity: "B",
                        complexity: 7,
                        gradeCoverage: "A",
                        coverage: 92,
                        duplicatedLinesDensity: 5
                    }
                },
                {
                    id: "d-2",
                    title: "Delta Post 2",
                    hits: 60,
                    replies: 1,
                    reactions: 4,
                    isPublic: false,
                    analysis: false,
                    graph: null
                },
                {
                    id: "d-3",
                    title: "Delta Post 3",
                    hits: 87,
                    replies: 3,
                    reactions: 9,
                    isPublic: true,
                    analysis: true,
                    graph: {
                        gradeSecurity: "B",
                        vulnerabilities: 2,
                        gradeReliability: "B",
                        bugs: 2,
                        gradeMaintainability: "B",
                        codeSmells: 11,
                        gradeComplexity: "B",
                        complexity: 9,
                        gradeCoverage: "B",
                        coverage: 80,
                        duplicatedLinesDensity: 8
                    }
                },
                {
                    id: "d-4",
                    title: "Delta Post 4",
                    hits: 31,
                    replies: 0,
                    reactions: 1,
                    isPublic: true,
                    analysis: false,
                    graph: null
                },
                {
                    id: "d-5",
                    title: "Delta Post 5",
                    hits: 140,
                    replies: 7,
                    reactions: 22,
                    isPublic: true,
                    analysis: true,
                    graph: {
                        gradeSecurity: "A",
                        vulnerabilities: 0,
                        gradeReliability: "A",
                        bugs: 0,
                        gradeMaintainability: "A",
                        codeSmells: 3,
                        gradeComplexity: "B",
                        complexity: 6,
                        gradeCoverage: "A",
                        coverage: 95,
                        duplicatedLinesDensity: 3
                    }
                },
            ],
        },
    ],
};

// INFO datasets per repo
const REPO_INFO = {
    r1: {
        languages: [
            {language: "JavaScript", totalLines: 31230},
            {language: "CSS", totalLines: 7230},
            {language: "HTML", totalLines: 6320},
            {language: "Shell", totalLines: 3870},
            {language: "SQL", totalLines: 1060},
        ],
        history: [
            {
                analyzeDate: "2025-08-29",
                bugs: 9,
                codeSmells: 260,
                complexity: 620,
                coverage: 70,
                duplicatedLinesDensity: 19.8,
                vulnerabilities: 12,
                totalScore: 3
            },
            {
                analyzeDate: "2025-08-31",
                bugs: 8,
                codeSmells: 255,
                complexity: 680,
                coverage: 72,
                duplicatedLinesDensity: 19.2,
                vulnerabilities: 11,
                totalScore: 3
            },
            {
                analyzeDate: "2025-09-01",
                bugs: 10,
                codeSmells: 265,
                complexity: 680,
                coverage: 69,
                duplicatedLinesDensity: 20.0,
                vulnerabilities: 13,
                totalScore: 3
            },
            {
                analyzeDate: "2025-09-02",
                bugs: 7,
                codeSmells: 240,
                complexity: 620,
                coverage: 73,
                duplicatedLinesDensity: 17.5,
                vulnerabilities: 10,
                totalScore: 3
            },
            {
                analyzeDate: "2025-09-03",
                bugs: 6,
                codeSmells: 230,
                complexity: 600,
                coverage: 76,
                duplicatedLinesDensity: 16.0,
                vulnerabilities: 9,
                totalScore: 4
            },
            {
                analyzeDate: "2025-09-04",
                bugs: 6,
                codeSmells: 225,
                complexity: 580,
                coverage: 80,
                duplicatedLinesDensity: 15.5,
                vulnerabilities: 8,
                totalScore: 4
            },
            {
                analyzeDate: "2025-09-05",
                bugs: 5,
                codeSmells: 210,
                complexity: 520,
                coverage: 83,
                duplicatedLinesDensity: 13.2,
                vulnerabilities: 7,
                totalScore: 4
            },
            {
                analyzeDate: "2025-09-06",
                bugs: 4,
                codeSmells: 200,
                complexity: 490,
                coverage: 86,
                duplicatedLinesDensity: 12.0,
                vulnerabilities: 5,
                totalScore: 4
            },
            {
                analyzeDate: "2025-09-07",
                bugs: 3,
                codeSmells: 190,
                complexity: 440,
                coverage: 90,
                duplicatedLinesDensity: 10.5,
                vulnerabilities: 4,
                totalScore: 4
            },
            {
                analyzeDate: "2025-09-08",
                bugs: 3,
                codeSmells: 180,
                complexity: 310,
                coverage: 92,
                duplicatedLinesDensity: 9.4,
                vulnerabilities: 4,
                totalScore: 5
            },
            {
                analyzeDate: "2025-09-10",
                bugs: 2,
                codeSmells: 170,
                complexity: 280,
                coverage: 95,
                duplicatedLinesDensity: 8.1,
                vulnerabilities: 3,
                totalScore: 5
            },
            {
                analyzeDate: "2025-09-11",
                bugs: 2,
                codeSmells: 165,
                complexity: 250,
                coverage: 96,
                duplicatedLinesDensity: 7.3,
                vulnerabilities: 2,
                totalScore: 5
            }
        ],
        commits: [],
    },
    r2: {
        languages: [
            {language: "TypeScript", totalLines: 22010},
            {language: "JavaScript", totalLines: 11980},
            {language: "Markdown", totalLines: 1330},
        ],
        history: [
            {
                analyzeDate: "2025-09-01",
                bugs: 3,
                codeSmells: 14,
                complexity: 13,
                coverage: 62,
                duplicatedLinesDensity: 14,
                vulnerabilities: 2,
                totalScore: 2
            },
            {
                analyzeDate: "2025-09-03",
                bugs: 2,
                codeSmells: 12,
                complexity: 12,
                coverage: 64,
                duplicatedLinesDensity: 13,
                vulnerabilities: 2,
                totalScore: 3
            },
            {
                analyzeDate: "2025-09-05",
                bugs: 2,
                codeSmells: 11,
                complexity: 11,
                coverage: 68,
                duplicatedLinesDensity: 12,
                vulnerabilities: 1,
                totalScore: 3
            },
            {
                analyzeDate: "2025-09-07",
                bugs: 1,
                codeSmells: 10,
                complexity: 11,
                coverage: 70,
                duplicatedLinesDensity: 11,
                vulnerabilities: 1,
                totalScore: 3
            },
            {
                analyzeDate: "2025-09-08",
                bugs: 1,
                codeSmells: 9,
                complexity: 10,
                coverage: 72,
                duplicatedLinesDensity: 10,
                vulnerabilities: 1,
                totalScore: 3
            },
            {
                analyzeDate: "2025-09-09",
                bugs: 1,
                codeSmells: 9,
                complexity: 10,
                coverage: 73,
                duplicatedLinesDensity: 10,
                vulnerabilities: 1,
                totalScore: 3
            },
        ],
        commits: [],
    },
    r3: {
        languages: [
            {language: "Go", totalLines: 5020},
            {language: "Makefile", totalLines: 420},
        ],
        history: [],
        commits: [],
    },
    r4: {
        languages: [
            {language: "Python", totalLines: 18200},
            {language: "Jupyter Notebook", totalLines: 6400},
            {language: "Dockerfile", totalLines: 380},
        ],
        history: [
            {
                analyzeDate: "2025-09-02",
                bugs: 25,
                codeSmells: 320,
                complexity: 200,
                coverage: 40,
                duplicatedLinesDensity: 22,
                vulnerabilities: 18,
                totalScore: 2
            },
            {
                analyzeDate: "2025-09-04",
                bugs: 32,
                codeSmells: 360,
                complexity: 280,
                coverage: 35,
                duplicatedLinesDensity: 25,
                vulnerabilities: 21,
                totalScore: 2
            },
            {
                analyzeDate: "2025-09-06",
                bugs: 38,
                codeSmells: 395,
                complexity: 320,
                coverage: 31,
                duplicatedLinesDensity: 27,
                vulnerabilities: 23,
                totalScore: 2
            },
            {
                analyzeDate: "2025-09-08",
                bugs: 45,
                codeSmells: 430,
                complexity: 380,
                coverage: 47,
                duplicatedLinesDensity: 30,
                vulnerabilities: 26,
                totalScore: 1
            },
            {
                analyzeDate: "2025-09-09",
                bugs: 52,
                codeSmells: 470,
                complexity: 430,
                coverage: 23,
                duplicatedLinesDensity: 33,
                vulnerabilities: 39,
                totalScore: 1
            },
            {
                analyzeDate: "2025-09-10",
                bugs: 58,
                codeSmells: 510,
                complexity: 480,
                coverage: 30,
                duplicatedLinesDensity: 36,
                vulnerabilities: 42,
                totalScore: 1
            },
        ],
        commits: [],
    },
};

const COMMIT_DATA = {
    r1: {
        commits: [
            {
                sha: "ad2f9c1e3",
                message: "feat(settings): add application settings module and implement follow feature",
                authoredAt: "2025-09-04T02:15:00Z",
                authorName: "DiFF",
                authorLogin: "DiFF",
                authorAvatarUrl: "https://avatars.githubusercontent.com/u/219219941?s=96&v=4",
                htmlUrl: "https://github.com/teamProject-Y/DiFF/commit/1a1576fd10db017e1946d87329cd669e7bd82e27"
            },
            {
                sha: "b18c7a3d9",
                message: "feat(auth): add GitHub OAuth login & callback; session security configuration",
                authoredAt: "2025-09-05T09:30:00Z",
                authorName: "DiFF",
                authorLogin: "DiFF",
                authorAvatarUrl: "https://avatars.githubusercontent.com/u/219219941?s=96&v=4",
                htmlUrl: "https://github.com/teamProject-Y/DiFF/commit/1a1576fd10db017e1946d87329cd669e7bd82e27"
            },
            {
                sha: "c7e64b1a2",
                message: "feat(webhook): handle GitHub push events; verify HMAC signature;",
                authoredAt: "2025-09-07T11:20:00Z",
                authorName: "DiFF",
                authorLogin: "DiFF",
                authorAvatarUrl: "https://avatars.githubusercontent.com/u/219219941?s=96&v=4",
                htmlUrl: "https://github.com/teamProject-Y/DiFF/commit/1a1576fd10db017e1946d87329cd669e7bd82e27"
            },
            {
                sha: "d3f2a9b85",
                message: "feat(drafts): commit-to-blog (OpenAI); add prompt templates",
                authoredAt: "2025-09-08T13:10:00Z",
                authorName: "DiFF",
                authorLogin: "DiFF",
                authorAvatarUrl: "https://avatars.githubusercontent.com/u/219219941?s=96&v=4",
                htmlUrl: "https://github.com/teamProject-Y/DiFF/commit/1a1576fd10db017e1946d87329cd669e7bd82e27"
            },
            {
                sha: "e9017cd42",
                message: "initial commit:",
                authoredAt: "2025-09-09T16:45:00Z",
                authorName: "DiFF",
                authorLogin: "DiFF",
                authorAvatarUrl: "https://avatars.githubusercontent.com/u/219219941?s=96&v=4",
                htmlUrl: "https://github.com/teamProject-Y/DiFF/commit/1a1576fd10db017e1946d87329cd669e7bd82e27"
            },
        ]
    },
    r2: {
        commits: [
            {
                sha: "19ce5ad34",
                message: "feat(animation): modal, alert animation",
                authoredAt: "2025-09-10T09:10:00Z",
                authorName: "DiFF",
                authorLogin: "DiFF",
                authorAvatarUrl: "https://avatars.githubusercontent.com/u/219219941?s=96&v=4",
                htmlUrl: "https://github.com/teamProject-Y/DiFF/commit/1a1576fd10db017e1946d87329cd669e7bd82e27"
            },
            {
                sha: "0a7d4b2ef",
                message: "feat(repo): connect github repository",
                authoredAt: "2025-09-10T07:45:00Z",
                authorName: "DiFF",
                authorLogin: "DiFF",
                authorAvatarUrl: "https://avatars.githubusercontent.com/u/219219941?s=96&v=4",
                htmlUrl: "https://github.com/teamProject-Y/DiFF/commit/1a1576fd10db017e1946d87329cd669e7bd82e27"
            },
            {
                sha: "f6c1e83d0",
                message: "feat(auth): social login, profile, settings",
                authoredAt: "2025-09-10T06:20:00Z",
                authorName: "DiFF",
                authorLogin: "DiFF",
                authorAvatarUrl: "https://avatars.githubusercontent.com/u/219219941?s=96&v=4",
                htmlUrl: "https://github.com/teamProject-Y/DiFF/commit/1a1576fd10db017e1946d87329cd669e7bd82e27"
            },
            {
                sha: "e58b2c7a4",
                message: "feat(ui): router + layout",
                authoredAt: "2025-09-10T05:00:00Z",
                authorName: "DiFF",
                authorLogin: "DiFF",
                authorAvatarUrl: "https://avatars.githubusercontent.com/u/219219941?s=96&v=4",
                htmlUrl: "https://github.com/teamProject-Y/DiFF/commit/1a1576fd10db017e1946d87329cd669e7bd82e27"
            },
            {
                sha: "d4a0f7c12",
                message: "chore(web): bootstrap app",
                authoredAt: "2025-09-10T03:30:00Z",
                authorName: "DiFF",
                authorLogin: "DiFF",
                authorAvatarUrl: "https://avatars.githubusercontent.com/u/219219941?s=96&v=4",
                htmlUrl: "https://github.com/teamProject-Y/DiFF/commit/1a1576fd10db017e1946d87329cd669e7bd82e27"
            },
            {
                sha: "c93be21fd",
                message: "feat(cli): add analysis",
                authoredAt: "2025-09-10T02:10:00Z",
                authorName: "DiFF",
                authorLogin: "DiFF",
                authorAvatarUrl: "https://avatars.githubusercontent.com/u/219219941?s=96&v=4",
                htmlUrl: "https://github.com/teamProject-Y/DiFF/commit/1a1576fd10db017e1946d87329cd669e7bd82e27"
            },
            {
                sha: "b27ad4e91",
                message: "feat(cli): add init, draft",
                authoredAt: "2025-09-10T01:05:00Z",
                authorName: "DiFF",
                authorLogin: "DiFF",
                authorAvatarUrl: "https://avatars.githubusercontent.com/u/219219941?s=96&v=4",
                htmlUrl: "https://github.com/teamProject-Y/DiFF/commit/1a1576fd10db017e1946d87329cd669e7bd82e27"
            },
            {
                sha: "a1f9c03b7",
                message: "feat(cli): scaffold command runner",
                authoredAt: "2025-09-10T00:20:00Z",
                authorName: "DiFF",
                authorLogin: "DiFF",
                authorAvatarUrl: "https://avatars.githubusercontent.com/u/219219941?s=96&v=4",
                htmlUrl: "https://github.com/teamProject-Y/DiFF/commit/1a1576fd10db017e1946d87329cd669e7bd82e27"
            },
            {
                sha: "a1f9c03b1",
                message: "initial commit:",
                authoredAt: "2025-09-01T00:00:00Z",
                authorName: "DiFF",
                authorLogin: "DiFF",
                authorAvatarUrl: "https://avatars.githubusercontent.com/u/219219941?s=96&v=4",
                htmlUrl: "https://github.com/teamProject-Y/DiFF/commit/1a1576fd10db017e1946d87329cd669e7bd82e27"
            }
        ]
    },
    r3: {
        commits: []
    },
    r4: {
        commitsUrl: "",
        commits: [
            {
                sha: "abcdef1",
                message: "Start to DiFF!!",
                authorName: "lee",
                authorLogin: "lee123",
                authorAvatarUrl: "https://avatars.githubusercontent.com/u/219219941?s=400&v=4",
                authoredAt: "2025-09-08T13:10:00Z",
                htmlUrl: "https://github.com/owner/repo/commit/abcdef1"
            },
        ]
    }
};


export default function SampleRepoLayout() {

    const [selectedRepoId, setSelectedRepoId] = useState(
        DATA.repositories[0]?.id || null
    );
    const [tab, setTab] = useState("info");

    const selectedRepo = useMemo(
        () => DATA.repositories.find((r) => r.id === selectedRepoId) || null,
        [selectedRepoId]
    );

    return (
        <section className="flex-grow w-[80%] text-gray-800">
            <div className="mx-auto max-w-6xl h-full flex flex-col">

                {/* Content Area */}
                <div className="relative flex-1 min-h-0">
                    {/* Secondary Tabs */}
                    {DATA.repositories.length > 0 && (
                        <div className="absolute -top-9 left-[230px] flex">
                            {[
                                {key: "posts", label: "Posts"},
                                {key: "info", label: "Info"},
                            ].map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    className={`px-4 py-2 text-sm border-t border-r border-l rounded-t-xl transition ${
                                        tab === t.key
                                            ? "-mb-px z-50 bg-gray-50 text-gray-900"
                                            : "bg-gray-200 text-gray-400"
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-[230px_1fr] items-start h-full min-h-0">
                        {/* Left Sidebar */}
                        <aside className="h-full overflow-y-auto rounded-l-lg border-t border-l border-b bg-gray-100">
                            <ul className="p-4 space-y-2">
                                <li className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 text-gray-700"
                                    title="add repository">
                                    <span className="w-4 text-center">＋</span>
                                    <span className="truncate">add repository</span>
                                </li>
                                {DATA.repositories.map((r) => {
                                    const sel = r.id === selectedRepoId;
                                    return (
                                        <li
                                            key={r.id}
                                            onClick={() => setSelectedRepoId(r.id)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer ${
                                                sel ? "bg-gray-200 text-gray-900" : "hover:bg-gray-100 text-gray-700"
                                            }`}
                                            title={r.name}
                                        >
                                            <span className="w-4 text-center">{sel ? "📂" : "📁"}</span>
                                            <span className="truncate">{r.name}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </aside>

                        {/* Main Content */}
                        <div className="relative border rounded-r-lg h-full overflow-hidden bg-gray-50 border-gray-200">
                            {tab === "info" && selectedRepo ? (
                                <InfoView repo={selectedRepo}/>
                            ) : null}

                            {tab === "posts" && selectedRepo ? (
                                <PostsView repo={selectedRepo}/>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ==========================
// INFO View
// ==========================
function InfoView({repo}) {
    const info = REPO_INFO[repo.id] || {languages: [], history: [], commits: []};
    const [chartTab, setChartTab] = useState("recent");
    const commitData = COMMIT_DATA[repo.id] || {commits: []};

    return (
        <div className="absolute inset-0 p-4 overflow-y-auto">
            <div className="flex gap-3 h-full w-full overflow-y-scroll">
                {/* Left 70% */}
                <div className="max-w-[70%] min-w-[70%] flex flex-col">
                    <div className="flex-1 overflow-y-auto flex flex-col gap-3">
                        {/* Charts */}
                        <div className="h-[35%] relative rounded-xl border shadow-sm p-3 bg-white border-gray-200 pt-9">
                            <div className="absolute top-3 right-4 z-10 flex items-center gap-2">
                                {[
                                    {k: "recent", label: "Recent"},
                                    {k: "history", label: "History"},
                                    {k: "total", label: "Total"},
                                ].map((x) => (
                                    <button
                                        key={x.k}
                                        onClick={() => setChartTab(x.k)}
                                        className={`mx-1 text-sm ${chartTab === x.k ? "text-blue-600" : "text-gray-400"}`}
                                    >
                                        {x.label}
                                    </button>
                                ))}
                            </div>

                            {chartTab === "history" ? (
                                <AnalysisHistoryChart history={info.history} isMyRepo={true}/>
                            ) : chartTab === "total" ? (
                                <TotalAnalysisChart history={info.history} isMyRepo={true}/>
                            ) : (
                                <AnalysisRecentChart history={info.history} isMyRepo={true}/>
                            )}
                        </div>

                        {/* Commit List */}
                        <div
                            className="flex-grow overflow-y-scroll rounded-xl border shadow-sm bg-white border-gray-200">
                            <CommitListStatic data={commitData}/>
                        </div>
                    </div>
                </div>

                <div className="w-[30%] grid grid-rows-[auto,1fr,auto] gap-3 h-full min-h-0">
                    <div className="rounded-xl border shadow-sm p-4 bg-white border-gray-200">
                        <div className="flex items-center gap-3">
                            <p className="text-xl font-semibold break-all pl-1">{repo.name}</p>
                        </div>
                        <div className="mt-2 flex w-full text-sm justify-between items-center">
                            <div className="text-gray-400 flex-grow">
                                <i className="fa-solid fa-calendar text-neutral-400"></i>&nbsp;
                                {new Date(repo.regDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "2-digit",
                                    year: "numeric"
                                })}</div>
                            <span
                                className="ml-auto text-xs px-2 py-1 rounded-full border bg-white border-gray-200">public</span>
                            {repo.htmlUrl && (
                                <a
                                    href={repo.htmlUrl}
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

                    <div
                        className="rounded-xl border shadow-sm p-4 pb-12 bg-white border-gray-200 flex flex-col min-h-0 overflow-hidden">
                        <div className="font-semibold">Languages</div>
                        <div className="mt-2 grow min-h-0">
                            <LanguageChart languages={info.languages} isMyRepo={true}/>
                        </div>
                    </div>

                    <button
                        className="w-full p-2 border rounded-xl transition-colors shadow-sm text-red-500 hover:bg-red-500 hover:text-white bg-white border-gray-200">
                        Delete Repository
                    </button>
                </div>
            </div>
        </div>
    );
}

// ==========================
// Posts area (kept)
// ==========================
function PostsView({repo}) {
    if (!repo) return null;
    const posts = Array.isArray(repo.posts) ? repo.posts : [];
    return (
        <div className="absolute inset-0 overflow-y-auto p-6">
            {posts.length === 0 ? (
                <div className="rounded-lg border bg-white border-gray-200 p-10 text-center">
                    <div className="text-2xl">📝</div>
                    <p className="mt-2 text-sm text-gray-500">No posts yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {posts.map((p) => (
                        <PostCardLight key={p.id} post={p}/>
                    ))}
                </div>
            )}
        </div>
    );
}

function PostCardLight({post}) {
    const hasAnalysis = !!post.analysis && !!post.graph;
    return (
        <div className="group cursor-pointer rounded-lg border transition bg-white border-gray-200 hover:bg-gray-100">
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <h2 className="line-clamp-2 text-base font-semibold tracking-tight text-gray-900">{post.title || "Untitled"}</h2>
                    <span
                        className="ml-2 text-xs px-2 py-1 rounded border border-gray-300">{post.isPublic ? "public" : "private"}</span>
                </div>
                <div className="ml-1 my-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span>view {post.hits ?? 0}</span>
                    <span className="flex items-center gap-1"
                          aria-label="comments"><span><i
                        className="fa-regular fa-comment"/></span>{post.replies ?? 0}</span>
                    <span className="flex items-center gap-1"
                          aria-label="reactions"><span><i className="fa-regular fa-heart"/></span>{post.reactions ?? 0}</span>
                </div>
            </div>
            {hasAnalysis && (
                <div className="p-3 border-t border-gray-200">
                    <AnalysisGraphLight data={post.graph}/>
                </div>
            )}
        </div>
    );
}

function AnalysisGraphLight({data}) {
    if (!data) return null;
    const density = clamp01(data.duplicatedLinesDensity) * 100;
    return (
        <div className="p-1 flex items-center justify-around text-sm flex-nowrap font-bold text-gray-800">
            <Metric label="Security" grade={data.gradeSecurity} value={data.vulnerabilities}/>
            <Metric label="Reliability" grade={data.gradeReliability} value={data.bugs}/>
            <Metric label="Maintainability" grade={data.gradeMaintainability} value={data.codeSmells}/>
            <Metric label="Complexity" grade={data.gradeComplexity} value={data.complexity}/>
            <Metric label="Coverage" grade={data.gradeCoverage} value={`${data.coverage} %`}/>
            <div className="flex flex-col items-center gap-2">
                <div className="flex justify-center items-center gap-3">
                    <div className="relative w-7 h-7">
                        <div className="absolute inset-0 rounded-full"
                             style={{background: `conic-gradient(${getDuplicationColor(density)} ${density}%, #e5e7eb 0)`}}/>
                        <div className="absolute inset-1 rounded-full bg-white"/>
                    </div>
                    {Math.round(density)} %
                </div>
                <span className="font-medium text-[11px]">Duplications</span>
            </div>
        </div>
    );
}

function Metric({label, grade, value}) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
                <CircleGrade grade={grade}/> {value}
            </div>
            <span className="font-medium text-[11px]">{label}</span>
        </div>
    );
}

function CircleGrade({grade = "E"}) {
    const key = String(grade).toUpperCase();
    return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-gray-700"
             style={{backgroundColor: gradeBaseColor(key)}} aria-label={`Grade ${key}`}
             title={`Grade ${key}`}> {key} </div>
    );
}

function gradeBaseColor(key) {
    switch (String(key || "").toUpperCase()) {
        case "A":
            return "rgb(176, 255, 194)";
        case "B":
            return "rgb(224, 255, 142)";
        case "C":
            return "rgb(255, 250, 134)";
        case "D":
            return "rgb(255, 213, 157)";
        case "E":
            return "rgb(255, 196, 196)";
        default:
            return "rgb(218, 218, 218)";
    }
}

function getDuplicationColor(v) {
    const d = Math.max(0, Math.min(100, Number(v) || 0));
    if (d < 5) return "rgb(61,191,67)";
    if (d < 10) return "rgb(187,211,36)";
    if (d < 15) return "rgb(230,201,13)";
    if (d < 20) return "rgb(255,171,59)";
    return "rgb(232,104,104)";
}

function clamp01(x) {
    const v = Number(x);
    if (Number.isNaN(v)) return 0;
    return Math.max(0, Math.min(1, v > 1 ? v / 100 : v));
}

// ==========================
// Commit List
// ==========================
function CommitListStatic({data = {commits: []}}) {
    const commits = Array.isArray(data.commits) ? data.commits : [];

    return (
        <div className="relative flex flex-col h-full w-full min-h-0 rounded-lg bg-white">
            {/* Static header: no inputs, no pagination, light-mode only */}
            <div className="flex justify-between shrink-0 px-3 py-2 border-b bg-gray-100">
                <div className="flex items-center gap-2">
                    <span className="text-sm">
                        <i className="fa-solid fa-code-branch mr-1"></i>
                        Branch</span>
                    <span className="px-2 py-0.5 rounded-md border text-sm bg-white border-gray-200"
                          style={{minWidth: 120}}>main</span>
                </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 min-h-0 w-full overflow-y-auto px-3">
                {commits.length === 0 ? (
                    <div className="h-full w-full flex justify-center items-center text-sm text-gray-500">
                        No commits yet
                    </div>
                ) : (
                    <ul className="divide-y max-w-full divide-gray-200">
                        {commits.map((c) => (
                            <li key={c.sha} className="py-4 flex items-start gap-3">
                                <img
                                    src={c.authorAvatarUrl || "https://avatars.githubusercontent.com/u/0?v=4"}
                                    alt=""
                                    className="w-10 h-10 rounded-full object-cover self-center"
                                />
                                <div className="min-w-0 flex-1">
                                    <a
                                        className="font-medium truncate hover:underline"
                                        href={c.htmlUrl || "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        title={c.message}
                                    >
                                        {c.message || "(no message)"}
                                    </a>
                                    <div className="flex gap-1 text-xs text-gray-500 mt-0.5">
                                        <span>{c.authorName}</span>
                                        &nbsp;·&nbsp;
                                        <span>
                                          {new Date(c.authoredAt).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "2-digit",
                                              year: "numeric"
                                          })}
                                        </span>
                                        &nbsp;·&nbsp;
                                        <span>{c.sha}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
