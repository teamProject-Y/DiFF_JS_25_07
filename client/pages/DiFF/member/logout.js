// pages/DiFF/member/logout.js
"use client";
import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function Logout() {
    useEffect(() => {
        signOut({ callbackUrl: "/DiFF/member/login" });
    }, []);
    return <p>로그아웃 중…</p>;
}
