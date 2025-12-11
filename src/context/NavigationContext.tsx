"use client";

import { useTheme } from "@/context/ThemeContext";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface NavigationContextType {
    isNavigating: boolean;
    startNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextType>({
    isNavigating: false,
    startNavigation: () => { },
});

export const useNavigation = () => useContext(NavigationContext);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
    const [isNavigating, setIsNavigating] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Reset navigation state when route changes
    useEffect(() => {
        setIsNavigating(false);
    }, [pathname, searchParams]);

    const startNavigation = useCallback(() => {
        setIsNavigating(true);
    }, []);

    return (
        <NavigationContext.Provider value={{ isNavigating, startNavigation }}>
            {children}
        </NavigationContext.Provider>
    );
}

export function NavigationLoader() {
    const { isNavigating } = useNavigation();
    const { colors } = useTheme();

    if (!isNavigating) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ backgroundColor: colors.background + "f0" }}
        >
            <div className="flex flex-col items-center gap-4">
                {/* Spinner */}
                <div className="relative w-16 h-16">
                    <div
                        className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
                        style={{ borderColor: colors.primary, borderTopColor: "transparent" }}
                    />
                    <div
                        className="absolute inset-2 rounded-full border-4 border-b-transparent animate-spin"
                        style={{
                            borderColor: colors.primary + "60",
                            borderBottomColor: "transparent",
                            animationDirection: "reverse",
                            animationDuration: "0.8s",
                        }}
                    />
                </div>

                {/* Text */}
                <p className="text-sm font-semibold animate-pulse" style={{ color: colors.text }}>
                    Loading...
                </p>
            </div>
        </div>
    );
}
