"use client";

import React, { useEffect, useRef } from "react";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";

import "prismjs/themes/prism.css";
import "@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css";
import Prism from "prismjs";
import codeSyntaxHighlight from "@toast-ui/editor-plugin-code-syntax-highlight";

import "highlight.js/styles/atom-one-dark.css";
import { useTheme } from "@/common/thema";

const handleUpload = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "teamproject_Y");
    data.append("cloud_name", "dc12fahac");

    const res = await fetch("https://api.cloudinary.com/v1_1/dc12fahac/image/upload", {
        method: "POST",
        body: data,
    });
    const result = await res.json();
    return result.secure_url;
};

const STICKY_CSS = `
[data-sticky-editor] .toastui-editor-tabs,
[data-sticky-editor] .toastui-editor-mode-switch{
  display:none !important; pointer-events:none !important; width:0 !important; height:0 !important; overflow:hidden !important;
}
[data-sticky-editor] .toastui-editor-defaultUI{
  height:100% !important; display:flex; flex-direction:column; border:0 !important;
}
[data-sticky-editor] .toastui-editor-toolbar{
  position:sticky; top:0; z-index:40; background:inherit; flex:0 0 auto;
}
[data-sticky-editor] .toastui-editor-main{
  flex:1 1 auto !important; min-height:0 !important; overflow:auto !important;
}
[data-sticky-editor] .toastui-editor-main-container{
  display:flex !important; height:100% !important; min-height:0 !important;
}
[data-sticky-editor] .toastui-editor-md-container.toastui-editor-md-vertical-style,
[data-sticky-editor] .toastui-editor-preview.toastui-editor-vertical-style{
  flex:1 1 0% !important; min-width:0 !important; height:auto !important; min-height:100% !important;
}
[data-sticky-editor] .toastui-editor-md-container .CodeMirror{ height:auto !important; }
[data-sticky-editor] .toastui-editor-md-container .CodeMirror-scroll{
  min-height:100% !important; overflow-y:hidden !important; overflow-x:auto !important;
}
[data-sticky-editor] .toastui-editor-ww-container .ProseMirror{
  height:auto !important; min-height:100% !important; overflow:visible !important;
}
`;

export default function ToastEditor({ initialValue = "", onChange }) {
    const editorRef = useRef(null);
    const instanceRef = useRef(null);
    const touchedRef = useRef(false);
    const hydratedRef = useRef(false);
    const theme = useTheme();

    useEffect(() => {
        if (!editorRef.current) return;

        editorRef.current.setAttribute("data-sticky-editor", "1");
        editorRef.current.classList.add("notranslate");
        editorRef.current.setAttribute("translate", "no");

        if (!document.getElementById("toast-sticky-css")) {
            const s = document.createElement("style");
            s.id = "toast-sticky-css";
            s.textContent = STICKY_CSS;
            document.head.appendChild(s);
        }

        instanceRef.current = new Editor({
            el: editorRef.current,
            height: "100%",
            initialEditType: "markdown",
            previewStyle: "vertical",
            hideModeSwitch: true,
            usageStatistics: false,
            initialValue: typeof initialValue === "string" ? initialValue : "",
            theme,
            codeBlockLanguages: ["javascript", "java", "python", "bash", "sql", "json"],
            plugins: [[codeSyntaxHighlight, { highlighter: Prism }]],
        });

        if (!initialValue) {
            Promise.resolve().then(() => {
                if (!instanceRef.current || touchedRef.current) return;
                const md0 = (instanceRef.current.getMarkdown() || "").trim();
                if (!md0 || /^(write\s*\n\s*preview|preview\s*\n\s*write)$/i.test(md0)) {
                    instanceRef.current.setMarkdown("", false);
                }
            });
        }

        instanceRef.current.on("change", () => {
            touchedRef.current = true;
            onChange?.(instanceRef.current.getMarkdown());
        });

        instanceRef.current.addHook("addImageBlobHook", async (blob, callback) => {
            try {
                const url = await handleUpload(blob);
                callback(url, blob?.name ?? "image");
            } catch (e) {
                console.error("이미지 업로드 실패:", e);
            }
        });

        return () => {
            try {
                instanceRef.current?.destroy();
            } catch (e) {
                console.warn("ToastEditor destroy skipped:", e);
            } finally {
                instanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!instanceRef.current) return;
        if (hydratedRef.current) return;
        if (!initialValue) return;
        if (touchedRef.current) return;

        const curr = instanceRef.current.getMarkdown() || "";
        if (!curr.trim()) {
            instanceRef.current.setMarkdown(initialValue, false);
            hydratedRef.current = true;
        }
    }, [initialValue]);

    return <div ref={editorRef} />;
}