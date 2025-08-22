"use client";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function ModalLayout({ children, modal }) {
    const router = useRouter();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <motion.div
                className="relative w-[800px] h-[500px] bg-white rounded-2xl overflow-hidden flex"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
            >
                {/* 왼쪽 블럭 */}
                <div className="w-1/2 bg-black text-white flex flex-col items-center justify-center p-6">
                    <button
                        onClick={() => router.back()}
                        className="absolute top-4 right-4 text-white"
                    >
                        ✕
                    </button>
                    <div className="text-6xl">➡</div>
                </div>

                {/* 오른쪽 블럭에 children (login / join 폼) 렌더링 */}
                <div className="w-1/2 p-8 flex items-center justify-center">
                    {children}
                    {modal}
                </div>
            </motion.div>
        </div>
    );
}
