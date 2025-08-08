'use client';

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchUser } from "@/lib/UserAPI";
import { useEffect,useState } from "react";

export default function MyInfoPage() {
    const router = useRouter();
    const [member, setMember] = useState(null);
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const accessToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');
        if (!accessToken) {
            router.replace('/DiFF/member/login');
            return;
        }

        fetchUser()
            .then(res => {
                console.log("마이페이지 응답:", res);
                // 백엔드 응답 구조에 맞춰서 분해
                setMember(res.member); // ← member만 따로 저장
                setRepositories(res.repositories); // ← 레포지토리도 따로
                setLoading(false);
            })
            .catch(err => {
                console.error("마이페이지 오류:", err);
                setLoading(false);
                router.replace('/DiFF/home/main');
            });
    }, []);


    if (loading) return <div>로딩...</div>;
    if (!member) return null; // 데이터 없을 때(비정상)

    return (
        <section className="mt-24 text-xl px-4">
            <div className="mx-auto max-w-4xl">
                {/* 🔹 사용자 정보 테이블 */}
                <table className="w-full border-collapse border border-neutral-300 mb-12">
                    <tbody>
                    <tr>
                        <th className="border p-2">가입일</th>
                        <td className="border p-2 text-center">{member.regDate}</td>
                    </tr>
                    <tr>
                        <th className="border p-2">아이디</th>
                        <td className="border p-2 text-center">{member.loginId}</td>
                    </tr>
                    <tr>
                        <th className="border p-2">이름</th>
                        <td className="border p-2 text-center">{member.name}</td>
                    </tr>
                    <tr>
                        <th className="border p-2">닉네임</th>
                        <td className="border p-2 text-center">{member.nickName}</td>
                    </tr>
                    <tr>
                        <th className="border p-2">이메일</th>
                        <td className="border p-2 text-center">{member.email}</td>
                    </tr>
                    <tr>
                        <th className="border p-2">회원정보 수정</th>
                        <td className="border p-2 text-center">
                            <Link
                                href="/DiFF/member/modify"
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                수정
                            </Link>
                        </td>
                    </tr>
                    </tbody>
                </table>

                {/* 🔹 레포지토리 카드 */}
                <div className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">내 레포지토리</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {repositories?.length > 0 ? (
                            repositories.map((repo, idx) => (
                                <div
                                    key={repo.id}
                                    className="border border-gray-300 p-4 rounded-lg bg-white shadow-md cursor-pointer hover:bg-gray-100 transition"
                                    onClick={() => router.push(`/DiFF/article/list?repositoryId=${repo.id}`)}
                                >
                                    <h3 className="font-bold text-lg mb-2">
                                        {repo.name || `Repository ${idx + 1}`}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-1">
                                        생성일: {repo.regDate?.split('T')[0]}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-1">
                                        커밋 ID: {repo.lastRqCommit || '없음'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        이름: {repo.name || '이름 없음'}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p>등록된 레포지토리가 없습니다.</p>
                        )}
                    </div>
                </div>

                {/* 🔹 뒤로가기 */}
                <div className="text-center">
                    <button
                        onClick={() => router.replace('/DiFF/home/main')}
                        className="px-6 py-2 text-sm bg-neutral-800 text-white rounded hover:bg-neutral-700"
                    >
                        뒤로가기
                    </button>
                </div>
            </div>
        </section>
    );
}