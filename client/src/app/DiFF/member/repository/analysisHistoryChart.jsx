// src/app/DiFF/member/repository/AnalysisHistoryChart.jsx
'use client';

import '@/common/registerChart';
import { Line } from 'react-chartjs-2';
import {useTheme} from "@/common/thema";

export default function AnalysisHistoryChart({ history = [] }) {

    const theme = useTheme() === 'dark' ? 'rgb(100,100,100)' : 'rgb(200,200,200)';
    const reverseTheme = useTheme() === 'dark' ? 'rgb(200,200,200)' : 'rgb(100,100,100)';

    if (!history.length) {
        return <p className="h-full w-full flex justify-center items-center text-gray-500 text-center">
            There’s no analysis yet.
            Once you create a draft, it will be analyzed automatically.
            Go ahead and create one below.</p>;
    }

    const num = (v) => (v == null || v === '' ? null : Number(v));
    const pt  = (h, key) => ({ x: new Date(h.analyzeDate), y: num(h[key]) });

    const data = {
        datasets: [
            {
                label: 'Bugs',
                data: history.map(h => pt(h, 'bugs')),
                borderColor: theme,
                borderWidth: 1,
                backgroundColor: 'rgb(255, 99, 132)',
                tension: 0.3,
            },
            {
                label: 'Code Smells',
                data: history.map(h => pt(h, 'codeSmells')),
                borderColor: theme,
                borderWidth: 1,
                backgroundColor: 'rgb(255, 159, 64)',
                tension: 0.3,
            },
            {
                label: 'Complexity',
                data: history.map(h => pt(h, 'complexity')),
                borderColor: theme,
                borderWidth: 1,
                backgroundColor: 'rgb(255, 205, 86)',
                tension: 0.3,
            },
            {
                label: 'Coverage (%)',
                data: history.map(h => pt(h, 'coverage')),
                borderColor: theme,
                borderWidth: 1,
                backgroundColor: 'rgb(34, 197, 94)',
                tension: 0.3,
            },
            {
                label: 'Duplications (%)',
                data: history.map(h => pt(h, 'duplicatedLinesDensity')),
                borderColor: theme,
                borderWidth: 1,
                backgroundColor: 'rgb(59, 130, 246)',
                tension: 0.3,
            },
            {
                label: 'Vulnerabilities',
                data: history.map(h => pt(h, 'vulnerabilities')),
                borderColor: theme,
                borderWidth: 1,
                backgroundColor: 'rgb(168, 85, 247)',
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 0, right: 6, bottom: 0, left: 0 } },
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 5 ,
                    boxWidth: 5,
                    boxHeight: 5,
                    color: reverseTheme,
                },
            },
            title: { display: true, text: 'Analysis History', color: reverseTheme },
        },
        elements: {
            point: { radius: 4, hoverRadius: 6 },
            line: { fill: false },
        },
        scales: {
            x: {
                type: 'time',
                time: { unit: 'day' },
                // 4) 축 라벨 개수 제한 + 회전 제거
                ticks: { color: reverseTheme, maxTicksLimit: 6, autoSkip: true, maxRotation: 0 },
                grid: { display: false },
                border: { display: false },
            },
            y: {
                beginAtZero: true,
                // 5) y축 틱 개수 제한
                ticks: { color: reverseTheme, maxTicksLimit: 3 },
                grid: { display: false },
                border: { display: false },
            },
        },
    };

    return (
        <div className="h-full w-full text-gray-900 dark:text-neutral-400">
            <Line data={data} options={options} />
        </div>
    );
}

