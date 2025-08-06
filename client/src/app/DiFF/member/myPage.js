import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '../../../../common/layout'
import { fetchUser } from "@/lib/UserAPI";
import { useEffect,useState } from "react";

export default function MyInfoPage() {
    const router = useRouter();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. 토큰 없으면 로그인으로 강제 이동
        const accessToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');
        if (!accessToken) {
            router.replace('/DiFF/member/login');
            return;
        }

        // 2. 토큰 있으면 유저 정보 불러오기
        fetchUser()
            .then(res => {
                console.log("마이페이지 응답:", res);
                // 백엔드 API에서 멤버 정보 반환
                setMember(res); // ← 백엔드 응답 구조에 맞춰서 수정!
                setLoading(false);
            })
            .catch(err => {
                console.error("마이페이지 오류:", err);
                // 토큰 만료 or 기타 오류
                setLoading(false);
                router.replace('/DiFF/home/main');
            });
    }, []);

    if (loading) return <div>로딩...</div>;
    if (!member) return null; // 데이터 없을 때(비정상)

    return (

            <section className="mt-24 text-xl px-4">
                <div className="mx-auto max-w-4xl">
                    <table className="w-full border-collapse border border-neutral-300 mb-6">
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
                                    href="/client/src/app/DiFF/member/modify"
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    수정
                                </Link>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <div className="text-center">
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-2 text-sm bg-neutral-800 text-white rounded hover:bg-neutral-700"
                        >
                            뒤로가기
                        </button>
                    </div>
                </div>
            </section>

    )
}