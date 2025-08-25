// 'use client';
//
// import { motion } from 'framer-motion';
//
// export default function RepoFolderbar({ repositories, selectedRepoId, onSelect }) {
//     return (
//         <motion.aside
//             key="rail"
//             initial={{ x: -40, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             exit={{ x: -40, opacity: 0 }}
//             transition={{ type: "spring", stiffness: 120, damping: 20 }}
//             className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto"
//         >
//             <div className="p-4 font-semibold text-gray-600 border-b">Repositories</div>
//             <ul className="p-2 space-y-2">
//                 {repositories.map((repo) => (
//                     <motion.li
//                         key={repo.id}
//                         layoutId={`repo-${repo.id}`} // ← Grid 카드와 이어지는 layoutId
//                         onClick={() => onSelect(repo.id)}
//                         className={`p-3 rounded cursor-pointer text-sm ${
//                             selectedRepoId === repo.id
//                                 ? "bg-indigo-100 border border-indigo-400"
//                                 : "hover:bg-gray-100"
//                         }`}
//                     >
//                         📂 {repo.name}
//                     </motion.li>
//                 ))}
//             </ul>
//         </motion.aside>
//     );
// }
