"use client";

import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function LanguageChart({ languages }) {
        console.log(' chart render', languages);
    if (!languages || languages.length === 0) {
        return <p className="text-sm text-gray-400">언어 데이터 없음</p>;
    }

    const chartData = {
        labels: languages.map(l => l.language),
        datasets: [
            {
                data: languages.map(l => l.totalLines),
                backgroundColor: [
                    "#f87171", // red
                    "#60a5fa", // blue
                    "#34d399", // green
                    "#fbbf24", // yellow
                    "#a78bfa", // purple
                    "#f472b6", // pink
                    "#94a3b8", // gray
                ],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        plugins: {
            legend: {
                position: "right",
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                },
            },
        },
    };

    return (
        <div className="w-full h-64">
            <Doughnut data={chartData} options={options} />
        </div>
    );
}
