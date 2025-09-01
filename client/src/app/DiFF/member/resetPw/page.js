"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [newPw, setNewPw] = useState("");
    const [msg, setMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("📩 요청 보내는 값:", { token, newPw });
        try {
            await axios.post("http://localhost:8080/api/DiFF/member/updatePassword", null, {
                params: { token, newPw },
            });
            setMsg("✅ 비밀번호가 성공적으로 변경되었습니다. 로그인해주세요.");
        } catch (err) {
            console.error("❌ 오류 발생:", err.response?.data);
            setMsg("❌ 오류: " + (err.response?.data || "서버 문제"));
        }
    };

    if (!token) return <p>잘못된 접근입니다. (토큰 없음)</p>;

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">새 비밀번호 설정</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="새 비밀번호"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                />
                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 rounded"
                >
                    변경하기
                </button>
            </form>
            {msg && <p className="mt-4 text-sm">{msg}</p>}
        </div>
    );
}
