"use client";
import { useState } from "react";
import axios from "axios";

export default function FindPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8080/api/DiFF/member/findPw", null, {
                params: { email }, // 백엔드에서 @RequestParam String email 받음
            });
            setMessage("✅ 비밀번호 재설정 메일을 발송했습니다. 이메일을 확인하세요.");
        } catch (err) {
            setMessage("❌ 메일 발송 실패: " + (err.response?.data || "서버 오류"));
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">비밀번호 찾기</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="가입한 이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded"
                >
                    메일 발송
                </button>
            </form>
            {message && <p className="mt-4 text-sm">{message}</p>}
        </div>
    );
}
