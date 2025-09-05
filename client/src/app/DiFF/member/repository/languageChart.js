"use client";

import '@/common/registerChart';
import { Doughnut } from "react-chartjs-2";
import {useTheme} from "@/common/thema";

export default function LanguageChart({ languages }) {

    const theme = useTheme();

    if (!languages || languages.length === 0) {
        return (
            <div className="w-[200px] h-[200px] flex flex-col items-center justify-center gap-2
            text-gray-600 dark:text-neutral-400">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 mb-2">
                    <i className="fa-solid fa-chart-pie text-3xl"></i>
                </div>
                <p className="font-semibold">No analysis yet.</p>
            </div>
        );
    }


    const chartData = {
        labels: languages.map(l => l.language),
        datasets: [
            {
                data: languages.map(l => l.totalLines),
                backgroundColor: ["#ff9c9c","#a9d0ff","#b9ffe6",
                    "#ffde99","#e5ffa8","#ffb1f2","#c1fdff"],
                borderWidth: 0,
                hoverOffset: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        cutout: "70%", // 도넛 두께
        layout: {
            padding: { right: 24 }, // 차트와 범례 사이 간격
        },
        plugins: {
            legend: {
                position: "right",
                labels: {
                    usePointStyle: true,
                    pointStyle: "circle",
                    boxWidth: 6,
                    boxHeight: 6,
                    padding: 10,
                    color: theme === 'dark' ? '#d4d4d4' : '#101828',
                    fontSize: "20px",
                },
            },
            title: { display: false, text: "language chart" },
            tooltip: { enabled: true },
        },
    };

    return (
        <div className="w-full h-48">
            <Doughnut data={chartData} options={options} />
        </div>
    );
}
