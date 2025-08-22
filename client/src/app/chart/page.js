'use client';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    RadialLinearScale,
    PointElement,
    LineElement,
} from 'chart.js';

import { Bar, Radar } from 'react-chartjs-2';

// chart.js 플러그인 등록
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    RadialLinearScale,
    PointElement,
    LineElement
);

export default function QualityPage() {
    // 예시 데이터 (프로젝트 3개)
    const projects = ['Project A', 'Project B', 'Project C'];

    const groupedBarData = {
        labels: projects,
        datasets: [
            {
                label: 'Bugs',
                data: [5, 1, 16],
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
            {
                label: 'Complexity',
                data: [159, 195, 317],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
            {
                label: 'Code Smells',
                data: [51, 61, 188],
                backgroundColor: 'rgba(255, 206, 86, 0.6)',
            },
            {
                label: 'Vulnerabilities',
                data: [0, 0, 2],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    const radarData = {
        labels: ['Bugs', 'Complexity', 'Code Smells', 'Vulnerabilities'],
        datasets: [
            {
                label: 'Project A',
                data: [5, 159, 51, 0],
                backgroundColor: 'rgba(255, 99, 132, 0.3)',
                borderColor: 'rgba(255, 99, 132, 1)',
            },
            {
                label: 'Project B',
                data: [1, 195, 61, 0],
                backgroundColor: 'rgba(54, 162, 235, 0.3)',
                borderColor: 'rgba(54, 162, 235, 1)',
            },
            {
                label: 'Project C',
                data: [16, 317, 188, 2],
                backgroundColor: 'rgba(255, 206, 86, 0.3)',
                borderColor: 'rgba(255, 206, 86, 1)',
            },
        ],
    };

    const options = { responsive: true, plugins: { legend: { position: 'top' } } };

    return (
        <div className="p-8 space-y-12">
            <h1 className="text-2xl font-bold">Software Quality Metrics</h1>

            <div>
                <h2 className="text-xl font-semibold mb-4">📊 Grouped Bar Chart</h2>
                <Bar data={groupedBarData} options={options} />
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">🕸 Radar Chart</h2>
                <Radar data={radarData} options={options} />
            </div>
        </div>
    );
}
