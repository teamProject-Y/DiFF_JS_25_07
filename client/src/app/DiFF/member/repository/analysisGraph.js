'use client';

import '@/common/registerChart';
import { Doughnut } from "react-chartjs-2";

// Circle 컴포넌트
const Circle = ({ grade, color }) => (
    <div
        className="flex items-center justify-center w-8 h-8 rounde-full font-bold text-white"
        style={{ backgroundColor: color }}
    >
        {grade}
    </div>
);

export default function AnalysisGraph({ analysis }) {
    if (!analysis) return null;

    // Duplication donut 데이터
    const duplicationData = {
        datasets: [
            {
                data: [analysis.duplicatedLinesDensity, 100 - analysis.duplicatedLinesDensity],
                backgroundColor: ["#f97316", "#f3f4f6"], // 주황, 회색
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
                <Circle grade={analysis.gradeSecurity} color="#fca5a5" />
                <span>Security: {analysis.vulnerabilities}</span>
            </div>

            {/* Reliability */}
            <div className="flex items-center gap-2">
                <Circle grade={analysis.gradeReliability} color="#fde047" />
                <span>Reliability: {analysis.bugs}</span>
            </div>

            {/* Maintainability */}
            <div className="flex items-center gap-2">
                <Circle grade={analysis.gradeMaintainability} color="#86efac" />
                <span>Maintainability: {analysis.codeSmells}</span>
            </div>

            {/* Complexity */}
            <div className="flex items-center gap-2">
                <Circle grade={analysis.gradeComplexity} color="#d8b4fe" />
                <span>Complexity: {analysis.complexity}</span>
            </div>

            {/* Coverage */}
            <div className="flex items-center gap-2">
                <Circle grade={analysis.gradeCoverage} color="#9ca3af" />
                <span>Coverage: {analysis.coverage}%</span>
            </div>

            {/* Duplications */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10">
                    <Doughnut data={duplicationData} options={duplicationOptions} />
                </div>
                <span>Duplications: {analysis.duplicatedLinesDensity}%</span>
            </div>
        </div>
    );
}
