"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { IoCalendar } from "react-icons/io5";

// Snowflake component
function Snowflake({ style }: { style: React.CSSProperties }) {
    return (
        <div
            className="absolute text-white pointer-events-none animate-fall"
            style={style}
        >
            ❄
        </div>
    );
}

// Christmas Lights component
function ChristmasLights() {
    const colors = ["#ff0000", "#00ff00", "#ffff00", "#ff0000", "#00ff00", "#ffff00", "#ff0000", "#00ff00"];
    return (
        <div className="absolute top-0 left-0 right-0 flex justify-center gap-4 py-2">
            {colors.map((color, i) => (
                <div
                    key={i}
                    className="w-4 h-6 rounded-full animate-pulse"
                    style={{
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
                        animationDelay: `${i * 0.2}s`,
                    }}
                />
            ))}
        </div>
    );
}

export default function LoginPage() {
    const { user, signInWithGoogle, loading } = useAuth();
    const { colors } = useTheme();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push("/");
        }
    }, [user, router]);

    // Generate snowflakes
    const snowflakes = Array.from({ length: 20 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        animationDuration: `${3 + Math.random() * 5}s`,
        animationDelay: `${Math.random() * 3}s`,
        fontSize: `${10 + Math.random() * 15}px`,
        opacity: 0.6 + Math.random() * 0.4,
    }));

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
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{
                backgroundColor: colors.background,
                background: `linear-gradient(180deg, ${colors.background} 0%, #1a472a 100%)`,
            }}
        >
            {/* Snowflakes */}
            {snowflakes.map((style, i) => (
                <Snowflake key={i} style={style} />
            ))}

            {/* Christmas Lights at top */}
            <ChristmasLights />

            {/* Christmas decorations - corners */}
            <div className="absolute top-4 left-4 text-4xl animate-bounce" style={{ animationDuration: "2s" }}>🎄</div>
            <div className="absolute top-4 right-4 text-4xl animate-bounce" style={{ animationDuration: "2.5s" }}>🎅</div>
            <div className="absolute bottom-4 left-4 text-4xl animate-bounce" style={{ animationDuration: "2.2s" }}>🎁</div>
            <div className="absolute bottom-4 right-4 text-4xl animate-bounce" style={{ animationDuration: "1.8s" }}>⛄</div>

            <div
                className="w-full max-w-md p-8 rounded-3xl shadow-xl relative z-10"
                style={{
                    backgroundColor: colors.surface,
                    border: "3px solid #c41e3a",
                }}
            >
                {/* Holly decoration */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl">🎀</div>

                {/* Logo with Santa hat */}
                <div className="flex justify-center mb-8 relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl z-10" style={{ marginLeft: "15px" }}>🎅</div>
                    <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: "#c41e3a" + "30" }}
                    >
                        <IoCalendar size={48} color="#c41e3a" />
                    </div>
                </div>

                {/* Title */}
                <h1
                    className="text-3xl font-bold text-center mb-2"
                    style={{ color: colors.text }}
                >
                    🎄 Task Calendar 🎄
                </h1>
                <p
                    className="text-center mb-8"
                    style={{ color: colors.textSecondary }}
                >
                    ✨ Organize your tasks with a beautiful calendar ✨
                </p>

                {/* Login Button - Christmas styled */}
                <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl border-2 font-semibold transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                        backgroundColor: "#c41e3a",
                        borderColor: "#8b0000",
                        color: "white",
                    }}
                >
                    <FcGoogle size={24} />
                    Sign in with Google 🎁
                </button>

                {/* Features */}
                <div className="mt-10 space-y-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: "#c41e3a" + "20" }}
                        >
                            <span className="text-xl">🎄</span>
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
                            style={{ backgroundColor: "#228b22" + "20" }}
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
                            style={{ backgroundColor: "#ffd700" + "20" }}
                        >
                            <span className="text-xl">⭐</span>
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

                {/* Merry Christmas message */}
                <p className="text-center mt-6 text-sm font-semibold" style={{ color: "#c41e3a" }}>
                    🎅 Merry Christmas & Happy Holidays! 🎄
                </p>
            </div>
        </div>
    );
}
