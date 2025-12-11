"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useNavigation } from "@/context/NavigationContext";
import { db } from "@/lib/firebase";
import NotificationsModal from "@/components/NotificationsModal";
import AppearanceModal from "@/components/AppearanceModal";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
    IoCalendar,
    IoCheckmarkDoneCircle,
    IoTrash,
    IoFolderOpen,
    IoNotifications,
    IoColorPalette,
    IoSunny,
    IoMoon,
    IoLogOut,
    IoCloudUpload,
} from "react-icons/io5";

interface NavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
}

function NavItem({ href, icon, label }: NavItemProps) {
    const { colors } = useTheme();
    const { startNavigation } = useNavigation();
    const pathname = usePathname();
    const router = useRouter();
    const isActive = pathname === href || (href === "/" && pathname === "/");
    const [hovered, setHovered] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        if (pathname !== href) {
            e.preventDefault();
            startNavigation();
            router.push(href);
        }
    };

    return (
        <Link
            href={href}
            onClick={handleClick}
            className="relative flex items-center justify-center p-2 rounded-lg transition-colors hover:bg-black/10"
            style={{ backgroundColor: isActive ? colors.primary + "20" : "transparent" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {icon}
            {hovered && (
                <div
                    className="absolute top-full mt-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-lg z-[100]"
                    style={{ backgroundColor: "#1a1a1a", whiteSpace: "nowrap" }}
                >
                    {label}
                    <div
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0"
                        style={{
                            borderLeft: "5px solid transparent",
                            borderRight: "5px solid transparent",
                            borderBottom: "5px solid #1a1a1a",
                        }}
                    />
                </div>
            )}
        </Link>
    );
}

interface IconButtonProps {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    className?: string;
    badge?: number;
}

function IconButton({ onClick, icon, label, className = "", badge }: IconButtonProps) {
    const [hovered, setHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            className={`relative p-2 rounded-lg transition-colors hover:opacity-80 ${className}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {icon}
            {badge !== undefined && badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                </span>
            )}
            {hovered && (
                <div
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-lg z-[100]"
                    style={{ backgroundColor: "#1a1a1a", whiteSpace: "nowrap" }}
                >
                    {label}
                    <div
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0"
                        style={{
                            borderLeft: "5px solid transparent",
                            borderRight: "5px solid transparent",
                            borderBottom: "5px solid #1a1a1a",
                        }}
                    />
                </div>
            )}
        </button>
    );
}

export default function Header() {
    const { user, logout } = useAuth();
    const { colors, theme, toggleTheme } = useTheme();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showAppearance, setShowAppearance] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Listen for unread notifications count
    useEffect(() => {
        if (!user) return;

        const notificationsQuery = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid),
            where("read", "==", false)
        );

        const unsubscribe = onSnapshot(
            notificationsQuery,
            (snapshot) => {
                setUnreadCount(snapshot.docs.length);
            },
            (error) => {
                console.error("Error fetching notification count:", error);
            }
        );

        return () => unsubscribe();
    }, [user]);

    if (!user) return null;

    return (
        <>
            <header
                className="sticky top-0 z-40 border-b"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Left: User Info */}
                    <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
                        style={{
                            backgroundColor: colors.primary + "15",
                            borderColor: colors.primary + "50",
                        }}
                    >
                        <Image
                            src={user.photoURL || "/default-avatar.png"}
                            alt={user.displayName || "User"}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                        />
                        <span className="text-sm font-semibold" style={{ color: colors.text }}>
                            {user.displayName || "Welcome"}
                        </span>
                    </div>

                    {/* Right: Navigation & Actions */}
                    <div className="flex items-center gap-2">
                        {/* Navigation */}
                        <div className="flex items-center gap-1 mr-2">
                            <NavItem
                                href="/"
                                icon={<IoCalendar size={22} color={colors.primary} />}
                                label="Dashboard"
                            />
                            <NavItem
                                href="/completed"
                                icon={<IoCheckmarkDoneCircle size={22} color={colors.primary} />}
                                label="Completed Tasks"
                            />
                            <NavItem
                                href="/trash"
                                icon={<IoTrash size={22} color={colors.primary} />}
                                label="Trash"
                            />
                            <NavItem
                                href="/notes"
                                icon={<IoFolderOpen size={22} color={colors.primary} />}
                                label="Notes & Folders"
                            />
                        </div>

                        {/* Divider */}
                        <div className="w-px h-6 mx-2" style={{ backgroundColor: colors.border }} />

                        {/* Actions */}
                        <IconButton
                            onClick={() => setShowNotifications(true)}
                            icon={<IoNotifications size={20} color={colors.primary} />}
                            label="Notifications"
                            className="bg-black/5"
                            badge={unreadCount}
                        />

                        <IconButton
                            onClick={() => setShowAppearance(true)}
                            icon={<IoColorPalette size={20} color={colors.primary} />}
                            label="Appearance"
                            className="bg-black/5"
                        />

                        <IconButton
                            onClick={toggleTheme}
                            icon={
                                theme === "dark" ? (
                                    <IoSunny size={20} color={colors.primary} />
                                ) : (
                                    <IoMoon size={20} color={colors.primary} />
                                )
                            }
                            label={theme === "dark" ? "Light Mode" : "Dark Mode"}
                            className="bg-black/5"
                        />

                        <IconButton
                            onClick={() => { }}
                            icon={<IoCloudUpload size={20} color={colors.primary} />}
                            label="Export to Sheets"
                            className="bg-black/5"
                        />

                        <IconButton
                            onClick={logout}
                            icon={<IoLogOut size={20} color="#FF3B30" />}
                            label="Log Out"
                            className="bg-red-500/10"
                        />
                    </div>
                </div>
            </header>

            {/* Modals */}
            <NotificationsModal
                visible={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
            <AppearanceModal
                visible={showAppearance}
                onClose={() => setShowAppearance(false)}
            />
        </>
    );
}
