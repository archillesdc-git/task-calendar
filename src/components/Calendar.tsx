"use client";

import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskDetailsModal from "@/components/TaskDetailsModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    query,
    updateDoc,
    where,
    Timestamp,
} from "firebase/firestore";
import { useEffect, useState, useMemo } from "react";
import {
    IoChevronBack,
    IoChevronForward,
    IoAdd,
} from "react-icons/io5";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

interface Task {
    id: string;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    dates: Date[];
    status?: string;
    userId?: string;
}

export default function CalendarPage() {
    const { user } = useAuth();
    const { colors, theme } = useTheme();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [modalVisible, setModalVisible] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedDayTasks, setSelectedDayTasks] = useState<Task[]>([]);
    const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);

    // Loading & Modal States
    const [isSaving, setIsSaving] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch tasks from Firestore
    useEffect(() => {
        if (!user) return;

        const tasksQuery = query(
            collection(db, "tasks"),
            where("userId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(
            tasksQuery,
            (snapshot) => {
                const tasksData = snapshot.docs
                    .map((docSnap) => {
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
                        } as Task;
                    })
                    .filter((task) => !task.status || task.status === "active");

                setTasks(tasksData);
            },
            (error) => {
                console.error("Firestore listener error:", error);
                alert("Error fetching tasks: " + error.message);
            }
        );

        return () => unsubscribe();
    }, [user]);

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days: (number | null)[] = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    };

    const isToday = (day: number | null) => {
        if (!day) return false;
        const today = new Date();
        return (
            day === today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (day: number | null) => {
        if (!day) return false;
        return (
            day === selectedDate.getDate() &&
            currentMonth.getMonth() === selectedDate.getMonth() &&
            currentMonth.getFullYear() === selectedDate.getFullYear()
        );
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleSaveTask = async (task: { title: string; description?: string; dates: Date[]; priority: string }) => {
        if (!user) {
            alert("User not logged in");
            return;
        }

        setIsSaving(true);
        try {
            if (editingTask) {
                const taskRef = doc(db, "tasks", editingTask.id);
                await updateDoc(taskRef, {
                    title: task.title,
                    description: task.description || "",
                    dates: task.dates,
                    priority: task.priority,
                });
            } else {
                await addDoc(collection(db, "tasks"), {
                    ...task,
                    userId: user.uid,
                    status: "active",
                    createdAt: new Date(),
                });
            }
            setModalVisible(false);
            setEditingTask(null);
        } catch (error) {
            console.error("Error saving task:", error);
            alert("Failed to save task: " + (error as Error).message);
        } finally {
            setIsSaving(false);
        }
    };

    // Pre-process tasks into a dictionary
    const tasksByDate = useMemo(() => {
        const map: Record<string, Task[]> = {};

        tasks.forEach((task) => {
            if (!task.dates) return;

            task.dates.forEach((dateObj) => {
                const date = dateObj instanceof Date ? dateObj : new Date(dateObj);
                const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

                if (!map[key]) {
                    map[key] = [];
                }
                if (!map[key].find((t) => t.id === task.id)) {
                    map[key].push(task);
                }
            });
        });

        return map;
    }, [tasks]);

    const getTasksForDate = (day: number) => {
        const key = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`;
        return tasksByDate[key] || [];
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

    const handleMarkDone = async (taskId: string) => {
        try {
            // Find the task to get its title
            const task = tasks.find((t) => t.id === taskId);

            const taskRef = doc(db, "tasks", taskId);
            await updateDoc(taskRef, {
                status: "completed",
                completedAt: new Date(),
            });

            // Create notification for task completion
            if (user && task) {
                const { createTaskCompletedNotification } = await import("@/services/NotificationService");
                await createTaskCompletedNotification(user.uid, task.title);
            }

            setDetailsModalVisible(false);
        } catch (error) {
            console.error("Error marking task as done:", error);
            alert("Failed to mark task as done");
        }
    };

    const handleDeleteClick = (taskId: string) => {
        setTaskToDelete(taskId);
        setDeleteModalVisible(true);
        setDetailsModalVisible(false);
    };

    const confirmDeleteTask = async () => {
        if (!taskToDelete) return;

        setIsDeleting(true);
        try {
            const taskRef = doc(db, "tasks", taskToDelete);
            await updateDoc(taskRef, {
                status: "deleted",
                deletedAt: new Date(),
            });
            setDeleteModalVisible(false);
            setTaskToDelete(null);
        } catch (error) {
            console.error("Error deleting task:", error);
            alert("Failed to delete task");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditTask = (task: Task) => {
        setDetailsModalVisible(false);
        setEditingTask(task);
        setModalVisible(true);
    };

    const calendarDays = generateCalendarDays();

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
                <p style={{ color: colors.textSecondary }}>Please log in to view your calendar</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: colors.background }}>
            <div
                className="rounded-3xl overflow-hidden shadow-lg"
                style={{ backgroundColor: theme === "light" ? colors.primary + "10" : colors.surface }}
            >
                {/* Header */}
                <div
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6"
                    style={{ backgroundColor: colors.primary }}
                >
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-white">Task Calendar</h1>

                        {/* Month Navigator */}
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg border border-white/30">
                            <button onClick={goToPreviousMonth} className="p-1 hover:bg-white/20 rounded">
                                <IoChevronBack size={20} color="#fff" />
                            </button>
                            <span className="text-white font-semibold min-w-[140px] text-center">
                                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </span>
                            <button onClick={goToNextMonth} className="p-1 hover:bg-white/20 rounded">
                                <IoChevronForward size={20} color="#fff" />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setModalVisible(true)}
                        className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-shadow font-semibold"
                        style={{ color: colors.primary }}
                    >
                        <IoAdd size={20} />
                        Create Task
                    </button>
                </div>

                {/* Calendar Body */}
                <div style={{ backgroundColor: theme === "light" ? colors.primary + "05" : colors.surface }}>
                    {/* Weekday Headers */}
                    <div
                        className="grid grid-cols-7 border-b"
                        style={{ backgroundColor: colors.background, borderColor: colors.border }}
                    >
                        {WEEKDAYS.map((day) => (
                            <div key={day} className="py-4 text-center">
                                <span className="text-sm font-semibold" style={{ color: colors.text }}>
                                    {day}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, index) => {
                            const today = isToday(day);
                            const selected = isSelected(day);
                            const dayTasks = day ? getTasksForDate(day) : [];
                            const hasTasks = dayTasks.length > 0;

                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (!day) return;
                                        const clickedDate = new Date(
                                            currentMonth.getFullYear(),
                                            currentMonth.getMonth(),
                                            day
                                        );
                                        if (hasTasks) {
                                            setSelectedDayTasks(dayTasks);
                                            setSelectedDayDate(clickedDate);
                                            setDetailsModalVisible(true);
                                        }
                                        setSelectedDate(clickedDate);
                                    }}
                                    disabled={day === null || !hasTasks}
                                    className={`min-h-[120px] p-3 border-r border-b text-left transition-colors ${hasTasks ? "cursor-pointer hover:bg-black/5" : "cursor-default"
                                        }`}
                                    style={{
                                        borderColor: colors.border,
                                        backgroundColor: today || selected ? colors.primary + "30" : "transparent",
                                    }}
                                >
                                    {day !== null && (
                                        <>
                                            <span
                                                className={`text-base font-medium ${today || selected ? "font-bold" : ""
                                                    }`}
                                                style={{ color: today || selected ? colors.primary : colors.text }}
                                            >
                                                {day}
                                            </span>
                                            {hasTasks && (
                                                <div className="mt-1.5 space-y-1">
                                                    {dayTasks.slice(0, 3).map((task, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="px-1.5 py-0.5 rounded text-[11px] font-semibold text-white truncate"
                                                            style={{ backgroundColor: getPriorityColor(task.priority) }}
                                                        >
                                                            {task.title}
                                                        </div>
                                                    ))}
                                                    {dayTasks.length > 3 && (
                                                        <span className="text-[10px] italic" style={{ color: colors.textSecondary }}>
                                                            +{dayTasks.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateTaskModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setEditingTask(null);
                }}
                onSave={handleSaveTask}
                editTask={editingTask}
                isLoading={isSaving}
            />

            <TaskDetailsModal
                visible={detailsModalVisible}
                onClose={() => setDetailsModalVisible(false)}
                date={selectedDayDate}
                tasks={selectedDayTasks}
                onMarkDone={handleMarkDone}
                onDelete={handleDeleteClick}
                onEdit={handleEditTask}
            />

            <ConfirmationModal
                visible={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                onConfirm={confirmDeleteTask}
                title="Move to Trash?"
                message="This task will be moved to the trash bin. You can restore it later."
                confirmText="Move to Trash"
                isDestructive={true}
                isLoading={isDeleting}
            />
        </div>
    );
}
