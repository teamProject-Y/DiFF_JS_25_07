'use client';

import '@/common/registerChart';
import { Doughnut } from "react-chartjs-2";

// Circle 컴포넌트
const Circle = ({ grade = 'E' }) => {
    const key = String(grade).toUpperCase();

    const bg = (() => {
        switch (key) {
            case 'A':
                return COLORS.green;
            case 'B':
                return COLORS.lime;
            case 'C':
                return COLORS.yellow;
            case 'D':
                return COLORS.orange;
            case 'E':
                return COLORS.red;
            default:
                return COLORS.gray;
        }
    })();

    return (
        <div
            className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-neutral-900/50"
            style={{ backgroundColor: bg }}
            aria-label={`Grade ${key}`}
            title={`Grade ${key}`}
        >
            {key}
        </div>
    );
};

const COLORS = {
    blue: '#bad1ff',
    skyblue: "#b8fbff",
    green:  "#b9ffc5",
    lime:   "#e3ff9a",
    yellow: "#fffbba",
    orange: "#ffe2ba",
    red:    "#ffc3c3",
    gray:   "#f3f4f6",
};

export default function AnalysisGraph({ analysis }) {
    if (!analysis) return null;

    function getDuplicationColor(d) {
        const v = Math.max(0, Math.min(100, Number(d) || 0));
        if (v < 5)  return COLORS.green;
        if (v < 10) return COLORS.lime;
        if (v < 15) return COLORS.yellow;
        if (v < 20) return COLORS.orange;
        return COLORS.red;
    }

    const density = Math.max(0, Math.min(100, Number(analysis.duplicatedLinesDensity) || 0));

    const duplicationData = {
        datasets: [
            {
                data: [density, 100 - density],
                backgroundColor: [getDuplicationColor(density), COLORS.gray],
                borderWidth: 0,
            },
        ],
    };

    const duplicationOptions = {
        cutout: "70%",
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
    };

    return (
        <div className="flex items-center gap-8 text-sm flex-nowrap">

            {/* Security */}
            <div className="flex items-center gap-2">
                <Circle grade={analysis.gradeSecurity} />
                <span>Security: {analysis.vulnerabilities}</span>
            </div>

            {/* Reliability */}
            <div className="flex items-center gap-2">
                <Circle grade={analysis.gradeReliability} />
                <span>Reliability: {analysis.bugs}</span>
            </div>

            {/* Maintainability */}
            <div className="flex items-center gap-2">
                <Circle grade={analysis.gradeMaintainability} />
                <span>Maintainability: {analysis.codeSmells}</span>
            </div>

            {/* Complexity */}
            <div className="flex items-center gap-2">
                <Circle grade={analysis.gradeComplexity} />
                <span>Complexity: {analysis.complexity}</span>
            </div>

            {/* Coverage */}
            <div className="flex items-center gap-2">
                <Circle grade={analysis.gradeCoverage} />
                <span>Coverage: {analysis.coverage}%</span>
            </div>

            {/* Duplications */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10">
                    <Doughnut data={duplicationData} options={duplicationOptions} />
                </div>
                <span>Duplications {analysis.duplicatedLinesDensity}%</span>
            </div>
        </div>
    );
}
