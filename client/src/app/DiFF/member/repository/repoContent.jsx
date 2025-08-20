'use client';

import { motion } from 'framer-motion';

export default function RepoContent({ repo, onClose }) {
    if (!repo) return null;

    return (
        <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 grid grid-cols-[1fr_300px] gap-0"
        >
            {/* 가운데 본문 */}
            <div className="p-6 overflow-y-auto">
                {/* 상단 헤더 카드: Sidebar/Folder와 연결되는 애니메이션 래핑 */}
                <motion.div layoutId={`repo-${repo.id}`} className="border rounded p-4 mb-4 bg-white">
                    <h2 className="text-xl font-semibold">{repo.name}</h2>
                    <p className="text-sm text-gray-600">
                        owner: {repo.owner || 'me'}
                    </p>
                </motion.div>

                <div className="border rounded p-4 mb-4 bg-white">
                    <strong>README / About</strong>
                    <p className="text-gray-600 mt-2">
                        레포지토리 설명 또는 최근 커밋 정보가 들어갈 자리.
                    </p>
                </div>

                <div className="border rounded p-4 bg-white">
                    <strong>Activity</strong>
                    <p className="text-gray-600 mt-2">커밋/이슈/PR 그래프 등을 표시.</p>
                </div>
            </div>

            {/* 오른쪽 패널 */}
            <div className="p-6 border-l bg-gray-50">
                <div className="border rounded p-4 mb-4 bg-white">
                    <strong>메타 정보</strong>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                        <div>생성일: {repo.regDate?.split('T')[0]}</div>
                        <div>커밋 ID: {repo.lastRqCommit || '없음'}</div>
                    </div>
                </div>

                <div className="border rounded p-4 mb-4 bg-white">
                    <strong>Stats</strong>
                    <p className="text-gray-600 mt-2">원형 차트 자리</p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-2 bg-neutral-800 text-white rounded hover:bg-neutral-700"
                >
                    닫기
                </button>
            </div>
        </motion.div>
    );
}
