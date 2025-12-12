"use client";

import { useTheme } from "@/context/ThemeContext";
import AlertModal from "@/components/AlertModal";
import { IoClose, IoFlag, IoChevronBack, IoChevronForward, IoCloseCircle } from "react-icons/io5";
import { useState, useEffect } from "react";

interface CreateTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (task: TaskData) => void;
    editTask?: TaskData | null;
    isLoading?: boolean;
}

interface TaskData {
    title: string;
    description?: string;
    dates: Date[];
    priority: Priority;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

type Priority = "low" | "medium" | "high";

export default function CreateTaskModal({
    visible,
    onClose,
    onSave,
    editTask,
    isLoading = false,
}: CreateTaskModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [priority, setPriority] = useState<Priority>("medium");
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const { colors } = useTheme();
    const [alertModal, setAlertModal] = useState<{
        visible: boolean;
        title: string;
        message: string;
    }>({ visible: false, title: "", message: "" });

    useEffect(() => {
        if (editTask) {
            setTitle(editTask.title || "");
            setDescription(editTask.description || "");
            setSelectedDates(editTask.dates || []);
            setPriority(editTask.priority || "medium");
        } else {
            setTitle("");
            setDescription("");
            setSelectedDates([]);
            setPriority("medium");
        }
    }, [editTask, visible]);

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

    const isDateSelected = (day: number | null) => {
        if (!day) return false;
        return selectedDates.some(
            (date) =>
                date.getDate() === day &&
                date.getMonth() === currentMonth.getMonth() &&
                date.getFullYear() === currentMonth.getFullYear()
        );
    };

    const handleDatePress = (day: number | null) => {
        if (!day) return;

        const clickedDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );

        const existingIndex = selectedDates.findIndex(
            (date) =>
                date.getDate() === clickedDate.getDate() &&
                date.getMonth() === clickedDate.getMonth() &&
                date.getFullYear() === clickedDate.getFullYear()
        );

        if (existingIndex >= 0) {
            setSelectedDates(selectedDates.filter((_, i) => i !== existingIndex));
        } else {
            setSelectedDates([...selectedDates, clickedDate]);
        }
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleSave = () => {
        if (!title.trim()) {
            setAlertModal({ visible: true, title: "Missing Title", message: "Please enter a task title" });
            return;
        }

        if (selectedDates.length === 0) {
            setAlertModal({ visible: true, title: "No Date Selected", message: "Please select at least one date" });
            return;
        }

        onSave({
            title,
            description,
            dates: selectedDates,
            priority,
        });

        setTitle("");
        setDescription("");
        setSelectedDates([]);
        setPriority("medium");
        onClose();
    };

    const getPriorityColor = (p: Priority) => {
        switch (p) {
            case "low":
                return "#34C759";
            case "medium":
                return "#FF9500";
            case "high":
                return "#FF3B30";
        }
    };

    if (!visible) return null;

    const calendarDays = generateCalendarDays();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">
            <div
                className="w-full max-w-md max-h-[85vh] rounded-2xl overflow-hidden flex flex-col"
                style={{ backgroundColor: colors.surface }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between p-4 border-b"
                    style={{ borderColor: colors.border }}
                >
                    <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                        {editTask ? "Edit Task" : "Create Task"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-black/10 transition-colors"
                    >
                        <IoClose size={24} color={colors.textSecondary} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: colors.text }}>
                            Title
                        </label>
                        <input
                            type="text"
                            placeholder="Enter task title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2"
                            style={{
                                backgroundColor: colors.background,
                                color: colors.text,
                                borderColor: colors.border,
                            }}
                        />
                    </div>

                    {/* Description Input */}
                    <div>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: colors.text }}>
                            Description
                        </label>
                        <textarea
                            placeholder="Enter description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 resize-none"
                            style={{
                                backgroundColor: colors.background,
                                color: colors.text,
                                borderColor: colors.border,
                            }}
                        />
                    </div>

                    {/* Mini Calendar */}
                    <div>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: colors.text }}>
                            Select Date(s)
                        </label>
                        <div
                            className="border rounded-lg p-3"
                            style={{ backgroundColor: colors.background, borderColor: colors.border }}
                        >
                            {/* Calendar Nav */}
                            <div className="flex items-center justify-between mb-3">
                                <button onClick={goToPreviousMonth} className="p-1 hover:bg-black/10 rounded">
                                    <IoChevronBack size={18} color={colors.primary} />
                                </button>
                                <span className="text-sm font-semibold" style={{ color: colors.text }}>
                                    {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                </span>
                                <button onClick={goToNextMonth} className="p-1 hover:bg-black/10 rounded">
                                    <IoChevronForward size={18} color={colors.primary} />
                                </button>
                            </div>

                            {/* Weekdays */}
                            <div className="grid grid-cols-7 mb-2">
                                {WEEKDAYS.map((day, i) => (
                                    <div key={i} className="text-center text-xs font-semibold" style={{ color: colors.textSecondary }}>
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, index) => {
                                    const selected = isDateSelected(day);
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleDatePress(day)}
                                            disabled={day === null}
                                            className={`aspect-square flex items-center justify-center rounded-md text-xs font-medium transition-colors ${day === null ? "invisible" : "hover:bg-black/10"
                                                }`}
                                            style={{
                                                backgroundColor: selected ? colors.primary : "transparent",
                                                color: selected ? "#fff" : colors.text,
                                            }}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Selected Dates */}
                        {selectedDates.length > 0 && (
                            <div className="mt-3">
                                <span className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
                                    Selected:
                                </span>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {selectedDates.map((date, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold"
                                            style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text }}
                                        >
                                            {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            <button onClick={() => handleDatePress(date.getDate())}>
                                                <IoCloseCircle size={14} color={colors.textSecondary} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-semibold mb-1.5" style={{ color: colors.text }}>
                            Priority
                        </label>
                        <div className="flex gap-2">
                            {(["low", "medium", "high"] as Priority[]).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPriority(p)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-sm font-semibold transition-all"
                                    style={{
                                        borderColor: priority === p ? getPriorityColor(p) : colors.border,
                                        borderWidth: priority === p ? 2 : 1,
                                        backgroundColor: colors.background,
                                        color: priority === p ? getPriorityColor(p) : colors.textSecondary,
                                    }}
                                >
                                    <IoFlag size={16} color={priority === p ? getPriorityColor(p) : "#CCC"} />
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div
                    className="flex gap-3 p-4 border-t"
                    style={{ borderColor: colors.border }}
                >
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-lg font-semibold text-sm transition-colors hover:opacity-80"
                        style={{ backgroundColor: colors.background, color: colors.text }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-lg font-bold text-sm text-white transition-colors hover:opacity-90 disabled:opacity-70"
                        style={{ backgroundColor: colors.primary }}
                    >
                        {isLoading ? (
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : editTask ? (
                            "Save Changes"
                        ) : (
                            "Create Task"
                        )}
                    </button>
                </div>
            </div>

            <AlertModal
                visible={alertModal.visible}
                onClose={() => setAlertModal({ ...alertModal, visible: false })}
                title={alertModal.title}
                message={alertModal.message}
                type="warning"
            />
        </div>
    );
}
