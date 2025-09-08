'use client';

import "@/common/registerChart";
import { Line } from "react-chartjs-2";
import { useMemo } from "react";
import { useTheme } from "@/common/thema";

export default function TotalAnalysisChart({ history = [] }) {
    const theme = useTheme();
    const isDark = theme === "dark";

    if (!history || history.length === 0) {
        return (
            <div className="h-full w-full flex flex-col gap-1 items-center justify-center mt-3 text-center
            text-gray-600 dark:text-neutral-400">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800 mb-3">
                    <i className="fa-solid fa-chart-column text-2xl"></i>
                </div>

                <div className="text-lg font-bold">No analysis yet.</div>
                <div className="text-blue-500 dark:text-blue-400">Once you create a draft, it will be analyzed automatically.</div>
            </div>
        );
    }

    // ===== 데이터 정렬/라벨 =====
    const sorted = [...history].sort(
        (a, b) => new Date(a.analyzeDate).getTime() - new Date(b.analyzeDate).getTime()
    );
    const labels = sorted.map((h) => {
        const d = new Date(h.analyzeDate);
        return `${d.getMonth() + 1}.${d.getDate()}`;
    });
    const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
    const scores = sorted.map((h) => clamp(h.totalScore ?? 0, 0, 5));

    const lastIdx = scores.length - 1;
    const lastScore = scores[lastIdx];

    const gradeOf = (val) => {
        switch (Math.round(val)) {
            case 5: return "A";
            case 4: return "B";
            case 3: return "C";
            case 2: return "D";
            case 1: return "E";
            default: return String(val);
        }
    };

    // ===== 색상 (라인은 원래 색상으로 고정) =====
    const stroke = "#3B82F6"; // 원래 색
    const pointBorder = isDark ? "#0b0b0b" : "#ffffff";
    const tooltipBg = isDark ? "rgba(17,17,17,0.95)" : "rgba(0,0,0,0.85)";
    const textSub = isDark ? "#D4D4D8" : "#6B7280";

    // ===== 차트 데이터 (부드러운 그라데이션은 유지) =====
    const data = {
        labels,
        datasets: [
            {
                label: "Total Score",
                data: scores,
                borderColor: stroke,
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const area = chart.chartArea;
                    if (!area) return undefined;
                    const g = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
                    g.addColorStop(0, "rgba(59,130,246,0.18)");
                    g.addColorStop(1, "rgba(59,130,246,0.02)");
                    return g;
                },
                tension: 0.35,
                fill: true,
                borderWidth: 2,
                pointRadius: (ctx) => (ctx.dataIndex === lastIdx ? 5 : 3),
                pointHoverRadius: 6,
                pointBackgroundColor: stroke,
                pointBorderColor: pointBorder,
                pointBorderWidth: 2,
                clip: 8,
            },
        ],
    };

    // ===== 마지막 포인트 배지 (차트 영역 밖으로 나가지 않게 클램프) =====
    const lastPointBadge = useMemo(
        () => ({
            id: "lastPointBadge",
            afterDatasetsDraw(chart) {
                const { ctx, chartArea } = chart;
                const meta = chart.getDatasetMeta(0);
                if (!meta?.data?.length || !chartArea) return;

                const last = meta.data[lastIdx];
                if (!last) return;

                const x = last.x;
                const y = last.y;

                const label = `${gradeOf(lastScore)} · ${lastScore.toFixed(1)}`;
                const padX = 8;
                const h = 22;
                const r = 10;

                ctx.save();
                ctx.font = "600 11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
                const textWidth = ctx.measureText(label).width;
                const w = textWidth + padX * 2;

                // 차트 영역 안으로 강제
                const pad = 6;
                const rx = Math.min(Math.max(x + 10, chartArea.left + pad), chartArea.right - w - pad);
                const ry = Math.min(Math.max(y - 28, chartArea.top + pad), chartArea.bottom - h - pad);

                const fillBg = isDark ? "rgba(31,41,55,0.95)" : "rgba(255,255,255,0.95)";
                const strokeOutline = isDark ? "rgba(0,0,0,.45)" : "rgba(255,255,255,.65)";

                ctx.beginPath();
                roundRect(ctx, rx + 1, ry + 1, w, h, r);
                ctx.fillStyle = strokeOutline;
                ctx.fill();

                ctx.beginPath();
                roundRect(ctx, rx, ry, w, h, r);
                ctx.fillStyle = fillBg;
                ctx.fill();
                ctx.strokeStyle = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.fillStyle = isDark ? "#FFFFFF" : "#111827";
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                ctx.fillText(label, rx + padX, ry + h / 2);

                ctx.restore();
            },
        }),
        [isDark, lastIdx, lastScore]
    );

    function roundRect(ctx, x, y, w, h, r) {
        const radius = Math.min(r, h / 2, w / 2);
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + w, y, x + w, y + h, radius);
        ctx.arcTo(x + w, y + h, x, y + h, radius);
        ctx.arcTo(x, y + h, x, y, radius);
        ctx.arcTo(x, y, x + w, y, radius);
        ctx.closePath();
    }

    // ===== 옵션 =====
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 12, right: 8, bottom: 8, left: 8 } },
        interaction: { mode: "index", intersect: false },
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
                padding: 10,
                backgroundColor: tooltipBg,
                titleColor: "#fff",
                bodyColor: "#fff",
                callbacks: {
                    label: (ctx) => {
                        const v = ctx.parsed.y;
                        const g = gradeOf(v);
                        return ` ${g} (${v.toFixed(1)})`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { display: false }, // ✅ 가로 그리드 제거
                ticks: { color: textSub },
            },
            y: {
                min: 0,
                max: 5,
                grid: { display: false }, // ✅ 세로 그리드 제거
                ticks: {
                    stepSize: 1,
                    color: textSub,
                    callback: (val) => {
                        switch (val) {
                            case 5: return "A";
                            case 4: return "B";
                            case 3: return "C";
                            case 2: return "D";
                            case 1: return "E";
                            default: return val;
                        }
                    },
                },
            },
        },
    };

    // ===== 렌더 (고정 높이 + overflow-hidden로 절대 안 삐져나오게) =====
    return (
        <div className="relative w-full overflow-hidden rounded-lg">
            {/* 고정 높이: 필요시 h-48~h-72로 조절 */}
            <div className="h-56 sm:h-64 md:h-72">
                <Line
                    key={theme}
                    data={data}
                    options={options}
                    plugins={[lastPointBadge]}
                    style={{ width: "100%", height: "100%" }}
                />
            </div>
        </div>
    );
}
