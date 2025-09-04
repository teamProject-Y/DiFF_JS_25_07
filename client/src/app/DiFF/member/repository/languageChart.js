"use client";

import '@/common/registerChart';
import { Doughnut } from "react-chartjs-2";

export default function LanguageChart({ languages }) {
    if (!languages || languages.length === 0) {
        return <p className="text-sm text-gray-400">언어 데이터 없음</p>;
    }

    const chartData = {
        labels: languages.map(l => l.language),
        datasets: [
            {
                data: languages.map(l => l.totalLines),
                backgroundColor: ["#f87171","#60a5fa","#34d399","#fbbf24","#a78bfa","#f472b6","#94a3b8"],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "right", labels: { usePointStyle: true, boxWidth: 8 } },
            title: { display: true, text: '언어별 비율' },
        },
    };

    return (
        <div className="w-full h-64">
            <Doughnut data={chartData} options={options} />
        </div>
    );
}