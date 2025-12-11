"use client";

import { useTheme } from "@/context/ThemeContext";
import { IoClose, IoColorPalette, IoCheckmark } from "react-icons/io5";

interface AppearanceModalProps {
    visible: boolean;
    onClose: () => void;
}

type ColorPalette = "blue" | "purple" | "green" | "orange" | "red" | "pink";

const palettes: { id: ColorPalette; name: string; color: string }[] = [
    { id: "blue", name: "Ocean Blue", color: "#5B7CE8" },
    { id: "purple", name: "Royal Purple", color: "#9D4EDD" },
    { id: "green", name: "Forest Green", color: "#2D9F6C" },
    { id: "orange", name: "Sunset Orange", color: "#FF8C42" },
    { id: "red", name: "Cherry Red", color: "#E63946" },
    { id: "pink", name: "Rose Pink", color: "#EC4899" },
];

export default function AppearanceModal({ visible, onClose }: AppearanceModalProps) {
    const { colors, palette, setPalette, theme, toggleTheme } = useTheme();

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20" onClick={onClose} />

            {/* Modal */}
            <div
                className="relative w-full max-w-xs rounded-2xl shadow-xl overflow-hidden z-10"
                style={{ backgroundColor: colors.surface }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between p-4 border-b"
                    style={{ borderColor: colors.border }}
                >
                    <div className="flex items-center gap-2">
                        <IoColorPalette size={20} color={colors.primary} />
                        <h2 className="text-lg font-bold" style={{ color: colors.text }}>
                            Appearance
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-black/10 transition-colors"
                    >
                        <IoClose size={20} color={colors.textSecondary} />
                    </button>
                </div>

                {/* Theme Toggle */}
                <div className="p-4 border-b" style={{ borderColor: colors.border }}>
                    <p className="text-sm font-semibold mb-3" style={{ color: colors.text }}>
                        Theme
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => theme === "dark" && toggleTheme()}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold border-2 transition-all ${theme === "light" ? "border-current" : "border-transparent"
                                }`}
                            style={{
                                backgroundColor: theme === "light" ? colors.primary + "20" : colors.background,
                                color: theme === "light" ? colors.primary : colors.textSecondary,
                                borderColor: theme === "light" ? colors.primary : "transparent",
                            }}
                        >
                            ☀️ Light
                        </button>
                        <button
                            onClick={() => theme === "light" && toggleTheme()}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold border-2 transition-all ${theme === "dark" ? "border-current" : "border-transparent"
                                }`}
                            style={{
                                backgroundColor: theme === "dark" ? colors.primary + "20" : colors.background,
                                color: theme === "dark" ? colors.primary : colors.textSecondary,
                                borderColor: theme === "dark" ? colors.primary : "transparent",
                            }}
                        >
                            🌙 Dark
                        </button>
                    </div>
                </div>

                {/* Color Palette */}
                <div className="p-4">
                    <p className="text-sm font-semibold mb-3" style={{ color: colors.text }}>
                        Color Palette
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {palettes.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setPalette(p.id)}
                                className="relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all hover:scale-105"
                                style={{
                                    borderColor: palette === p.id ? p.color : colors.border,
                                    backgroundColor: palette === p.id ? p.color + "15" : "transparent",
                                }}
                            >
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: p.color }}
                                >
                                    {palette === p.id && <IoCheckmark size={16} color="#fff" />}
                                </div>
                                <span
                                    className="text-xs font-medium"
                                    style={{ color: palette === p.id ? p.color : colors.textSecondary }}
                                >
                                    {p.name.split(" ")[0]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
