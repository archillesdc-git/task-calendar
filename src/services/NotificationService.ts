import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

interface CreateNotificationParams {
    userId: string;
    title: string;
    message: string;
    type: "task_due" | "task_completed" | "system";
}

export async function createNotification({
    userId,
    title,
    message,
    type,
}: CreateNotificationParams): Promise<void> {
    try {
        await addDoc(collection(db, "notifications"), {
            userId,
            title,
            message,
            type,
            read: false,
            createdAt: new Date(),
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
}

// Helper to create a welcome notification for new users
export async function createWelcomeNotification(userId: string): Promise<void> {
    await createNotification({
        userId,
        title: "Welcome to Task Calendar! 🎉",
        message: "Start organizing your tasks by clicking 'Create Task'. Your tasks sync across all your devices.",
        type: "system",
    });
}

// Helper to create a task due notification
export async function createTaskDueNotification(
    userId: string,
    taskTitle: string,
    dueDate: Date
): Promise<void> {
    const formattedDate = dueDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });

    await createNotification({
        userId,
        title: "Task Due Today",
        message: `"${taskTitle}" is due ${formattedDate}. Don't forget to complete it!`,
        type: "task_due",
    });
}

// Helper to create a task completed notification
export async function createTaskCompletedNotification(
    userId: string,
    taskTitle: string
): Promise<void> {
    await createNotification({
        userId,
        title: "Task Completed! ✅",
        message: `Great job! You completed "${taskTitle}".`,
        type: "task_completed",
    });
}
