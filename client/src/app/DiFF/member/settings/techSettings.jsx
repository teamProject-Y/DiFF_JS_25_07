'use client';

import { useEffect, useState } from 'react';
import { BADGE_KEYS, BADGE_MAP } from '@/common/techBadges/badges';
import { getMyTechKeys, saveMyTechKeys } from '@/lib/TechAPI';

export default function TechSettings() {
    const [selected, setSelected] = useState([]); // ["java","react"]
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const keys = await getMyTechKeys();
                setSelected(Array.isArray(keys) ? keys : []);
            } catch {
                setSelected([]);
            }
        })();
    }, []);

    const toggle = (key) => {
        setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    const onSave = async () => {
        try {
            setSaving(true);
            await saveMyTechKeys(selected);
            setMessage('저장 완료!');
            setTimeout(() => setMessage(''), 1200);
        } catch {
            setMessage('저장 실패');
            setTimeout(() => setMessage(''), 1500);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl">

            <br/>

            {/* 후보 목록 그리드: 꺼짐(그레이) / 켜짐(원색) */}
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {BADGE_KEYS.map(key => {
                    const b = BADGE_MAP[key];
                    const on = selected.includes(key);
                    return (
                        <li key={key}>
                            <button
                                type="button"
                                onClick={() => toggle(key)}
                                className={
                                    "w-full rounded-md border p-2 flex items-center justify-center " +
                                    (on ? "bg-white border-gray-300" : "bg-gray-100 border-gray-200 opacity-60 grayscale")
                                }
                                title={b.label}
                                aria-pressed={on}
                            >
                                <img src={b.url} alt={b.label} className="h-6" />
                            </button>
                        </li>
                    );
                })}
            </ul>

            <div className="mt-5 flex items-center gap-3">
                <button
                    type="button"
                    onClick={onSave}
                    disabled={saving}
                    className="rounded bg-neutral-900 px-5 py-2 text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                    {saving ? '저장중…' : '저장'}
                </button>
                {message && <span className="text-sm text-gray-600">{message}</span>}
            </div>
        </div>
    );
}
