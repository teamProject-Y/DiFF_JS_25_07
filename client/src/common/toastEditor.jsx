"use client";
import React, { useEffect, useRef } from "react";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

// Cloudinary 업로드 함수
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
    return result.secure_url; // 업로드된 URL 반환
};

export default function ToastEditor({ initialValue = "", onChange }) {
    const editorRef = useRef();

    useEffect(() => {
        const instance = new Editor({
            el: editorRef.current,
            height: "500px",
            initialEditType: "markdown",
            previewStyle: "vertical",
            initialValue: initialValue || "",
        });

        instance.addHook("addImageBlobHook", async (blob /* , callback */) => {
            try {
                const url = await handleUpload(blob);
                instance.insertText(`![image](${url})`);
            } catch (e) {
                console.error("이미지 업로드 실패:", e);
            }
        });

        instance.on("change", () => {
            if (onChange) onChange(instance.getMarkdown());
        });

        return () => instance.destroy();
    }, [initialValue]);

    return <div ref={editorRef}></div>;
}
