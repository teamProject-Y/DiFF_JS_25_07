'use client';

import { saveInquiry } from "@/lib/NotionAPI";
import { useState } from "react";

export default function InquiryForm() {
    const [inquiry, setInquiry] = useState({
        title: "",
        nickName: "",
        email: "",
        body: "",
        regDate: new Date().toISOString().split("T")[0]  // yyyy-MM-dd
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await saveInquiry(inquiry);
            alert(res); // "문의사항 저장 완료" 라는 응답
        } catch (err) {
            console.error(" 문의 저장 실패:", err);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6 space-y-4"
        >
            <h2 className="text-xl font-semibold text-gray-800 text-center">문의하기</h2>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">제목</label>
                <input
                    type="text"
                    placeholder="제목을 입력하세요"
                    value={inquiry.title}
                    onChange={e => setInquiry({ ...inquiry, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">닉네임</label>
                <input
                    type="text"
                    placeholder="닉네임"
                    value={inquiry.nickName}
                    onChange={e => setInquiry({ ...inquiry, nickName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">이메일</label>
                <input
                    type="email"
                    placeholder="이메일 주소"
                    value={inquiry.email}
                    onChange={e => setInquiry({ ...inquiry, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">문의 내용</label>
                <textarea
                    placeholder="문의 내용을 입력하세요"
                    value={inquiry.body}
                    onChange={e => setInquiry({ ...inquiry, body: e.target.value })}
                    rows="5"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
                문의하기
            </button>
        </form>

    );
}
