"use client";

import '@/common/registerChart';
import { Doughnut } from "react-chartjs-2";
import {useTheme} from "@/common/thema";

export default function LanguageChart({ languages }) {

    const theme = useTheme();

    if (!languages || languages.length === 0) {
        return <p className="text-sm text-gray-400 dark:text-neutral-300">No data</p>;
    }

    const chartData = {
        labels: languages.map(l => l.language),
        datasets: [
            {
                data: languages.map(l => l.totalLines),
                backgroundColor: ["#ff9c9c","#a9d0ff","#b9ffe6",
                    "#ffde99","#e5ffa8","#ffb1f2","#c1fdff"],
                borderWidth: 0,
                hoverOffset: 2, // 원하면 호버시 살짝 튀어나오게
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
                    padding: 10, // 차트와 범례 사이 간격
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
