'use client';

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchUser } from "@/lib/UserAPI";
import { useEffect,useState } from "react";

export default function MyInfoPage() {
    const router = useRouter();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const accessToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');
        if (!accessToken) {
            router.replace('/DiFF/member/login');
            return;
        }

        fetchUser()
            .then(res => {
                setMember(res.member);
                setLoading(false);
            })
            .catch(err => {
                console.error("마이페이지 오류:", err);
                setLoading(false);
                router.replace('/DiFF/home/main');
            });
    }, [router]);

    if (loading) return <div>로딩...</div>;
    if (!member) return null;

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

                {/* 🔹 레포지토리 페이지 이동 버튼 */}
                <div className="text-center mb-6">
                    <button
                        onClick={() => router.push('/DiFF/member/repository')}
                        className="px-6 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-500"
                    >
                        내 레포지토리 보기
                    </button>
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
