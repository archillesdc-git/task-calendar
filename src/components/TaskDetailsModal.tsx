"use client";

import { useTheme } from "@/context/ThemeContext";
import { IoClose, IoCheckmarkCircle, IoTrash, IoPencil } from "react-icons/io5";

interface Task {
    id: string;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    dates: Date[];
}

interface TaskDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    date: Date | null;
    tasks: Task[];
    onMarkDone: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    onEdit: (task: Task) => void;
}

export default function TaskDetailsModal({
    visible,
    onClose,
    date,
    tasks,
    onMarkDone,
    onDelete,
    onEdit,
}: TaskDetailsModalProps) {
    const { colors } = useTheme();

    if (!visible) return null;

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

    const formatDate = (date: Date | null) => {
        if (!date) return "";
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">
            <div
                className="w-full max-w-md max-h-[80vh] rounded-2xl overflow-hidden flex flex-col"
                style={{ backgroundColor: colors.surface }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between p-4 border-b"
                    style={{ borderColor: colors.border }}
                >
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: colors.text }}>
                            Tasks for
                        </h2>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                            {formatDate(date)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-black/10 transition-colors"
                    >
                        <IoClose size={24} color={colors.textSecondary} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {tasks.length === 0 ? (
                        <p className="text-center py-8" style={{ color: colors.textSecondary }}>
                            No tasks for this day
                        </p>
                    ) : (
                        tasks.map((task) => (
                            <div
                                key={task.id}
                                className="p-4 rounded-xl border"
                                style={{
                                    backgroundColor: colors.background,
                                    borderColor: colors.border,
                                    borderLeftWidth: 4,
                                    borderLeftColor: getPriorityColor(task.priority),
                                }}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold" style={{ color: colors.text }}>
                                        {task.title}
                                    </h3>
                                    <span
                                        className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                                    >
                                        {task.priority}
                                    </span>
                                </div>

                                {task.description && (
                                    <p className="text-sm mb-3" style={{ color: colors.textSecondary }}>
                                        {task.description}
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onMarkDone(task.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:opacity-80"
                                        style={{ backgroundColor: "#34C759", color: "#fff" }}
                                    >
                                        <IoCheckmarkCircle size={16} />
                                        Done
                                    </button>
                                    <button
                                        onClick={() => onEdit(task)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:opacity-80"
                                        style={{ backgroundColor: colors.primary, color: "#fff" }}
                                    >
                                        <IoPencil size={14} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(task.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:opacity-80"
                                        style={{ backgroundColor: "#FF3B30", color: "#fff" }}
                                    >
                                        <IoTrash size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
