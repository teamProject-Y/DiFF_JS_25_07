"use client";

import React, { useEffect, useRef } from "react";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import "highlight.js/styles/atom-one-dark.css";
import {useTheme} from "@/common/thema";

// 이미지 업로드 (Cloudinary 예시)
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

export default function ToastEditor({ initialValue = "", onChange }) {
    const editorRef = useRef(null);
    const instanceRef = useRef(null);
    let theme = useTheme();

    useEffect(() => {
        if (!editorRef.current) return;

        const initEditor = async () => {
            const highlightJs = (await import("highlight.js")).default;

            instanceRef.current = new Editor({
                el: editorRef.current,
                height: "100%",
                initialEditType: "markdown",
                previewStyle: "vertical",
                initialValue: initialValue || "",
                theme: theme,
                codeBlockLanguages: [
                    "javascript",
                    "java",
                    "python",
                    "bash",
                    "sql",
                    "json",
                ],
            });

            // highlight.js 적용
            instanceRef.current.on("change", () => {
                if (onChange) onChange(instanceRef.current.getMarkdown());
                editorRef.current
                    .querySelectorAll("pre code")
                    .forEach((block) => {
                        highlightJs.highlightElement(block);
                    });
            });

            // 이미지 업로드 hook
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
    }, []);

    // 외부에서 initialValue 갱신될 때 반영
    useEffect(() => {
        if (instanceRef.current && initialValue) {
            instanceRef.current.setMarkdown(initialValue, false);
        }
    }, [initialValue]);

    return <div ref={editorRef}></div>;
}
