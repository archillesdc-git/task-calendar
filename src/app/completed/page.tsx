"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { db } from "@/lib/firebase";
import Header from "@/components/Header";
import ConfirmationModal from "@/components/ConfirmationModal";
import LoginPage from "@/components/LoginPage";
import {
    collection,
    doc,
    onSnapshot,
    query,
    updateDoc,
    where,
    deleteDoc,
    Timestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { IoCheckmarkCircle, IoTrash, IoRefresh } from "react-icons/io5";

interface Task {
    id: string;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    dates: Date[];
    status: string;
    completedAt?: Date;
}

export default function CompletedPage() {
    const { user, loading } = useAuth();
    const { colors, theme } = useTheme();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [restoreModalVisible, setRestoreModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!user) return;

        const tasksQuery = query(
            collection(db, "tasks"),
            where("userId", "==", user.uid),
            where("status", "==", "completed")
        );

        const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
            const tasksData = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    dates:
                        data.dates?.map((timestamp: Timestamp | Date) => {
                            if (timestamp instanceof Timestamp) {
                                return timestamp.toDate();
                            }
                            return timestamp instanceof Date ? timestamp : new Date(timestamp);
                        }) || [],
                    completedAt: data.completedAt?.toDate?.() || data.completedAt,
                } as Task;
            });
            setTasks(tasksData);
        });

        return () => unsubscribe();
    }, [user]);

    const handleRestore = async () => {
        if (!selectedTaskId) return;
        setIsProcessing(true);
        try {
            const taskRef = doc(db, "tasks", selectedTaskId);
            await updateDoc(taskRef, { status: "active" });
            setRestoreModalVisible(false);
            setSelectedTaskId(null);
        } catch (error) {
            console.error("Error restoring task:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedTaskId) return;
        setIsProcessing(true);
        try {
            const taskRef = doc(db, "tasks", selectedTaskId);
            await deleteDoc(taskRef);
            setDeleteModalVisible(false);
            setSelectedTaskId(null);
        } catch (error) {
            console.error("Error deleting task:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "low":
                return "#34C759";
            case "medium":
                return "#FF9500";
            case "high":
                return "#FF3B30";
            default:
                return "#999";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
            <Header />
            <main className="p-4 md:p-6">
                <div
                    className="rounded-2xl p-6"
                    style={{ backgroundColor: colors.surface }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <IoCheckmarkCircle size={32} color="#34C759" />
                        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
                            Completed Tasks
                        </h1>
                        <span
                            className="px-3 py-1 rounded-full text-sm font-semibold"
                            style={{ backgroundColor: "#34C759" + "20", color: "#34C759" }}
                        >
                            {tasks.length}
                        </span>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="text-center py-16">
                            <IoCheckmarkCircle size={64} color={colors.textSecondary} className="mx-auto mb-4 opacity-50" />
                            <p style={{ color: colors.textSecondary }}>
                                No completed tasks yet. Keep working!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between p-4 rounded-xl border"
                                    style={{
                                        backgroundColor: colors.background,
                                        borderColor: colors.border,
                                        borderLeftWidth: 4,
                                        borderLeftColor: getPriorityColor(task.priority),
                                    }}
                                >
                                    <div>
                                        <h3 className="font-semibold" style={{ color: colors.text }}>
                                            {task.title}
                                        </h3>
                                        {task.completedAt && (
                                            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                                                Completed: {new Date(task.completedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedTaskId(task.id);
                                                setRestoreModalVisible(true);
                                            }}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                            style={{ backgroundColor: colors.primary, color: "#fff" }}
                                        >
                                            <IoRefresh size={14} />
                                            Restore
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedTaskId(task.id);
                                                setDeleteModalVisible(true);
                                            }}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                            style={{ backgroundColor: "#FF3B30", color: "#fff" }}
                                        >
                                            <IoTrash size={14} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <ConfirmationModal
                visible={restoreModalVisible}
                onClose={() => setRestoreModalVisible(false)}
                onConfirm={handleRestore}
                title="Restore Task?"
                message="This task will be moved back to your active tasks."
                confirmText="Restore"
                isLoading={isProcessing}
            />

            <ConfirmationModal
                visible={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                onConfirm={handleDelete}
                title="Delete Permanently?"
                message="This task will be permanently deleted and cannot be recovered."
                confirmText="Delete Forever"
                isDestructive
                isLoading={isProcessing}
            />
        </div>
    );
}
