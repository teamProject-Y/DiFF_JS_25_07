// ConfirmDialog.jsx
import React, {useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";
import {AnimatePresence, motion} from "framer-motion";
import {AlertTriangle, Info, CheckCircle2, XCircle} from "lucide-react";

function cx(...parts) {
    return parts.filter(Boolean).join(" ");
}

const intentMap = {
    danger: {
        icon: XCircle,
        text: "text-red-600 dark:text-red-400",
        btn: "bg-red-600 hover:bg-red-500 text-white",
        ring: "focus-visible:outline-red-500",
    },
    warning: {
        icon: AlertTriangle,
        text: "text-amber-600 dark:text-amber-400",
        btn: "bg-amber-600 hover:bg-amber-500 text-white",
        ring: "focus-visible:outline-amber-500",
    },
    success: {
        icon: CheckCircle2,
        text: "text-green-600 dark:text-green-400",
        btn: "bg-green-600 hover:bg-green-500 text-white",
        ring: "focus-visible:outline-green-500",
    },
    info: {
        icon: Info,
        text: "text-sky-600 dark:text-sky-400",
        btn: "bg-sky-600 hover:bg-sky-500 text-white",
        ring: "focus-visible:outline-sky-500",
    },
    neutral: {
        icon: Info,
        text: "text-neutral-700 dark:text-neutral-300",
        btn: "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white",
        ring: "focus-visible:outline-neutral-500",
    },
};

export default function ConfirmDialog({
                                          open,
                                          onOpenChange,
                                          title = "Are you sure?",
                                          message = "This action cannot be undone.",
                                          intent = "neutral",
                                          confirmText = "Confirm",
                                          cancelText = "Cancel",
                                          onConfirm,
                                          onCancel,
                                          closeOnOverlayClick = true,
                                          closeOnConfirm = true,
                                          closeOnEscape = true,
                                          showCancel = true,
                                          size = "md",
                                          hideIcon = false,
                                          className,
                                      }) {
    const [loading, setLoading] = useState(false);
    const cancelRef = useRef(null);
    const Icon = (intentMap[intent] || intentMap.neutral).icon;
    const sizeClass = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-lg" : "max-w-md";
    const titleId = "confirm-title";
    const descId = "confirm-desc";

    useEffect(() => {
        if (!open || !closeOnEscape) return;
        const onKey = (e) => {
            if (e.key === "Escape") onOpenChange(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, closeOnEscape, onOpenChange]);

    useEffect(() => {
        if (open && cancelRef.current) cancelRef.current.focus();
    }, [open]);

    const handleConfirm = async () => {
        if (!onConfirm) {
            if (closeOnConfirm) onOpenChange(false);
            return;
        }
        try {
            const result = onConfirm();
            if (result && typeof result.then === "function") {
                setLoading(true);
                await result;
            }
            if (closeOnConfirm) onOpenChange(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[9999] grid place-items-center">
                    {/* Overlay */}
                    <AnimatePresence>
                        <motion.button
                            aria-hidden
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            transition={{duration: 0.15}}
                            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                            onClick={() => closeOnOverlayClick && onOpenChange(false)}
                        />
                    </AnimatePresence>

                    {/* Dialog */}
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        aria-describedby={descId}
                        initial={{opacity: 0, scale: 0.96}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.98}}
                        transition={{duration: 0.18}}
                        className={cx(
                            "relative w-full rounded-lg border bg-white text-neutral-900 shadow-2xl ring-1 ring-black/5",
                            "dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700 dark:ring-0",
                            sizeClass,
                            className
                        )}
                    >
                        <div className="p-5">
                            <div className="flex items-start gap-3">
                                {!hideIcon && (
                                    <div className={cx("mt-0.5", intentMap[intent]?.text || intentMap.neutral.text)}>
                                        <Icon aria-hidden className="h-5 w-5"/>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div id={titleId} className="text-lg font-semibold">
                                        {title}
                                    </div>
                                    {message && (
                                        <p id={descId}
                                           className="mt-1 px-0.5 text-sm text-neutral-600 dark:text-neutral-400">
                                            {message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                {showCancel && (
                                    <button
                                        ref={cancelRef}
                                        onClick={() => {
                                            onCancel && onCancel();
                                            onOpenChange(false);
                                        }}
                                        className={cx(
                                            "rounded-md px-4 py-2 text-sm",
                                            "border border-neutral-200 bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
                                            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400",
                                            "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
                                            "dark:focus-visible:outline-neutral-500"
                                        )}
                                    >
                                        {cancelText}
                                    </button>
                                )}
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className={cx(
                                        "rounded-md px-4 py-2 text-sm",
                                        intentMap[intent]?.btn || intentMap.neutral.btn,
                                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                                        intentMap[intent]?.ring || intentMap.neutral.ring,
                                        loading && "opacity-90 cursor-not-allowed"
                                    )}
                                >
                                    {loading ? (
                                        <span className="inline-flex items-center gap-2">
                                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden>
                                            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor"
                                                    strokeWidth="4" opacity="0.25"/>
                                            <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor"
                                                  strokeWidth="4"/>
                                          </svg>
                                          Processing...
                                        </span>
                                    ) : (
                                        confirmText
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

ConfirmDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onOpenChange: PropTypes.func.isRequired,
    title: PropTypes.node,
    message: PropTypes.node,
    intent: PropTypes.oneOf(["danger", "warning", "success", "info", "neutral"]),
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    closeOnOverlayClick: PropTypes.bool,
    closeOnConfirm: PropTypes.bool,
    closeOnEscape: PropTypes.bool,
    showCancel: PropTypes.bool,
    size: PropTypes.oneOf(["sm", "md", "lg"]),
    hideIcon: PropTypes.bool,
    className: PropTypes.string,
};