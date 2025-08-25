'use client';

import { motion } from 'framer-motion';

export default function RepoFolder({ repositories, onSelect }) {
    return (
        <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-6"
        >
            {repositories?.length > 0 ? (
                repositories.map((repo, idx) => (
                    <motion.div
                        key={repo.id}
                        layoutId={`repo-${repo.id}`} // ← Sidebar/Content와 연결되는 애니메이션 포인트
                        className=""
                        onClick={() => onSelect(repo.id)}
                    >
                        <div className="flex justify-center"><i className="fa-solid fa-folder text-[9rem] text-neutral-300 cursor-pointer hover:text-neutral-400 transition"></i></div>
                        <h3 className="font-bold text-lg mb-2 text-center">
                            {repo.name || `Repository ${idx + 1}`}
                        </h3>
                    </motion.div>
                ))
            ) : (
                <p>등록된 레포지토리가 없습니다.</p>
            )}
        </motion.div>
    );
}