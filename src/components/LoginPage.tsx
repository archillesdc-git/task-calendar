"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { IoCalendar } from "react-icons/io5";

export default function LoginPage() {
    const { user, signInWithGoogle, loading } = useAuth();
    const { colors } = useTheme();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push("/");
        }
    }, [user, router]);

    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: colors.background }}
            >
                <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.primary }} />
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ backgroundColor: colors.background }}
        >
            <div
                className="w-full max-w-md p-8 rounded-3xl shadow-xl"
                style={{ backgroundColor: colors.surface }}
            >
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: colors.primary + "20" }}
                    >
                        <IoCalendar size={48} color={colors.primary} />
                    </div>
                </div>

                {/* Title */}
                <h1
                    className="text-3xl font-bold text-center mb-2"
                    style={{ color: colors.text }}
                >
                    Task Calendar
                </h1>
                <p
                    className="text-center mb-8"
                    style={{ color: colors.textSecondary }}
                >
                    Organize your tasks with a beautiful calendar
                </p>

                {/* Login Button */}
                <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl border-2 font-semibold transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        color: colors.text,
                    }}
                >
                    <FcGoogle size={24} />
                    Sign in with Google
                </button>

                {/* Features */}
                <div className="mt-10 space-y-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "#34C759" + "20" }}
                        >
                            <span className="text-xl">📅</span>
                        </div>
                        <div>
                            <p className="font-semibold" style={{ color: colors.text }}>
                                Calendar View
                            </p>
                            <p className="text-sm" style={{ color: colors.textSecondary }}>
                                See all your tasks at a glance
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "#FF9500" + "20" }}
                        >
                            <span className="text-xl">🎨</span>
                        </div>
                        <div>
                            <p className="font-semibold" style={{ color: colors.text }}>
                                Multiple Themes
                            </p>
                            <p className="text-sm" style={{ color: colors.textSecondary }}>
                                Customize with beautiful color palettes
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "#5B7CE8" + "20" }}
                        >
                            <span className="text-xl">☁️</span>
                        </div>
                        <div>
                            <p className="font-semibold" style={{ color: colors.text }}>
                                Cloud Sync
                            </p>
                            <p className="text-sm" style={{ color: colors.textSecondary }}>
                                Your tasks sync across all devices
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
