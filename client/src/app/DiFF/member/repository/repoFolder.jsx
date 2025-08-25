'use client';

import { motion } from 'framer-motion';

export default function RepoFolder({ repositories, onSelect }) {
    return (
        <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
        >
            {repositories?.length > 0 ? (
                repositories.map((repo, idx) => (
                    <motion.div
                        key={repo.id}
                        layoutId={`repo-${repo.id}`} // ← Sidebar/Content와 연결되는 애니메이션 포인트
                        className="border border-gray-300 p-4 rounded-lg bg-white shadow-md cursor-pointer hover:bg-gray-100 transition"
                        onClick={() => onSelect(repo.id)}
                    >
                        <h3 className="font-bold text-lg mb-2">
                            {repo.name || `Repository ${idx + 1}`}
                        </h3>
                        <p className="text-sm text-gray-500 mb-1">
                            생성일: {new Date(repo.regDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                        })}
                        </p>
                        <p className="text-sm text-gray-500 mb-1">
                            커밋 ID: {repo.lastRqCommit || '없음'}
                        </p>
                    </motion.div>
                ))
            ) : (
                <p>등록된 레포지토리가 없습니다.</p>
            )}
        </motion.div>
    );
}