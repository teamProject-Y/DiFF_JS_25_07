// app/DiFF/not-found.jsx

'use client'

export default function NotFound() {
    return (
        <>
            <style jsx global>{`
        .sideMenu { display: none !important; }
        .content { margin-left: 0 !important; width: 100% !important; }
      `}</style>

        <div className="p-20">
            <h1>DiFF 404</h1>
            <p>이 리소스를 찾을 수 없어.</p>
            <a href="/DiFF">/DiFF 홈으로</a>
        </div>
        </>
    )
}
