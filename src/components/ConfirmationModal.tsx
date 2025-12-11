"use client";

import { useTheme } from "@/context/ThemeContext";

interface ConfirmationModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
}

export default function ConfirmationModal({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    isDestructive = false,
    isLoading = false,
}: ConfirmationModalProps) {
    const { colors } = useTheme();

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">
            <div
                className="w-full max-w-sm rounded-2xl overflow-hidden"
                style={{ backgroundColor: colors.surface }}
            >
                {/* Content */}
                <div className="p-6 text-center">
                    <div
                        className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDestructive ? "bg-red-100" : "bg-blue-100"
                            }`}
                    >
                        {isDestructive ? (
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        ) : (
                            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>

                    <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                        {title}
                    </h3>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-4 border-t" style={{ borderColor: colors.border }}>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-lg font-semibold text-sm transition-colors hover:opacity-80"
                        style={{ backgroundColor: colors.background, color: colors.text }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-lg font-bold text-sm text-white transition-colors hover:opacity-90 disabled:opacity-70 flex items-center justify-center"
                        style={{ backgroundColor: isDestructive ? "#FF3B30" : colors.primary }}
                    >
                        {isLoading ? (
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
