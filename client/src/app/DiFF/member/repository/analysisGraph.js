'use client';

import '@/common/registerChart';
import {Doughnut} from "react-chartjs-2";

// Circle 컴포넌트
const Circle = ({grade = 'E'}) => {
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
        <div className="w-7 h-7 rounded-full relative"
             style={{backgroundColor: bg}}
             aria-label={`Grade: ${key}`}
             title={`Grade: ${key}`}>
            <p className="absolute inset-0 flex items-center justify-center
            text-neutral-900/50 text-xs">{key}</p>
        </div>
    );
};

const COLORS = {
    blue: '#bad1ff',
    skyblue: "#b8fbff",
    green: "#b9ffc5",
    lime: "#e3ff9a",
    yellow: "#fffbba",
    orange: "#ffe2ba",
    red: "#ffc3c3",
    gray: "#b6b6b6",
};

export default function AnalysisGraph({analysis}) {
    if (!analysis) return null;

    function getDuplicationColor(d) {
        const v = Math.max(0, Math.min(100, Number(d) || 0));
        if (v < 5) return COLORS.green;
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
        plugins: {legend: {display: false}, tooltip: {enabled: false}},
    };

    return (
        <div className="p-1 flex items-center justify-around text-sm flex-nowrap font-bold">

            {/* Security */}
            <div className="flex flex-col jusitify-center items-center gap-2">
                <div className="flex items-center gap-3"><Circle
                    grade={analysis.gradeSecurity}/> {analysis.vulnerabilities}</div>
                <span className="font-medium text-xs">Security</span>
            </div>

            {/* Reliability */}
            <div className="flex flex-col jusitify-center items-center gap-2">
                <div className="flex items-center gap-3"><Circle grade={analysis.gradeReliability}/> {analysis.bugs}
                </div>
                <span className="font-medium text-xs">Reliability</span>
            </div>

            {/* Maintainability */}
            <div className="flex flex-col jusitify-center items-center gap-2">
                <div className="flex items-center gap-3"><Circle
                    grade={analysis.gradeMaintainability}/>{analysis.codeSmells}</div>
                <span className="font-medium text-xs">Maintainability</span>
            </div>

            {/* Complexity */}
            <div className="flex flex-col jusitify-center items-center gap-2">
                <div className="flex items-center gap-3"><Circle
                    grade={analysis.gradeComplexity}/> {analysis.complexity}</div>
                <span className="font-medium text-xs">Complexity</span>
            </div>

            {/* Coverage */}
            <div className="flex flex-col jusitify-center items-center gap-2">
                <div className="flex items-center gap-3"><Circle grade={analysis.gradeCoverage}/> {analysis.coverage} %
                </div>
                <span className="font-medium text-xs">Coverage</span>
            </div>

            {/* Duplications */}
            <div className="flex flex-col jusitify-center items-center gap-2">
                <div className="flex justify-center items-center gap-3">
                    <div className="w-7 h-7">
                        <Doughnut data={duplicationData} options={duplicationOptions}/>
                    </div>
                    {analysis.duplicatedLinesDensity}%
                </div>
                <span className="font-medium text-xs">Duplications</span>
            </div>
        </div>
    );
}
