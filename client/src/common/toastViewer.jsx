"use client";
import React, { useEffect, useRef } from "react";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";

export default function ToastViewer({ content, showImages = true }) {
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
                    // 이미지 제거 여부 제어
                    customHTMLSanitizer: (html) => {
                        if (!showImages) {
                            // <img> 태그를 전부 제거
                            return html.replace(/<img[^>]*>/g, "");
                        }
                        return html;
                    },
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
    }, [content, showImages]);

    return <div ref={viewerRef}></div>;
}
