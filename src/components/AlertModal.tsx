"use client";

import { IoAlertCircleOutline, IoCheckmarkCircleOutline, IoWarningOutline, IoClose } from "react-icons/io5";

interface AlertModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: "info" | "success" | "warning" | "error";
}

export default function AlertModal({
    visible,
    onClose,
    title,
    message,
    type = "info"
}: AlertModalProps) {
    if (!visible) return null;

    const getIcon = () => {
        switch (type) {
            case "success":
                return <IoCheckmarkCircleOutline size={48} className="text-green-500" />;
            case "warning":
                return <IoWarningOutline size={48} className="text-yellow-500" />;
            case "error":
                return <IoAlertCircleOutline size={48} className="text-red-500" />;
            default:
                return <IoAlertCircleOutline size={48} className="text-blue-500" />;
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case "success":
                return "bg-green-500 hover:bg-green-600";
            case "warning":
                return "bg-yellow-500 hover:bg-yellow-600";
            case "error":
                return "bg-red-500 hover:bg-red-600";
            default:
                return "bg-blue-500 hover:bg-blue-600";
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <IoClose size={24} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    {getIcon()}
                </div>

                {/* Content */}
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {message}
                    </p>
                </div>

                {/* OK Button */}
                <button
                    onClick={onClose}
                    className={`w-full ${getButtonColor()} text-white font-semibold py-3 px-6 rounded-xl transition-colors`}
                >
                    OK
                </button>
            </div>
        </div>
    );
}
