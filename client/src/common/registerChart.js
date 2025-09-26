"use client";

import {
    Chart as ChartJS,
    // 스케일(축)
    CategoryScale,
    LinearScale,

    // 차트 요소들
    BarElement,
    LineElement,
    PointElement,
    ArcElement,

    RadialLinearScale,

    // 플러그인
    Title,
    Tooltip,
    Legend,
    TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
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
    Legend,
    TimeScale
);
