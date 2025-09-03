// src/app/DiFF/member/repository/AnalysisHistoryChart.jsx
'use client';

import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

export default function AnalysisHistoryChart({ history }) {
    console.log("[AnalysisHistoryChart] history =", history);

    if (!history || history.length === 0) {
        return <p className="text-gray-500 text-center">분석 데이터 없음</p>;
    }


    const labels = history.map(h => {
        console.log("📅 analyzeDate =", h.analyzeDate);
        return new Date(h.analyzeDate);
    });

    const data = {
        labels,
        datasets: [
            {
                label: "Coverage (%)",
                data: history.map(h => {
                    console.log("🟢 coverage =", h.coverage);
                    return h.coverage;
                }),
                borderColor: "green",
                backgroundColor: "rgba(0, 128, 0, 0.2)",
                tension: 0.3,
            },
            {
                label: "Bugs",
                data: history.map(h => {
                    console.log("🔴 bugs =", h.bugs);
                    return h.bugs;
                }),
                borderColor: "red",
                backgroundColor: "rgba(255, 0, 0, 0.2)",
                tension: 0.3,
            },
            {
                label: "Complexity",
                data: history.map(h => {
                    console.log("🔵 complexity =", h.complexity);
                    return h.complexity;
                }),
                borderColor: "blue",
                backgroundColor: "rgba(0, 0, 255, 0.2)",
                tension: 0.3,
            },
            {
                label: "Code Smells",
                data: history.map(h => {
                    console.log("🟠 codeSmells =", h.codeSmells);
                    return h.codeSmells;
                }),
                borderColor: "orange",
                backgroundColor: "rgba(255, 165, 0, 0.2)",
                tension: 0.3,
            },
            {
                label: "Duplications (%)",
                data: history.map(h => {
                    console.log("🟣 duplications =", h.duplicatedLinesDensity);
                    return h.duplicatedLinesDensity;
                }),
                borderColor: "purple",
                backgroundColor: "rgba(128, 0, 128, 0.2)",
                tension: 0.3,
            },
            {
                label: "Vulnerabilities",
                data: history.map(h => {
                    console.log("⚫ vulnerabilities =", h.vulnerabilities);
                    return h.vulnerabilities;
                }),
                borderColor: "black",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                tension: 0.3,
            },
        ],
    };

    console.log("[AnalysisHistoryChart] labels =", labels);
    console.log("[AnalysisHistoryChart] datasets =", data.datasets);

    return (
        <Line
            data={data}
            options={{
                responsive: true,
                plugins: {
                    legend: {
                        position: "right",
                        labels: {
                            usePointStyle: true,
                            pointStyle: "circle",
                            padding: 15,
                        },
                    },
                    title: { display: true, text: "Analysis History" },
                },
                elements: {
                    point: {
                        radius: 4,
                        hoverRadius: 6,
                    },
                    line: {
                        fill: false,
                    },
                },
                scales: {
                    x: {
                        type: "time",
                        time: { unit: "day" },
                    },
                    y: {
                        beginAtZero: true,
                    },
                },
            }}
        />
    );

}
