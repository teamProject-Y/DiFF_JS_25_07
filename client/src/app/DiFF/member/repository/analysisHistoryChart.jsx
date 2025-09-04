// src/app/DiFF/member/repository/AnalysisHistoryChart.jsx
'use client';

import '@/common/registerChart';
import { Line } from 'react-chartjs-2';

export default function AnalysisHistoryChart({ history = [] }) {
    if (!history.length) {
        return <p className="text-gray-500 text-center">분석 데이터 없음</p>;
    }

    // 안전하게 숫자 변환
    const num = (v) => (v == null || v === '' ? null : Number(v));
    const pt  = (h, key) => ({ x: new Date(h.analyzeDate), y: num(h[key]) });

    const data = {
        datasets: [
            {
                label: 'Coverage (%)',
                data: history.map((h) => pt(h, 'coverage')),
                borderColor: 'green',
                backgroundColor: 'rgba(0, 128, 0, 0.2)',
                tension: 0.3,
            },
            {
                label: 'Bugs',
                data: history.map((h) => pt(h, 'bugs')),
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                tension: 0.3,
            },
            {
                label: 'Complexity',
                data: history.map((h) => pt(h, 'complexity')),
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.2)',
                tension: 0.3,
            },
            {
                label: 'Code Smells',
                data: history.map((h) => pt(h, 'codeSmells')),
                borderColor: 'orange',
                backgroundColor: 'rgba(255, 165, 0, 0.2)',
                tension: 0.3,
            },
            {
                label: 'Duplications (%)',
                data: history.map((h) => pt(h, 'duplicatedLinesDensity')),
                borderColor: 'purple',
                backgroundColor: 'rgba(128, 0, 128, 0.2)',
                tension: 0.3,
            },
            {
                label: 'Vulnerabilities',
                data: history.map((h) => pt(h, 'vulnerabilities')),
                borderColor: 'black',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // 부모 높이 따라가게 (원하면 삭제)
        plugins: {
            legend: {
                position: 'right',
                labels: { usePointStyle: true, pointStyle: 'circle', padding: 15 },
            },
            title: { display: true, text: 'Analysis History' },
        },
        elements: {
            point: { radius: 4, hoverRadius: 6 },
            line: { fill: false },
        },
        scales: {
            x: {
                type: 'time',
                time: { unit: 'day' }, // 필요시 'month' 등으로 변경
            },
            y: { beginAtZero: true },
        },
    };

    return (
        <div className="h-64 w-full text-gray-900 dark:text-neutral-400">
            <Line data={data} options={options} />
        </div>
    );
}

