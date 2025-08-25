'use client';

import {useRouter} from 'next/navigation';
import {saveInquiry} from "@/lib/NotionAPI";
import {useState, useEffect} from "react";

export default function InquiryForm() {
    const router = useRouter();  // ✅ useRouter 훅 사용
    const [inquiry, setInquiry] = useState({
        title: "",
        nickName: "",
        email: "",
        body: "",
        regDate: new Date().toISOString().split("T")[0]  // yyyy-MM-dd
    });

    useEffect(() => {
        const storedNickName = localStorage.getItem("nickName");
        if (storedNickName) {
            setInquiry(prev => ({...prev, nickName: storedNickName}));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await saveInquiry(inquiry);
            alert(res.message);

            setInquiry(prev => ({
                ...prev,
                nickName: res.nickName,
            }));

            router.push("/DiFF/home/main");
        } catch (err) {
            console.error("문의 저장 실패:", err);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="border border-gray-200 rounded-lg shadow p-6 mx-12 my-8"
        >

            <h2 className="text-4xl font-semibol text-gray-800 my-4">Contact us</h2>

            <div>
                <label className="block text-md font-medium text-gray-600 mb-1">Title</label>
                <input
                    type="text"
                    placeholder="Please enter a title"
                    value={inquiry.title}
                    onChange={e => setInquiry({...inquiry, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:outline-none"
                />
            </div>

            <div>
                <label htmlFor="email-address-icon"
                       className="block mb-2 font-medium text-gray-900 dark:text-white">Your Email</label>
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
                            <path
                                d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z"/>
                            <path
                                d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z"/>
                        </svg>
                    </div>
                    <input type="text" id="email-address-icon"
                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                           placeholder="yourEmail@diff.com" value={inquiry.email}
                           onChange={e => setInquiry({...inquiry, email: e.target.value})}/>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Inquiry details</label>
                <textarea
                    placeholder="Please write your inquiry"
                    value={inquiry.body}
                    onChange={e => setInquiry({...inquiry, body: e.target.value})}
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
