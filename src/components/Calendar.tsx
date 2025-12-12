"use client";

import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskDetailsModal from "@/components/TaskDetailsModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import AlarmModal from "@/components/AlarmModal";
import AlertModal from "@/components/AlertModal";
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
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
    IoChevronBack,
    IoChevronForward,
    IoAdd,
    IoTimeOutline,
} from "react-icons/io5";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

// Helper function to get Philippine time
const getPhilippineTime = () => {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
};

// Format time in 12-hour format
const formatTime12Hour = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;
    const secondsStr = seconds < 10 ? "0" + seconds : seconds;
    return `${hours}:${minutesStr}:${secondsStr} ${ampm}`;
};

const ALARM_MESSAGE = "Please Time Out The attendance Discord ASAP.";

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

    // Clock & Alarm States
    const [currentTime, setCurrentTime] = useState<Date>(getPhilippineTime());
    const [alarmModalVisible, setAlarmModalVisible] = useState(false);
    const lastAlarmRef = useRef<string | null>(null);

    // Alert Modal State
    const [alertModal, setAlertModal] = useState<{
        visible: boolean;
        title: string;
        message: string;
        type: "info" | "error" | "warning" | "success";
    }>({ visible: false, title: "", message: "", type: "info" });

    const showAlert = (title: string, message: string, type: "info" | "error" | "warning" | "success" = "error") => {
        setAlertModal({ visible: true, title, message, type });
    };

    // Clock update and alarm check
    useEffect(() => {
        const interval = setInterval(() => {
            const phTime = getPhilippineTime();
            setCurrentTime(phTime);

            // Check for alarm times: 2:00 PM (14:00), 11:00 PM (23:00), and 11:07 PM (23:07) for testing
            const hours = phTime.getHours();
            const minutes = phTime.getMinutes();
            const seconds = phTime.getSeconds();

            const alarmKey = `${hours}:${minutes}`;

            // Trigger alarm at exactly 2:00 PM (14:00) and 11:00 PM (23:00)
            if (seconds < 10) {
                if ((hours === 14 && minutes === 0) || (hours === 23 && minutes === 0)) {
                    // Only trigger if we haven't already triggered for this minute
                    if (lastAlarmRef.current !== alarmKey) {
                        lastAlarmRef.current = alarmKey;
                        setAlarmModalVisible(true);
                    }
                }
            } else {
                // Reset alarm tracking after the first 5 seconds
                if (lastAlarmRef.current === alarmKey) {
                    lastAlarmRef.current = null;
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

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
                showAlert("Error", "Error fetching tasks: " + error.message, "error");
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
            showAlert("Login Required", "Please log in to create tasks", "warning");
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
            showAlert("Error", "Failed to save task: " + (error as Error).message, "error");
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
            showAlert("Error", "Failed to mark task as done", "error");
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
            showAlert("Error", "Failed to delete task", "error");
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
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 relative"
                    style={{ backgroundColor: colors.primary }}
                >
                    {/* Christmas decorations */}
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-2xl animate-bounce" style={{ animationDuration: "2s" }}>🎄</span>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-2xl animate-bounce" style={{ animationDuration: "2.5s" }}>🎅</span>

                    <div className="flex items-center gap-4 ml-8">
                        <h1 className="text-2xl font-bold text-white">🎄 Task Calendar ❄️</h1>

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

                    {/* Live Clock Display - Philippine Time */}
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-black/20 shadow-md">
                        <IoTimeOutline size={22} color="#000" />
                        <div className="flex flex-col items-center">
                            <span className="text-black font-bold text-lg tracking-wider font-mono">
                                {formatTime12Hour(currentTime)}
                            </span>
                            <span className="text-black/60 text-[10px] uppercase tracking-widest">
                                Philippine Time
                            </span>
                        </div>
                        <div className="flex flex-col gap-0.5 ml-2" title="Alarms: 2:00 PM & 11:00 PM">
                            <span className="text-[10px] text-black/80">🔔 2PM</span>
                            <span className="text-[10px] text-black/80">🔔 11PM</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setModalVisible(true)}
                        className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-shadow font-semibold mr-8"
                        style={{ color: colors.primary }}
                    >
                        <IoAdd size={20} />
                        🎁 Create Task
                    </button>
                </div>

                {/* Calendar Body */}
                <div style={{ backgroundColor: theme === "light" ? colors.primary + "05" : colors.surface }}>
                    {/* Weekday Headers */}
                    <div
                        className="grid grid-cols-7 border-b"
                        style={{ backgroundColor: colors.background, borderColor: colors.border }}
                    >
                        {WEEKDAYS.map((day, index) => (
                            <div
                                key={day}
                                className="py-4 text-center"
                                style={{
                                    borderRight: index < 6 ? "1px solid rgba(0, 0, 0, 0.4)" : "none",
                                }}
                            >
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

            <AlarmModal
                visible={alarmModalVisible}
                onClose={() => setAlarmModalVisible(false)}
                message={ALARM_MESSAGE}
            />

            <AlertModal
                visible={alertModal.visible}
                onClose={() => setAlertModal({ ...alertModal, visible: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
}
