// app/DiFF/error.jsx
'use client'

export default function Error({ error, reset }) {
    return (
        <>
            <style jsx global>{`
        /* 예시: 왼쪽 메뉴가 .leftAside, 컨텐츠 래퍼가 .content 일 때 */
        .sideMenu { display: none !important; }
        .content { margin-left: 0 !important; width: 100% !important; }
      `}</style>

        <div className="p-20">
            <h2>DiFF에서 오류가 발생했어</h2>
            <pre>{String(error?.message || '')}</pre>
            <button onClick={() => reset()}>다시 시도</button>
        </div>
            </>
    )
}
