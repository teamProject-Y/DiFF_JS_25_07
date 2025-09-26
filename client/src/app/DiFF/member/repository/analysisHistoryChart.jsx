// src/app/DiFF/member/repository/AnalysisHistoryChart.jsx

'use client';

import '@/common/registerChart';
import { Line } from 'react-chartjs-2';
import {useTheme} from "@/common/thema";

export default function AnalysisHistoryChart({ history = [], isMyRepo }) {

    const theme = useTheme() === 'dark' ? 'rgb(100,100,100)' : 'rgb(200,200,200)';
    const reverseTheme = useTheme() === 'dark' ? 'rgb(200,200,200)' : 'rgb(100,100,100)';

    const labels = history.map(h => {
        const d = new Date(h.analyzeDate);
        return `${d.getMonth() + 1}.${d.getDate()}`;
    });

    if (!history.length) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-center text-gray-600 dark:text-neutral-400">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 mb-3">
                    <i className="fa-solid fa-chart-column text-2xl"></i>
                </div>
                <div className="text-lg font-bold">No analysis yet.</div>
                {isMyRepo && (
                    <div className="text-blue-500 dark:text-blue-400">
                        Once you create a draft, it will be analyzed automatically.</div>
                )}
            </div>
        );
    }

    const num = (v) => (v == null || v === '' ? null : Number(v));
    const pt  = (h, key) => ({ x: new Date(h.analyzeDate), y: num(h[key]) });

    const data = {
        datasets: [
            { label: 'Bugs',               data: history.map(h => pt(h, 'bugs')),                   borderColor: theme, borderWidth: 1, backgroundColor: 'rgb(255, 99, 132)',   tension: 0.3 },
            { label: 'Code Smells',        data: history.map(h => pt(h, 'codeSmells')),             borderColor: theme, borderWidth: 1, backgroundColor: 'rgb(255, 159, 64)',   tension: 0.3 },
            { label: 'Complexity',         data: history.map(h => pt(h, 'complexity')),             borderColor: theme, borderWidth: 1, backgroundColor: 'rgb(255, 205, 86)',   tension: 0.3 },
            { label: 'Coverage (%)',       data: history.map(h => pt(h, 'coverage')),               borderColor: theme, borderWidth: 1, backgroundColor: 'rgb(34, 197, 94)',    tension: 0.3 },
            { label: 'Duplications (%)',   data: history.map(h => pt(h, 'duplicatedLinesDensity')), borderColor: theme, borderWidth: 1, backgroundColor: 'rgb(59, 130, 246)',   tension: 0.3 },
            { label: 'Vulnerabilities',    data: history.map(h => pt(h, 'vulnerabilities')),        borderColor: theme, borderWidth: 1, backgroundColor: 'rgb(168, 85, 247)',   tension: 0.3 },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 0, right: 0, bottom: 0, left: 0 } },
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 5,
                    boxWidth: 4,
                    boxHeight: 4,
                    color: reverseTheme,
                },
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
                beginAtZero: true,
                ticks: { color: reverseTheme, maxTicksLimit: 4 },
                grid: { display: false },
                border: { display: false },
            },
        },
    };

    const legendGapBetween = {
        id: 'legendGapBetween',
        beforeInit(chart, _args, opts) {
            const GAP = Number(opts?.gap ?? 20);
            const apply = () => {
                const lg = chart.legend;
                if (!lg || lg._gapPatched) return;

                const _fit = lg.fit;
                lg.fit = function fit() {
                    _fit.call(this);
                    if (this.options?.position === 'right') this.width += GAP;
                };

                const _draw = lg.draw;
                lg.draw = function draw() {
                    const { ctx } = this;
                    ctx.save();
                    if (this.options?.position === 'right') ctx.translate(GAP, 0);
                    _draw.call(this);
                    ctx.restore();
                };

                lg._gapPatched = true;
            };
            apply();
        },
    };

    return (
        <div className="h-full w-full text-gray-900 dark:text-neutral-400 p-1">
            <Line
                data={data}
                options={{ ...options, plugins: { ...options.plugins, legendGapBetween: { gap: 20 } }}}
                plugins={[legendGapBetween]} />
        </div>
    );
}
