"use client";
import React, { useEffect, useRef } from "react";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";

export default function ToastViewer({ content }) {
    const viewerRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        let viewerInstance;

        const initViewer = async () => {
            const ViewerModule = await import("@toast-ui/editor/dist/toastui-editor-viewer");
            const Viewer = ViewerModule.default;

            if (viewerRef.current) {
                viewerInstance = new Viewer({
                    el: viewerRef.current,
                    initialValue: content || "",
                    customHTMLSanitizer: (html) => html,
                });
                instanceRef.current = viewerInstance;
            }
        };

        initViewer();

        return () => {
            if (instanceRef.current && typeof instanceRef.current.destroy === "function") {
                instanceRef.current.destroy();
                instanceRef.current = null;
            }
        };
    }, [content]);

    return <div ref={viewerRef}></div>;
}
