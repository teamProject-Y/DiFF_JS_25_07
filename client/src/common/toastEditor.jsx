"use client";
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import "highlight.js/styles/atom-one-dark.css";
import codeSyntaxHighlight from "@toast-ui/editor-plugin-code-syntax-highlight";
import { useTheme } from "@/common/thema";

// --- Cloudinary upload helper -------------------------------------------------
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

// --- Sticky layout CSS (toolbar stays fixed; only editor body scrolls) --------
const STICKY_CSS = `
[data-sticky-editor] .toastui-editor-defaultUI{
  height:100% !important; display:flex; flex-direction:column; border:0 !important;
}
[data-sticky-editor] .toastui-editor-toolbar{
  position:sticky; top:0; z-index:40; background:inherit; flex:0 0 auto;
}
[data-sticky-editor] .toastui-editor-main{
  flex:1 1 auto !important; min-height:0 !important; overflow:auto !important; /* only this scrolls */
}
[data-sticky-editor] .toastui-editor-main-container{
  display:flex !important; height:100% !important; min-height:0 !important;
}
[data-sticky-editor] .toastui-editor-md-container.toastui-editor-md-vertical-style,
[data-sticky-editor] .toastui-editor-preview.toastui-editor-vertical-style{
  flex:1 1 0% !important; min-width:0 !important; height:auto !important; min-height:100% !important;
}
/* remove inner vertical scroll to maximize click area */
[data-sticky-editor] .toastui-editor-md-container .CodeMirror{ height:auto !important; }
[data-sticky-editor] .toastui-editor-md-container .CodeMirror-scroll{
  min-height:100% !important; overflow-y:hidden !important; overflow-x:auto !important;
}
[data-sticky-editor] .toastui-editor-ww-container .ProseMirror{
  height:auto !important; min-height:100% !important; overflow:visible !important;
}
/* remove any tabs/mode switches entirely (safety) */
[data-sticky-editor] .toastui-editor-tabs,
[data-sticky-editor] .toastui-editor-mode-switch{
  display:none !important; pointer-events:none !important; width:0 !important; height:0 !important; overflow:hidden !important;
}
`;
const STICKY_STYLE_ID = "toast-sticky-css";

// --- Component ----------------------------------------------------------------
const ToastEditor = forwardRef(function ToastEditor(
    {
        initialValue = "",
        onChange,
        height = "100%",
        sticky = true,
    },
    ref
) {
    const editorEl = useRef(null);
    const instanceRef = useRef(null);
    const currTheme = useTheme(); // expected 'dark' | 'light'

    // Expose imperative API
    useImperativeHandle(ref, () => ({
        getMarkdown: () => instanceRef.current?.getMarkdown?.() ?? "",
        getHTML: () => instanceRef.current?.getHTML?.() ?? "",
        setMarkdown: (v) => instanceRef.current?.setMarkdown?.(v ?? "", false),
        reset: () => instanceRef.current?.setMarkdown?.("", false),
    }));

    useEffect(() => {
        if (!editorEl.current) return;

        // Prepare container & inject sticky CSS once
        if (sticky) {
            editorEl.current.setAttribute("data-sticky-editor", "1");
            if (!document.getElementById(STICKY_STYLE_ID)) {
                const style = document.createElement("style");
                style.id = STICKY_STYLE_ID;
                style.textContent = STICKY_CSS;
                document.head.appendChild(style);
            }
        }

        // Ensure container is empty before mounting the editor
        editorEl.current.textContent = "";
        editorEl.current.innerHTML = "";

        (async () => {
            // dynamic import to keep bundle slim
            const hljs = (await import("highlight.js")).default;

            instanceRef.current = new Editor({
                el: editorEl.current,
                height,
                initialEditType: "markdown",
                previewStyle: "vertical",
                initialValue: typeof initialValue === "string" ? initialValue : "",
                theme: currTheme === "dark" ? "dark" : undefined,
                hideModeSwitch: true, // we force vertical layout; tabs removed
                usageStatistics: false,
                codeBlockLanguages: ["javascript", "java", "python", "bash", "sql", "json"],
                plugins: [[codeSyntaxHighlight, { highlighter: hljs }]],
                toolbarItems: [
                    ["heading", "bold", "italic", "strike"],
                    ["hr", "quote"],
                    ["ul", "ol", "task", "indent", "outdent"],
                    ["table", "image", "link"],
                    ["code", "codeblock"],
                ],
            });

            // Clean up placeholder like "Write\nPreview" that can appear with empty init
            if (!initialValue) {
                const md0 = (instanceRef.current.getMarkdown() || "").trim();
                if (/^(write\s*\n\s*preview|preview\s*\n\s*write)$/i.test(md0)) {
                    instanceRef.current.setMarkdown("");
                }
            }

            // Remove tabs/mode-switch if any (belt & suspenders)
            const killTabs = () => {
                editorEl.current
                    ?.querySelectorAll(".toastui-editor-tabs, .toastui-editor-mode-switch")
                    ?.forEach((el) => el.remove());
            };
            killTabs();
            requestAnimationFrame(killTabs);
            setTimeout(killTabs, 0);
            setTimeout(killTabs, 120);

            // Manual highlight for preview pane as a fallback (plugin should handle code blocks)
            const applyHL = () => {
                editorEl.current?.querySelectorAll("pre code")?.forEach((block) => {
                    try { hljs.highlightElement(block); } catch {}
                });
            };

            // Change handler → bubble markdown + keep highlighting fresh
            instanceRef.current.on("change", () => {
                onChange?.(instanceRef.current.getMarkdown());
                applyHL();
            });

            // Image upload via official callback signature (works in WYSIWYG + MD)
            instanceRef.current.addHook("addImageBlobHook", async (blob, callback) => {
                try {
                    const url = await handleUpload(blob);
                    callback(url, blob?.name || "image");
                } catch (e) {
                    console.error("Image upload failed:", e);
                }
            });
        })();

        return () => {
            try { instanceRef.current?.destroy(); } catch {}
            instanceRef.current = null;
        };
    }, []); // mount once

    // Sync external initialValue only when it really changes to avoid clobbering edits
    useEffect(() => {
        if (!instanceRef.current) return;
        if (typeof initialValue !== "string") return;
        const curr = instanceRef.current.getMarkdown();
        if (initialValue !== curr) {
            instanceRef.current.setMarkdown(initialValue, false);
        }
    }, [initialValue]);

    // Respond to theme changes live (optional; re-theming requires full remount in TUI)
    // If live switching is needed, callers can key the component by theme.

    return <div ref={editorEl} />;
});

export default ToastEditor;
