'use client';
import { BADGE_MAP } from './badges';

export default function TechBadges({ keys = [] }) {
    if (!keys.length) {
        return <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-400">없음</div>;
    }
    return (
        <div className="flex flex-wrap gap-2">
            {keys.map(k => {
                const b = BADGE_MAP[k];
                if (!b) return null;
                return <img key={k} src={b.url} alt={b.label} className="h-6" />;
            })}
        </div>
    );
}
