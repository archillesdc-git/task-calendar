"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ColorPalette = "blue" | "purple" | "green" | "orange" | "red" | "pink";

interface ThemeContextType {
    theme: Theme;
    palette: ColorPalette;
    toggleTheme: () => void;
    setPalette: (palette: ColorPalette) => void;
    colors: {
        background: string;
        surface: string;
        text: string;
        textSecondary: string;
        border: string;
        primary: string;
        card: string;
        headerBg: string;
        headerText: string;
    };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const paletteColors = {
    blue: {
        light: "#5B7CE8",
        dark: "#3A5BA0",
        bgLight: "#F0F5FF",
        bgDark: "#0B1121",
    },
    purple: {
        light: "#9D4EDD",
        dark: "#7B2CBF",
        bgLight: "#FDF5FF",
        bgDark: "#1A0B2E",
    },
    green: {
        light: "#2D9F6C",
        dark: "#1F7A54",
        bgLight: "#F0FDF4",
        bgDark: "#051A0F",
    },
    orange: {
        light: "#FF8C42",
        dark: "#E67332",
        bgLight: "#FFF8F0",
        bgDark: "#261205",
    },
    red: {
        light: "#E63946",
        dark: "#C52A37",
        bgLight: "#FFF5F5",
        bgDark: "#29080A",
    },
    pink: {
        light: "#EC4899",
        dark: "#BE185D",
        bgLight: "#FDF2F8",
        bgDark: "#2D0A16",
    },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light");
    const [palette, setPaletteState] = useState<ColorPalette>("blue");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        const savedPalette = localStorage.getItem("palette") as ColorPalette | null;

        if (savedTheme === "dark" || savedTheme === "light") {
            setTheme(savedTheme);
        }
        if (
            savedPalette &&
            ["blue", "purple", "green", "orange", "red", "pink"].includes(savedPalette)
        ) {
            setPaletteState(savedPalette);
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            document.documentElement.classList.toggle("dark", theme === "dark");
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    const setPalette = (newPalette: ColorPalette) => {
        setPaletteState(newPalette);
        localStorage.setItem("palette", newPalette);
    };

    const activePalette = paletteColors[palette];
    const primaryColor = theme === "light" ? activePalette.light : activePalette.dark;
    const backgroundColor = theme === "light" ? activePalette.bgLight : activePalette.bgDark;
    const surfaceColor = theme === "light" ? "#FFFFFF" : "#1E1E1E";

    const colors =
        theme === "light"
            ? {
                background: backgroundColor,
                surface: surfaceColor,
                text: "#000",
                textSecondary: "#666",
                border: "#E0E0E0",
                primary: primaryColor,
                card: surfaceColor,
                headerBg: primaryColor,
                headerText: "#fff",
            }
            : {
                background: backgroundColor,
                surface: surfaceColor,
                text: "#FFFFFF",
                textSecondary: "#B0B0B0",
                border: "rgba(255, 255, 255, 0.1)",
                primary: primaryColor,
                card: "#2C2C2C",
                headerBg: "#1E1E1E",
                headerText: "#FFFFFF",
            };

    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, palette, toggleTheme, setPalette, colors }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}
