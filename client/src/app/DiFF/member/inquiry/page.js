'use client';

import { useRouter } from 'next/navigation';
import { saveInquiry } from "@/lib/NotionAPI";
import { useState, useEffect } from "react";

export default function InquiryForm() {
    const router = useRouter();  // ✅ useRouter 훅 사용
    const [inquiry, setInquiry] = useState({
        title: "",
        nickName: "",   // 로그인한 닉네임
        email: "",
        body: "",
        regDate: new Date().toISOString().split("T")[0]  // yyyy-MM-dd
    });

    useEffect(() => {
        const storedNickName = localStorage.getItem("nickName");
        if (storedNickName) {
            setInquiry(prev => ({ ...prev, nickName: storedNickName }));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await saveInquiry(inquiry);
            alert(res.message);

            setInquiry(prev => ({ ...prev, nickName: res.nickName }));

            router.push("/DiFF/home/main");
        } catch (err) {
            console.error("문의 저장 실패:", err);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto bg-amber-100 mt-20 p-6 space-y-4"
        >

            <h2 className="text-3xl font-semiboltext-gray-800 text-center">Please contact us</h2>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
                <input
                    type="text"
                    placeholder="Please enter a title"
                    value={inquiry.title}
                    onChange={e => setInquiry({ ...inquiry, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input
                    type="email"
                    placeholder="Email address"
                    value={inquiry.email}
                    onChange={e => setInquiry({ ...inquiry, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Inquiry details</label>
                <textarea
                    placeholder="Please write your inquiry"
                    value={inquiry.body}
                    onChange={e => setInquiry({ ...inquiry, body: e.target.value })}
                    rows="5"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none resize-none"
                />
            </div>

            <button
                type="submit"
                className="w-full bg-black text-white font-semibold py-2 rounded-lg shadow-md hover:bg-gray-800 transition-colors"
            >
                Submit
            </button>
        </form>
    );
}
