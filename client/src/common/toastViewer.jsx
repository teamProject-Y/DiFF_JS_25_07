"use client";
import React, { useEffect, useRef } from "react";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import {useTheme} from "@/common/thema";

export default function ToastViewer({ content, showImages = true }) {
    const viewerRef = useRef(null);
    const instanceRef = useRef(null);
    const theme = useTheme();

    useEffect(() => {
        let viewerInstance;

        const initViewer = async () => {
            const ViewerModule = await import("@toast-ui/editor/dist/toastui-editor-viewer");
            const Viewer = ViewerModule.default;

            if (viewerRef.current) {
                viewerInstance = new Viewer({
                    el: viewerRef.current,
                    initialValue: content || "",
                    theme: theme,
                    customHTMLSanitizer: (html) => {
                        if (!showImages) {
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
    }, [content, showImages, theme]);

    return <div ref={viewerRef} className="tui-viewer" />;
}
