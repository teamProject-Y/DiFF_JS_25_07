"use client";

import {
    Chart as ChartJS,
    // 스케일(축)
    CategoryScale,   // X축 카테고리
    LinearScale,     // Y축 숫자

    // 차트 요소들
    BarElement,      // 막대
    LineElement,     // 선
    PointElement,    // 점
    ArcElement,      // 파이/도넛

    RadialLinearScale, // 레이더/폴라에어 차트용

    // 플러그인
    Title,
    Tooltip,
    Legend,
} from "chart.js";

// ✅ 한 번에 등록
ChartJS.register(
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);
