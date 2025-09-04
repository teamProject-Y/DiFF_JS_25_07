'use client';

import '@/common/registerChart';
import {Doughnut} from "react-chartjs-2";

const gradeBaseColor = (key) => {
    switch (String(key || '').toUpperCase()) {
        case 'A': return 'rgb(176, 255, 194)';
        case 'B': return 'rgb(224, 255, 142)';
        case 'C': return 'rgb(255, 250, 134)';
        case 'D': return 'rgb(255, 213, 157)';
        case 'E': return 'rgb(255, 196, 196)';
        default:  return 'rgb(218, 218, 218)';
    }
};

export const Circle = ({ grade = 'E' }) => {
    const key = String(grade).toUpperCase();
    return (
        <div
            className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-neutral-900/60"
            style={{ backgroundColor: gradeBaseColor(key) }}
            aria-label={`Grade ${key}`}
            title={`Grade ${key}`}
        >
            {key}
        </div>
    );
};

export default function AnalysisGraph({analysis}) {
    if (!analysis) return null;

    function getDuplicationColor(d) {
        const v = Math.max(0, Math.min(100, Number(d) || 0));
        if (v < 5) return "rgb(61,191,67)";
        if (v < 10) return "rgb(187,211,36)";
        if (v < 15) return "rgb(230,201,13)";
        if (v < 20) return "rgb(255,171,59)";
        return "rgb(232,104,104)";
    }

    const density = Math.max(0, Math.min(100, Number(analysis.duplicatedLinesDensity) || 0));

    const duplicationData = {
        datasets: [
            {
                data: [density, 100 - density],
                backgroundColor: [getDuplicationColor(density), gradeBaseColor()],
                borderWidth: 0,
            },
        ],
    };

    const duplicationOptions = {
        cutout: "70%",
        plugins: {legend: {display: false}, tooltip: {enabled: false}},
    };

    return (
        <div className="p-1 flex items-center justify-around text-sm flex-nowrap font-bold">

            {/* Security */}
            <div className="flex flex-col jusitify-center items-center gap-3">
                <div className="flex items-center gap-3"><Circle
                    grade={analysis.gradeSecurity}/> {analysis.vulnerabilities}</div>
                <span className="font-medium text-xs">Security</span>
            </div>

            {/* Reliability */}
            <div className="flex flex-col jusitify-center items-center gap-3">
                <div className="flex items-center gap-3"><Circle grade={analysis.gradeReliability}/> {analysis.bugs}
                </div>
                <span className="font-medium text-xs">Reliability</span>
            </div>

            {/* Maintainability */}
            <div className="flex flex-col jusitify-center items-center gap-3">
                <div className="flex items-center gap-3"><Circle
                    grade={analysis.gradeMaintainability}/>{analysis.codeSmells}</div>
                <span className="font-medium text-xs">Maintainability</span>
            </div>

            {/* Complexity */}
            <div className="flex flex-col jusitify-center items-center gap-3">
                <div className="flex items-center gap-3"><Circle
                    grade={analysis.gradeComplexity}/> {analysis.complexity}</div>
                <span className="font-medium text-xs">Complexity</span>
            </div>

            {/* Coverage */}
            <div className="flex flex-col jusitify-center items-center gap-3">
                <div className="flex items-center gap-3"><Circle grade={analysis.gradeCoverage}/> {analysis.coverage} %
                </div>
                <span className="font-medium text-xs">Coverage</span>
            </div>

            {/* Duplications */}
            <div className="flex flex-col jusitify-center items-center gap-3">
                <div className="flex justify-center items-center gap-3">
                    <div className="w-7 h-7">
                        <Doughnut data={duplicationData} options={duplicationOptions}/>
                    </div>
                    {analysis.duplicatedLinesDensity} %
                </div>
                <span className="font-medium text-xs">Duplications</span>
            </div>
        </div>
    );
}
