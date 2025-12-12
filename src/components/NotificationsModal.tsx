"use client";

import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    writeBatch,
    Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoClose, IoNotifications, IoCheckmarkDone, IoTrash } from "react-icons/io5";

interface Notification {
    id: string;
    title: string;
    message: string;
    createdAt: Date;
    read: boolean;
    type: "task_due" | "task_completed" | "system";
}

interface NotificationsModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function NotificationsModal({ visible, onClose }: NotificationsModalProps) {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [clearModalVisible, setClearModalVisible] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    // Fetch notifications for current user
    useEffect(() => {
        if (!user || !visible) return;

        setLoading(true);
        // Note: We query without orderBy to avoid needing a composite index
        // Sorting is done client-side instead
        const notificationsQuery = query(
            collection(db, "notifications"),
            where("userId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(
            notificationsQuery,
            (snapshot) => {
                const notificationsData = snapshot.docs.map((docSnap) => {
                    const data = docSnap.data();
                    return {
                        id: docSnap.id,
                        title: data.title,
                        message: data.message,
                        createdAt: data.createdAt instanceof Timestamp
                            ? data.createdAt.toDate()
                            : new Date(data.createdAt),
                        read: data.read || false,
                        type: data.type || "system",
                    } as Notification;
                });
                // Sort by createdAt descending (newest first) - client-side
                notificationsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                setNotifications(notificationsData);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching notifications:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, visible]);

    const markAsRead = async (notificationId: string) => {
        try {
            const notificationRef = doc(db, "notifications", notificationId);
            await updateDoc(notificationRef, { read: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        if (!user || notifications.length === 0) return;

        try {
            const batch = writeBatch(db);
            const unreadNotifications = notifications.filter((n) => !n.read);

            unreadNotifications.forEach((notification) => {
                const notificationRef = doc(db, "notifications", notification.id);
                batch.update(notificationRef, { read: true });
            });

            await batch.commit();
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            await deleteDoc(doc(db, "notifications", notificationId));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const handleClearAllClick = () => {
        if (!user || notifications.length === 0) return;
        setClearModalVisible(true);
    };

    const confirmClearAll = async () => {
        if (!user || notifications.length === 0) return;

        setIsClearing(true);
        try {
            const batch = writeBatch(db);
            notifications.forEach((notification) => {
                const notificationRef = doc(db, "notifications", notification.id);
                batch.delete(notificationRef);
            });
            await batch.commit();
            setClearModalVisible(false);
        } catch (error) {
            console.error("Error clearing notifications:", error);
        } finally {
            setIsClearing(false);
        }
    };

    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
        return date.toLocaleDateString();
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20" onClick={onClose} />

            {/* Modal */}
            <div
                className="relative w-full max-w-sm rounded-2xl shadow-xl overflow-hidden z-10 border"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between p-4 border-b"
                    style={{ borderColor: colors.border }}
                >
                    <div className="flex items-center gap-2">
                        <IoNotifications size={20} color={colors.primary} />
                        <h2 className="text-lg font-bold" style={{ color: colors.text }}>
                            Notifications
                        </h2>
                        {unreadCount > 0 && (
                            <span
                                className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                                style={{ backgroundColor: colors.primary }}
                            >
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-black/10 transition-colors"
                    >
                        <IoClose size={20} color={colors.textSecondary} />
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 flex justify-center">
                            <div
                                className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                                style={{ borderColor: colors.primary, borderTopColor: "transparent" }}
                            />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <IoNotifications size={48} color={colors.textSecondary} className="mx-auto mb-2 opacity-30" />
                            <p style={{ color: colors.textSecondary }}>No notifications yet</p>
                            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                                You'll see task reminders and updates here
                            </p>
                        </div>
                    ) : (
                        <div>
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                    className={`p-4 border-b hover:bg-black/5 transition-colors cursor-pointer group ${!notification.read ? "bg-blue-50/30" : ""
                                        }`}
                                    style={{ borderColor: colors.border }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.read ? "bg-gray-300" : ""
                                                }`}
                                            style={{
                                                backgroundColor: notification.read ? undefined : colors.primary,
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3
                                                    className={`text-sm ${notification.read ? "font-medium" : "font-bold"}`}
                                                    style={{ color: colors.text }}
                                                >
                                                    {notification.title}
                                                </h3>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 transition-opacity"
                                                >
                                                    <IoTrash size={14} color="#FF3B30" />
                                                </button>
                                            </div>
                                            <p className="text-xs mt-1 line-clamp-2" style={{ color: colors.textSecondary }}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs mt-2 opacity-60" style={{ color: colors.textSecondary }}>
                                                {getTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div
                        className="flex items-center justify-between p-3 border-t"
                        style={{ borderColor: colors.border }}
                    >
                        <button
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                            className="flex items-center gap-1 text-sm font-semibold hover:opacity-80 disabled:opacity-40"
                            style={{ color: colors.primary }}
                        >
                            <IoCheckmarkDone size={16} />
                            Mark all read
                        </button>
                        <button
                            onClick={handleClearAllClick}
                            className="flex items-center gap-1 text-sm font-semibold hover:opacity-80"
                            style={{ color: "#FF3B30" }}
                        >
                            <IoTrash size={14} />
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Clear All Confirmation Modal */}
            <ConfirmationModal
                visible={clearModalVisible}
                onClose={() => setClearModalVisible(false)}
                onConfirm={confirmClearAll}
                title="Clear All Notifications?"
                message="All notifications will be permanently deleted. This action cannot be undone."
                confirmText="Clear All"
                isDestructive={true}
                isLoading={isClearing}
            />
        </div>
    );
}
