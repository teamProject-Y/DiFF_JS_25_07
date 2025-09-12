"use client";
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import "highlight.js/styles/atom-one-dark.css";
import codeSyntaxHighlight from "@toast-ui/editor-plugin-code-syntax-highlight";
import { useTheme } from "@/common/thema";

// Cloudinary 업로드
async function handleUpload(file) {
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
}

const ToastEditor = forwardRef(function ToastEditor({ initialValue = "", onChange }, ref) {
    const editorEl = useRef(null);
    const instanceRef = useRef(null);
    const theme = useTheme(); // 'dark' | 'light' 가정

    useImperativeHandle(ref, () => ({
        getMarkdown: () => instanceRef.current?.getMarkdown() ?? "",
        getHTML: () => instanceRef.current?.getHTML() ?? "",
        setMarkdown: (v) => instanceRef.current?.setMarkdown(v ?? "", false),
        reset: () => instanceRef.current?.setMarkdown("", false),
    }));

    useEffect(() => {
        if (!editorEl.current) return;

        (async () => {
            const hljs = (await import("highlight.js")).default;

            instanceRef.current = new Editor({
                el: editorEl.current,
                height: "100%",
                initialEditType: "markdown",
                previewStyle: "vertical",
                initialValue: initialValue || "",
                theme: theme === "dark" ? "dark" : undefined, // light는 undefined(기본)
                hideModeSwitch: false, // 필요시 true
                plugins: [[codeSyntaxHighlight, { highlighter: hljs }]],
                toolbarItems: [
                    ["heading", "bold", "italic", "strike"],
                    ["hr", "quote"],
                    ["ul", "ol", "task", "indent", "outdent"],
                    ["table", "image", "link"],
                    ["code", "codeblock"],
                ],
            });

            // 에디터 → 상위로 값 전달
            instanceRef.current.on("change", () => {
                onChange?.(instanceRef.current.getMarkdown());
            });

            // 이미지 업로드: callback 사용이 정석
            instanceRef.current.addHook("addImageBlobHook", async (blob, callback) => {
                try {
                    const url = await handleUpload(blob);
                    callback(url, blob?.name || "image");
                } catch (e) {
                    console.error("이미지 업로드 실패:", e);
                }
            });
        })();

        return () => {
            instanceRef.current?.destroy();
            instanceRef.current = null;
        };
    }, []); // 초기 1회

    // 외부 initialValue 갱신 반영
    useEffect(() => {
        if (instanceRef.current && typeof initialValue === "string") {
            instanceRef.current.setMarkdown(initialValue, false);
        }
    }, [initialValue]);

    return <div ref={editorEl} />;
});

export default ToastEditor;
