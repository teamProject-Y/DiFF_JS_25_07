'use client';
import { Line } from "react-chartjs-2";

export default function TotalAnalysisChart({ history }) {
    console.log("🟢 [TotalAnalysisChart] 받은 history =", history);

    if (!history || history.length === 0) {
        return <p className="text-sm text-gray-400">토탈 데이터 없음</p>;
    }

    // ✅ 날짜 포맷 → 9.4 형식
    const labels = history.map(h => {
        const d = new Date(h.analyzeDate);
        return `${d.getMonth() + 1}.${d.getDate()}`;
    });

    const data = {
        labels,
        datasets: [
            {
                label: "Total Score",
                data: history.map(h => h.totalScore),
                borderColor: "#3b82f6",
                backgroundColor: "#3b82f6",
                tension: 0.2,
                fill: false,
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false } // ❌ chart.js 기본 타이틀 제거
        },
        scales: {
            x: {
                grid: { display: false }
            },
            y: {
                min: 0,
                max: 5,
                grid: { display: false },
                ticks: {
                    stepSize: 1,
                    callback: (val) => {
                        switch (val) {
                            case 5: return "A";
                            case 4: return "B";
                            case 3: return "C";
                            case 2: return "D";
                            case 1: return "E";
                            default: return val;
                        }
                    }
                }
            }
        }
    };

    return (
        <div className="w-full h-full relative">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-600">
                Total Analysis History
            </div>
            <Line data={data} options={options} />
        </div>
    );
}
