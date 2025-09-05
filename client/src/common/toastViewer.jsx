"use client";
import React, { useEffect, useRef } from "react";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import {useTheme} from "@/common/thema";
import "highlight.js/styles/atom-one-dark.css";

export default function ToastViewer({ content, showImages = true }) {
    const viewerRef = useRef(null);
    const instanceRef = useRef(null);
    let theme = useTheme();

    useEffect(() => {
        let viewerInstance;

        const initViewer = async () => {
            const ViewerModule = await import("@toast-ui/editor/dist/toastui-editor-viewer");
            const Viewer = ViewerModule.default;
            const hljs = (await import("highlight.js")).default; // highlight.js 가져오기

            if (viewerRef.current) {
                viewerInstance = new Viewer({
                    el: viewerRef.current,
                    initialValue: content || "",
                    theme: theme,
                    customHTMLSanitizer: (html) => {
                        if (!showImages) {
                            return html.replace(/<image[^>]*>/g, ""); // 이미지 제거 옵션
                        }
                        return html;
                    },
                });
                instanceRef.current = viewerInstance;

                // 코드블럭 하이라이트 적용
                viewerRef.current.querySelectorAll("pre code").forEach((block) => {
                    hljs.highlightElement(block);
                });
            }
        };

        initViewer();

        return () => {
            if (instanceRef.current && typeof instanceRef.current.destroy === "function") {
                instanceRef.current.destroy();
                instanceRef.current = null;
            }
        };
    }, [content, showImages, theme]);

    return <div ref={viewerRef} className="tui-viewer" />;
}
