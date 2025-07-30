// pages/usr/home/main.js
'use client';

import { userEffect } from 'react';
import { getUsers } from '@/lib/UserAPI';
import * as BCryptPasswordEncoder from "next-auth/jwt";

export default function Main() {
    return <div>메인입니다.</div>
}

// _app.js 쪽에서 꺼내 쓸 pageTitle 정의
Main.pageTitle = 'MAIN PAGE'
