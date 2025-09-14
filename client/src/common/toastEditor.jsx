"use client";

import React, { useEffect, useRef } from "react";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import "highlight.js/styles/atom-one-dark.css";
import { useTheme } from "@/common/thema";

// 이미지 업로드 (Cloudinary)
const handleUpload = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "teamproject_Y");
    data.append("cloud_name", "dc12fahac");

    const res = await fetch(
        "https://api.cloudinary.com/v1_1/dc12fahac/image/upload",
        { method: "POST", body: data }
    );
    const result = await res.json();
    return result.secure_url;
};

// 에디터 레이아웃 패치 CSS
const STICKY_CSS = `
[data-sticky-editor] .toastui-editor-defaultUI{
  height:100% !important; display:flex; flex-direction:column; border:0 !important;
}
[data-sticky-editor] .toastui-editor-toolbar{
  position:sticky; top:0; z-index:40; background:inherit; flex:0 0 auto;
}
[data-sticky-editor] .toastui-editor-main{
  flex:1 1 auto !important; min-height:0 !important; overflow:auto !important; /* ← 여기만 스크롤 */
}
[data-sticky-editor] .toastui-editor-main-container{
  display:flex !important; height:100% !important; min-height:0 !important;
}
[data-sticky-editor] .toastui-editor-md-container.toastui-editor-md-vertical-style,
[data-sticky-editor] .toastui-editor-preview.toastui-editor-vertical-style{
  flex:1 1 0% !important; min-width:0 !important; height:auto !important; min-height:100% !important;
}
/* 내부 세로 스크롤 제거 (클릭 영역 전체 확보) */
[data-sticky-editor] .toastui-editor-md-container .CodeMirror{ height:auto !important; }
[data-sticky-editor] .toastui-editor-md-container .CodeMirror-scroll{
  min-height:100% !important; overflow-y:hidden !important; overflow-x:auto !important;
}
[data-sticky-editor] .toastui-editor-ww-container .ProseMirror{
  height:auto !important; min-height:100% !important; overflow:visible !important;
}
/* 탭/모드 스위치 완전 제거(혹시 생겨도) */
[data-sticky-editor] .toastui-editor-tabs,
[data-sticky-editor] .toastui-editor-mode-switch{
  display:none !important; pointer-events:none !important; width:0 !important; height:0 !important; overflow:hidden !important;
}
`;

export default function ToastEditor({ initialValue = "", onChange }) {
    const editorRef = useRef(null);
    const instanceRef = useRef(null);
    const theme = useTheme();

    useEffect(() => {
        if (!editorRef.current) return;

        editorRef.current.setAttribute("data-sticky-editor", "1");
        if (!document.getElementById("toast-sticky-css")) {
            const s = document.createElement("style");
            s.id = "toast-sticky-css";
            s.textContent = STICKY_CSS;
            document.head.appendChild(s);
        }

        editorRef.current.textContent = "";
        editorRef.current.innerHTML = "";

        const initEditor = async () => {
            const highlightJs = (await import("highlight.js")).default;

            instanceRef.current = new Editor({
                el: editorRef.current,
                height: "100%",
                initialEditType: "markdown",
                previewStyle: "vertical",
                hideModeSwitch: true,
                usageStatistics: false,
                initialValue: typeof initialValue === "string" ? initialValue : "",
                theme: theme,
                codeBlockLanguages: ["javascript", "java", "python", "bash", "sql", "json"],
            });

            if (!initialValue) {
                const md0 = (instanceRef.current.getMarkdown() || "").trim();
                if (/^(write\s*\n\s*preview|preview\s*\n\s*write)$/i.test(md0)) {
                    instanceRef.current.setMarkdown("");
                }
            }

            const killTabs = () => {
                editorRef.current
                    ?.querySelectorAll(".toastui-editor-tabs, .toastui-editor-mode-switch")
                    ?.forEach((el) => el.remove());
            };
            killTabs();
            requestAnimationFrame(killTabs);
            setTimeout(killTabs, 0);
            setTimeout(killTabs, 100);

            const applyHL = () => {
                editorRef.current?.querySelectorAll("pre code")?.forEach((block) => {
                    highlightJs.highlightElement(block);
                });
            };
            applyHL();
            instanceRef.current.on("change", () => {
                onChange?.(instanceRef.current.getMarkdown());
                applyHL();
            });

            instanceRef.current.addHook("addImageBlobHook", async (blob) => {
                try {
                    const url = await handleUpload(blob);
                    instanceRef.current.insertText(`![image](${url})`);
                } catch (e) {
                    console.error("이미지 업로드 실패:", e);
                }
            });
        };

        initEditor();

        return () => instanceRef.current?.destroy();
    }, []); // mount only

    useEffect(() => {
        if (!instanceRef.current) return;
        if (typeof initialValue !== "string") return;
        const curr = instanceRef.current.getMarkdown();
        if (initialValue && initialValue !== curr) {
            instanceRef.current.setMarkdown(initialValue, false);
        }
    }, [initialValue]);

    return <div ref={editorRef} />;
}
