'use client';

import '@/common/registerChart';
import { Line } from 'react-chartjs-2';
import { useTheme } from '@/common/thema';

export default function TotalAnalysisChart({ history = [], isMyRepo }) {
    const mode = useTheme();
    const theme = mode === 'dark' ? 'rgb(100,100,100)' : 'rgb(200,200,200)';
    const reverseTheme = mode === 'dark' ? 'rgb(200,200,200)' : 'rgb(100,100,100)';

    if (!history || history.length === 0) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-center text-gray-600 dark:text-neutral-400">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 mb-3">
                    <i className="fa-solid fa-chart-column text-2xl"></i>
                </div>
                <div className="text-lg font-bold">No analysis yet.</div>
                {isMyRepo && (
                    <div className="text-blue-500 dark:text-blue-400">
                        Once you create a draft, it will be analyzed automatically.
                    </div>
                )}
            </div>
        );
    }

    // === helpers ===
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
    const num = (v) => (v == null || v === '' ? null : clamp(Number(v), 1, 5));
    const pt = (h) => ({ x: new Date(h.analyzeDate), y: num(h.totalScore ?? 0) });

    const data = {
        datasets: [
            {
                label: 'Total Score',
                data: history.map(pt),
                borderColor: theme,
                borderWidth: 1,
                backgroundColor: 'rgb(59, 130, 246)',
                tension: 0.3,
                fill: false,
                clip: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 0, right: 0, bottom: 5, left: 0 } },
        plugins: {
            legend: {
                display: false,
            },
        },
        elements: {
            point: { radius: 3, hoverRadius: 5 },
            line: { fill: false },
        },
        scales: {
            x: {
                type: 'time',
                time: { unit: 'day' },
                ticks: { color: reverseTheme, maxTicksLimit: 6, autoSkip: true, maxRotation: 0 },
                grid: { display: false },
                border: { display: false },
            },
            y: {
                min: 1,
                max: 5,
                ticks: {
                    stepSize: 1,
                    autoSkip: false,
                    color: reverseTheme,
                    callback: (val) => {
                        const n = Number(val);
                        switch (n) {
                            case 5: return 'A';
                            case 4: return 'B';
                            case 3: return 'C';
                            case 2: return 'D';
                            case 1: return 'E';
                            default: return n;
                        }
                    },
                },
                grid: { display: false },
                border: { display: false },
            },
        },
    };

    return (
        <div className="h-full w-full text-gray-900 dark:text-neutral-400 p-1 overflow-hidden">
            <Line
                data={data}
                options={{ ...options, plugins: { ...options.plugins } }}
            />
        </div>
    );
}
