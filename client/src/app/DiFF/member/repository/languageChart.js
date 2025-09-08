"use client";

import "@/common/registerChart";
import { Doughnut } from "react-chartjs-2";
import { useTheme } from "@/common/thema";
import { useMemo } from "react";

export default function LanguageChart({ languages = [] }) {
    const theme = useTheme();
    const isDark = theme === "dark";

    // ===== 데이터 정리 (항상 실행: 훅 순서 유지) =====
    const MAX = 8; // 상위 7 + Others
    const sorted = [...languages].sort((a, b) => (b.totalLines || 0) - (a.totalLines || 0));
    const head = sorted.slice(0, MAX - 1);
    const tail = sorted.slice(MAX - 1);
    const others = tail.length
        ? [{ language: `Others +${tail.length}`, totalLines: tail.reduce((s, x) => s + (x.totalLines || 0), 0), _others: true }]
        : [];
    const dataList = head.concat(others);
    const hasData = dataList.length > 0;

    const total = dataList.reduce((s, x) => s + (x.totalLines || 0), 0) || 1;
    const percents = dataList.map((d) => ((d.totalLines || 0) / total) * 100);
    const topIdx = percents.indexOf(Math.max(...percents, 0));
    const topLabel = hasData ? (dataList[topIdx]?.language ?? "") : "No Data";
    const topPct = hasData ? Math.round(percents[topIdx] || 0) : 0;

    const palette = [
        "#6C8AE4", // soft blue
        "#38BDF8", // sky
        "#34D399", // emerald
        "#F2C14E", // muted amber
        "#F2994A", // apricot
        "#E06C75", // soft red
        "#A78BFA", // violet
        "#5AA6E7", // light azure
    ].slice(0, dataList.length);

    // ===== 차트 데이터 / 옵션 =====
    const chartData = {
        labels: dataList.map((d) => d.language),
        datasets: [
            {
                data: dataList.map((d) => d.totalLines),
                backgroundColor: palette,
                borderColor: isDark ? "#0b0b0b" : "#ffffff",
                borderWidth: 2,
                hoverOffset: 6,
                cutout: "70%",
                spacing: 3,
                borderRadius: 10,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // 부모 크기에 맞춤
        rotation: -90, // 12시 방향 시작
        layout: {
            padding: { top: 12, right: 12, bottom: 12, left: 12 },
        },
        plugins: {
            legend: { display: false }, // 커스텀 레전드 사용
            tooltip: {
                padding: 10,
                backgroundColor: isDark ? "rgba(17,17,17,0.95)" : "rgba(0,0,0,0.85)",
                titleColor: "#fff",
                bodyColor: "#fff",
                callbacks: {
                    label: (ctx) => {
                        const value = ctx.parsed;
                        const pct = ((value / total) * 100).toFixed(1);
                        return ` ${ctx.label}: ${pct}% (${value.toLocaleString()} lines)`;
                    },
                },
            },
        },
    };

    const centerLabel = useMemo(
        () => ({
            id: "centerLabel",
            afterDatasetsDraw(chart) {
                const { ctx } = chart;
                const meta = chart.getDatasetMeta(0);
                if (!meta?.data?.length) return;
                const { x, y } = meta.data[0];

                const mainColor = isDark ? "#FFFFFF" : "#111827";
                const subColor = isDark ? "#D4D4D8" : "#6B7280";
                const outline = isDark ? "rgba(0,0,0,.45)" : "rgba(255,255,255,.65)";

                ctx.save();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                // 퍼센트 (외곽선 → 채움)
                ctx.lineWidth = 3;
                ctx.strokeStyle = outline;
                // ctx.font = "600 18px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
                ctx.strokeText(`${topPct}%`, x, y - 6);
                ctx.fillStyle = mainColor;
                ctx.fillText(`${topPct}%`, x, y - 6);

                // 라벨
                ctx.lineWidth = 2;
                ctx.strokeStyle = outline;
                // ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
                ctx.strokeText(topLabel, x, y + 12);
                ctx.fillStyle = subColor;
                ctx.fillText(topLabel, x, y + 12);

                ctx.restore();
            },
        }),
        [isDark, topPct, topLabel]
    );

    // ===== 레전드 데이터 =====
    const legendItems = dataList.map((d, i) => ({
        color: palette[i],
        label: d.language,
        pct: percents[i],
    }));

    // ===== 렌더 =====
    if (!hasData) {
        return (
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center text-center text-neutral-600 dark:text-neutral-400 rounded-lg">
                    <div className="w-14 h-14 mb-2 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <i className="fa-solid fa-chart-pie text-2xl" />
                    </div>
                    <div className="font-semibold">No analysis yet.</div>
                    <div className="text-xs opacity-70">Create a draft to see language distribution</div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full flex flex-col">
            {/* 차트: 부모 안에서 여유 있게 */}
            <div className="relative flex-1 min-h-0 p-3 sm:p-4">
                <Doughnut
                    key={theme}
                    data={chartData}
                    options={options}
                    plugins={[centerLabel]}
                    style={{ width: "100%", height: "100%" }}
                />
            </div>

            {/* 미니멀 레전드: 하단, 2열, 절제된 여백 */}
            <div className="px-3 pb-2">
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {legendItems.map((it) => (
                        <li key={`${it.label}`} className="flex items-center gap-2 min-w-0">
                            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: it.color }} />
                            <span className="truncate">
                {it.label}
                                <span className="opacity-60"> · {it.pct.toFixed(1)}%</span>
              </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
