// app/DiFF/error.jsx
'use client'
export default function Error({ error, reset }) {
    return (
        <div className="p-20">
            <h2>DiFF에서 오류가 발생했어</h2>
            <pre>{String(error?.message || '')}</pre>
            <button onClick={() => reset()}>다시 시도</button>
        </div>
    )
}
