// pages/usr/home/main.js
'use client';

import "@/styles/global.css";
import { useEffect } from 'react';
import * as BCryptPasswordEncoder from "next-auth/jwt";

export default function Main() {
    return <div>메인입니다.
        <h1 className="text-3xl font-bold bg-red-300">Tailwind 적용됨!</h1>
    </div>
}

// _app.js 쪽에서 꺼내 쓸 pageTitle 정의
Main.pageTitle = 'MAIN PAGE'