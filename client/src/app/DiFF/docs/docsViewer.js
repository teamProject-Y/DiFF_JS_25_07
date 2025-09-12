'use client';

import dynamic from "next/dynamic";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";

const Viewer = dynamic(
    () => import("@toast-ui/react-editor").then((m) => m.Viewer),
    { ssr: false }
);

export default function DocsViewer({ content }) {
    return (
        <div className="toast-viewer text-gray-800 dark:text-neutral-300">
            <Viewer initialValue={content} />
        </div>
    );
}
