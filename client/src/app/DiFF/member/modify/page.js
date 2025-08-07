// pages/usr/member/page.js

'use client';

import { useState, useEffect }  from "react"
import { useRouter } from "next/navigation"
import { fetchUser, modifyUser } from "@/lib/UserAPI";

export default function ModifyPage({ initialMember }) {
    const router = useRouter();
    const [member, setMember] = useState(initialMember || null);
    const [form, setForm] = useState({});
    // const [form, setForm] = useState(initialMember ? {
    //     id: initialMember.id,
    //     loginId: initialMember.loginId,
    //     name: initialMember.name,
    //     nickName: initialMember.nickName,
    //     email: initialMember.email,
    // } : {});
    const [pw, setPw] = useState("");
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState("");

    // 1. (Optional) 클라에서 다시 fetchUser로 최신 상태 보장하고 싶다면...
    useEffect(() => {
        const accessToken = typeof window !== "undefined" && localStorage.getItem('accessToken');
        if (!accessToken) {
            router.replace('/DiFF/member/login');
            return;
        }

        fetchUser()
            .then(user => {
                setMember(user);
                setForm({
                    id: user.id || "",
                    loginId: user.loginId || "",
                    name: user.name || "",
                    nickName: user.nickName || "",
                    email: user.email || "",
                });
            })
            .catch(() => {
                router.replace('/DiFF/home/main');
            });


        // 기존에 있던 거
        // if (!initialMember) {
        //     const accessToken = typeof window !== "undefined" && localStorage.getItem('accessToken');
        //     if (!accessToken) {
        //         router.replace('/DiFF/member/login');
        //         return;
        //     }
        //     fetchUser().then(user => {
        //         setMember(user);
        //         setForm({
        //             id: user.id,
        //             loginId: user.loginId,
        //             name: user.name,
        //             nickName: user.nickName,
        //             email: user.email,
        //         });
        //     });
        // }
    }, [router]);


    // 3. 폼 변경 핸들러
    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 4. 회원정보 수정 요청
    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        try {
            await modifyUser(form);
            router.push("/DiFF/member/myPage");
        } catch {
            setError("정보 수정에 실패했습니다.");
        }
    };

    if (!member) return <div>로딩...</div>;

    return (
        <div className="container mx-auto mt-10">
            <button
                onClick={() => router.back()}
                className="text-4xl pl-4 mb-4 cursor-pointer"
            >
                <i className="fa-solid fa-angle-left"></i>
            </button>


                <div className="mx-auto max-w-min p-8 bg-neutral-200 border border-neutral-300 rounded-lg">
                    <h2 className="text-2xl font-semibold text-center mb-6">회원 정보 수정</h2>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <form onSubmit={handleSubmit} className="flex flex-col items-center">
                        <input name="id" value={form.id ?? ""} disabled
                               className="mb-4 w-96 p-2.5 border border-neutral-300 rounded-lg bg-neutral-100"
                               placeholder="번호"/>
                        <input name="loginId" value={form.loginId ?? ""} disabled
                               className="mb-4 w-96 p-2.5 border border-neutral-300 rounded-lg bg-neutral-100"
                               placeholder="아이디"/>
                        <input name="email" value={form.email ?? ""} disabled className="mb-4 w-96 p-2.5 border border-neutral-300 rounded-lg bg-neutral-100" onChange={handleChange} placeholder="이메일" />
                        <input name="name" value={form.name ?? ""} className="mb-4 w-96 p-2.5 border border-neutral-300 rounded-lg bg-neutral-100" onChange={handleChange} placeholder="이름" />
                        <input name="nickName" value={form.nickName ?? ""} className="mb-4 w-96 p-2.5 border border-neutral-300 rounded-lg bg-neutral-100" onChange={handleChange} placeholder="닉네임" />
                        <button type="submit"
                                className="py-2.5 px-5 w-96 bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700">
                            UPDATE
                        </button>
                    </form>
                </div>
        </div>
    )
}

ModifyPage.pageTitle = "MY INFO MODIFY"