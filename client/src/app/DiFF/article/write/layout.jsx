// app/DiFF/article/write/layout.jsx
export default function WriteLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-start justify-center p-6">
            <div className="w-full max-w-5xl bg-white dark:bg-neutral-800 shadow-md rounded-xl p-6">
                {children}
            </div>
        </div>
    );
}
