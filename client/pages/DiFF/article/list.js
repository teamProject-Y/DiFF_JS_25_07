// pages/usr/article/list.js
import { useRouter } from 'next/router'


export default function ArticleListPage({
                                            member,
                                            articles,
                                            totalCnt,
                                            totalPage,
                                            page,
                                            boardId,
                                            searchItem,
                                            keyword,
                                        }) {
    const router = useRouter()

    const handleSearch = e => {
        e.preventDefault()
        const form = new FormData(e.target)
        const params = new URLSearchParams({
            boardId: form.get('boardId'),
            searchItem: form.get('searchItem'),
            keyword: form.get('keyword'),
            page: '1',
        })
        // 검색 시 올바른 경로로 이동
        router.push(`/DiFF/article/list?${params.toString()}`)
    }

    return (
        <div>
            <button
                onClick={() => router.back()}
                className="block text-4xl pl-10 cursor-pointer"
            >
                <i className="fa-solid fa-angle-left" />
            </button>

            <div className="container mx-auto my-10 w-5/6">
                <h1 className="text-4xl font-bold m-4">Article list</h1>

                <div className="flex justify-between items-end text-neutral-800 mx-2 my-3">
                    <div className="articleCnt font-normal mx-4">
                        총 게시 글 : {totalCnt}
                    </div>
                    <form
                        onSubmit={handleSearch}
                        className="search-bar flex items-center h-8 px-2 text-sm"
                    >
                        <select
                            name="boardId"
                            defaultValue={boardId}
                            className="px-4 border rounded-lg"
                        >
                            <option value="0">전체 게시판</option>
                            <option value="1">공지사항</option>
                            <option value="2">자유 게시판</option>
                            <option value="3">QnA</option>
                        </select>

                        <select
                            name="searchItem"
                            defaultValue={searchItem}
                            className="mx-2 border rounded-md pl-2 pr-2"
                        >
                            <option value="1">제목</option>
                            <option value="2">내용</option>
                            <option value="3">작성자</option>
                        </select>

                        <input
                            name="keyword"
                            defaultValue={keyword}
                            placeholder="Search"
                            className="border rounded-md px-2"
                        />

                        <button
                            type="submit"
                            className="ml-2 p-2 bg-neutral-800 text-neutral-200 rounded-md hover:bg-neutral-700"
                        >
                            🔍
                        </button>

                        <a
                            href="/DiFF/article/write"
                            className="ml-6 px-5 text-base rounded-md hover:bg-neutral-300"
                        >
                            글 작성
                        </a>
                    </form>
                </div>

                <div className="overflow-hidden rounded-xl border">
                    <table className="w-full text-sm text-center text-neutral-800">
                        <thead className="bg-neutral-800 text-neutral-200">
                        <tr>
                            {[
                                'NO',
                                'BOARD',
                                'TITLE',
                                'WRITER',
                                'sumReaction',
                                'goodReaction',
                                'badReaction',
                                'HITS',
                                'REGISTRATION DATE',
                            ].map((h, i) => (
                                <th key={i} className="px-6 py-4">
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {articles.length > 0 ? (
                            articles.map(article => (
                                <tr
                                    key={article.id}
                                    className="border-b bg-neutral-200 hover:bg-neutral-300 cursor-pointer"
                                    onClick={() =>
                                        router.push(`/DiFF/article/detail?id=${article.id}`)
                                    }
                                >
                                    <td className="px-5 py-3">{article.id}</td>
                                    <td className="px-5 py-3">{article.extra_boardCode}</td>
                                    <td className="px-5 py-3 text-left pl-6">
                                        {article.title}
                                    </td>
                                    <td className="px-5 py-3">{article.extra_writer}</td>
                                    <td className="px-5 py-3">{article.extra_sumReactionPoint}</td>
                                    <td className="px-5 py-3">{article.extra_goodReactionPoint}</td>
                                    <td className="px-5 py-3">{article.extra_badReactionPoint}</td>
                                    <td className="px-5 py-3">{article.hits}</td>
                                    <td className="px-5 py-3">
                                        {article.regDate.substring(0, 10)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="py-8 text-lg text-center">
                                    게시글이 없습니다
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="inline-flex justify-center text-xl mt-4">
                    {Array.from({ length: totalPage }, (_, idx) => idx + 1).map(i => (
                        <button
                            key={i}
                            onClick={() =>
                                router.push(
                                    `/DiFF/article/list?boardId=${boardId}&searchItem=${searchItem}&keyword=${keyword}&page=${i}`
                                )
                            }
                            className={`mx-1 w-8 ${
                                page === i ? 'bg-neutral-200 rounded-full' : ''
                            }`}
                        >
                            {i}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

ArticleListPage.pageTitle = 'ARTICLE LIST'

export async function getServerSideProps({ query, req }) {
    const {
        boardId = '0',
        searchItem = '1',
        keyword = '',
        page = '1',
    } = query

    const API_BASE = process.env.BACKEND_URL || 'http://localhost:8080'

    // 1) 인증된 유저 정보
    const meRes = await fetch(`${API_BASE}/DiFF/member/myInfo`, {
        headers: { cookie: req.headers.cookie || '' },
        credentials: 'include',
    })
    if (meRes.status !== 200) {
        return { redirect: { destination: '/usr/member/login', permanent: false } }
    }
    const member = await meRes.json()

    // 2) 게시글 목록
    const listRes = await fetch(
        `${API_BASE}/DiFF/article/list?boardId=${boardId}&searchItem=${searchItem}&keyword=${encodeURIComponent(keyword)}&page=${page}`,
        {
            headers: { cookie: req.headers.cookie || '' },
            credentials: 'include',
        }
    )
    const data = await listRes.json()

    return {
        props: {
            member,
            ...data,
            boardId: parseInt(boardId, 10),
            searchItem: parseInt(searchItem, 10),
            page: parseInt(page, 10),
        },
    }
}
