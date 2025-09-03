"use client";
import React, { useEffect, useRef } from "react";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import {useTheme} from "@/common/thema";

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
    const theme = useTheme();

    useEffect(() => {
        if (!editorRef.current) return;

        instanceRef.current = new Editor({
            el: editorRef.current,
            height: "500px",
            initialEditType: "markdown",
            previewStyle: "vertical",
            initialValue: initialValue || "",
            theme: theme,
        });

        instanceRef.current.addHook("addImageBlobHook", async (blob) => {
            try {
                const url = await handleUpload(blob);
                instanceRef.current.insertText(`![image](${url})`);
            } catch (e) {
                console.error("이미지 업로드 실패:", e);
            }
        });

        instanceRef.current.on("change", () => {
            if (onChange) onChange(instanceRef.current.getMarkdown());
        });

        return () => instanceRef.current?.destroy();
    }, []);

    useEffect(() => {
        if (instanceRef.current && initialValue) {
            instanceRef.current.setMarkdown(initialValue, false); // false = 커서 유지
        }
    }, [initialValue]);

    return <div ref={editorRef}></div>;
}
