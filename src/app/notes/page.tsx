"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { db } from "@/lib/firebase";
import Header from "@/components/Header";
import LoginPage from "@/components/LoginPage";
import {
    collection,
    doc,
    onSnapshot,
    query,
    addDoc,
    updateDoc,
    deleteDoc,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    IoFolderOpen,
    IoFolder,
    IoDocumentText,
    IoAdd,
    IoTrash,
    IoClose,
    IoChevronForward,
    IoChevronDown,
    IoCreateOutline,
} from "react-icons/io5";

interface Folder {
    id: string;
    name: string;
    createdAt: Date;
}

interface Note {
    id: string;
    folderId: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export default function NotesPage() {
    const { user, loading } = useAuth();
    const { colors } = useTheme();
    const [folders, setFolders] = useState<Folder[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    // Fetch folders
    useEffect(() => {
        if (!user) return;

        const foldersQuery = query(
            collection(db, "folders"),
            where("userId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(foldersQuery, (snapshot) => {
            const foldersData = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    name: data.name,
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                } as Folder;
            });
            setFolders(foldersData.sort((a, b) => a.name.localeCompare(b.name)));
        });

        return () => unsubscribe();
    }, [user]);

    // Fetch notes
    useEffect(() => {
        if (!user) return;

        const notesQuery = query(
            collection(db, "notes"),
            where("userId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
            const notesData = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    folderId: data.folderId || "uncategorized",
                    title: data.title,
                    content: data.content,
                    createdAt: data.createdAt?.toDate?.() || new Date(),
                    updatedAt: data.updatedAt?.toDate?.() || new Date(),
                } as Note;
            });
            setNotes(notesData.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
        });

        return () => unsubscribe();
    }, [user]);

    const toggleFolder = (folderId: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(folderId)) {
            newExpanded.delete(folderId);
        } else {
            newExpanded.add(folderId);
        }
        setExpandedFolders(newExpanded);
    };

    const handleCreateFolder = async () => {
        if (!user || !newFolderName.trim()) return;

        try {
            await addDoc(collection(db, "folders"), {
                userId: user.uid,
                name: newFolderName.trim(),
                createdAt: new Date(),
            });
            setNewFolderName("");
            setShowNewFolderInput(false);
        } catch (error) {
            console.error("Error creating folder:", error);
        }
    };

    const handleDeleteFolder = async (folderId: string) => {
        if (!confirm("Delete this folder and all its notes?")) return;

        try {
            // Delete all notes in the folder
            const folderNotes = notes.filter((n) => n.folderId === folderId);
            for (const note of folderNotes) {
                await deleteDoc(doc(db, "notes", note.id));
            }
            // Delete the folder
            await deleteDoc(doc(db, "folders", folderId));

            if (selectedFolder?.id === folderId) {
                setSelectedFolder(null);
                setSelectedNote(null);
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error deleting folder:", error);
        }
    };

    const handleNewNote = (folderId: string) => {
        const folder = folders.find((f) => f.id === folderId) || null;
        setSelectedFolder(folder);
        setSelectedNote(null);
        setEditTitle("");
        setEditContent("");
        setIsEditing(true);
    };

    const handleSelectNote = (note: Note) => {
        setSelectedNote(note);
        setEditTitle(note.title);
        setEditContent(note.content);
        setIsEditing(true);
    };

    const handleSaveNote = async () => {
        if (!user || !editTitle.trim()) return;

        setIsSaving(true);
        try {
            if (selectedNote) {
                await updateDoc(doc(db, "notes", selectedNote.id), {
                    title: editTitle,
                    content: editContent,
                    updatedAt: new Date(),
                });
            } else {
                await addDoc(collection(db, "notes"), {
                    userId: user.uid,
                    folderId: selectedFolder?.id || "uncategorized",
                    title: editTitle,
                    content: editContent,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
            setIsEditing(false);
            setSelectedNote(null);
        } catch (error) {
            console.error("Error saving note:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm("Delete this note?")) return;

        try {
            await deleteDoc(doc(db, "notes", noteId));
            if (selectedNote?.id === noteId) {
                setIsEditing(false);
                setSelectedNote(null);
            }
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    const getNotesForFolder = (folderId: string) => {
        return notes.filter((n) => n.folderId === folderId);
    };

    const uncategorizedNotes = notes.filter(
        (n) => !n.folderId || n.folderId === "uncategorized"
    );

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
                <div className="flex gap-6 h-[calc(100vh-120px)]">
                    {/* Folders & Notes Sidebar */}
                    <div
                        className="w-80 rounded-2xl p-4 flex flex-col"
                        style={{ backgroundColor: colors.surface }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <IoFolderOpen size={24} color={colors.primary} />
                                <h2 className="text-lg font-bold" style={{ color: colors.text }}>
                                    Notes & Folders
                                </h2>
                            </div>
                        </div>

                        {/* New Folder Button */}
                        {showNewFolderInput ? (
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="Folder name..."
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                                    autoFocus
                                    className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
                                    style={{
                                        backgroundColor: colors.background,
                                        borderColor: colors.border,
                                        color: colors.text,
                                    }}
                                />
                                <button
                                    onClick={handleCreateFolder}
                                    className="px-3 py-2 rounded-lg text-white text-sm font-semibold"
                                    style={{ backgroundColor: colors.primary }}
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => {
                                        setShowNewFolderInput(false);
                                        setNewFolderName("");
                                    }}
                                    className="p-2 rounded-lg"
                                    style={{ backgroundColor: colors.background }}
                                >
                                    <IoClose size={18} color={colors.textSecondary} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowNewFolderInput(true)}
                                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg mb-3 text-sm font-semibold transition-colors hover:opacity-80"
                                style={{ backgroundColor: colors.primary + "15", color: colors.primary }}
                            >
                                <IoAdd size={18} />
                                New Folder
                            </button>
                        )}

                        {/* Folders List */}
                        <div className="flex-1 overflow-y-auto space-y-1">
                            {/* Folders */}
                            {folders.map((folder) => {
                                const folderNotes = getNotesForFolder(folder.id);
                                const isExpanded = expandedFolders.has(folder.id);

                                return (
                                    <div key={folder.id}>
                                        <div
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-black/5 group"
                                            onClick={() => toggleFolder(folder.id)}
                                        >
                                            {isExpanded ? (
                                                <IoChevronDown size={14} color={colors.textSecondary} />
                                            ) : (
                                                <IoChevronForward size={14} color={colors.textSecondary} />
                                            )}
                                            <IoFolder size={18} color={colors.primary} />
                                            <span className="flex-1 text-sm font-medium truncate" style={{ color: colors.text }}>
                                                {folder.name}
                                            </span>
                                            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: colors.background, color: colors.textSecondary }}>
                                                {folderNotes.length}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleNewNote(folder.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10"
                                            >
                                                <IoAdd size={14} color={colors.primary} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteFolder(folder.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100"
                                            >
                                                <IoTrash size={14} color="#FF3B30" />
                                            </button>
                                        </div>

                                        {/* Notes in folder */}
                                        {isExpanded && (
                                            <div className="ml-6 space-y-1 mt-1">
                                                {folderNotes.length === 0 ? (
                                                    <p className="text-xs py-2 pl-4 italic" style={{ color: colors.textSecondary }}>
                                                        No notes yet
                                                    </p>
                                                ) : (
                                                    folderNotes.map((note) => (
                                                        <div
                                                            key={note.id}
                                                            onClick={() => handleSelectNote(note)}
                                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-black/5 group ${selectedNote?.id === note.id ? "bg-black/5" : ""
                                                                }`}
                                                        >
                                                            <IoDocumentText size={16} color={colors.textSecondary} />
                                                            <span className="flex-1 text-sm truncate" style={{ color: colors.text }}>
                                                                {note.title || "Untitled"}
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteNote(note.id);
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100"
                                                            >
                                                                <IoTrash size={12} color="#FF3B30" />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Uncategorized Notes */}
                            {uncategorizedNotes.length > 0 && (
                                <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
                                    <p className="text-xs font-semibold uppercase mb-2 px-3" style={{ color: colors.textSecondary }}>
                                        Uncategorized
                                    </p>
                                    {uncategorizedNotes.map((note) => (
                                        <div
                                            key={note.id}
                                            onClick={() => handleSelectNote(note)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-black/5 group ${selectedNote?.id === note.id ? "bg-black/5" : ""
                                                }`}
                                        >
                                            <IoDocumentText size={16} color={colors.textSecondary} />
                                            <span className="flex-1 text-sm truncate" style={{ color: colors.text }}>
                                                {note.title || "Untitled"}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteNote(note.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100"
                                            >
                                                <IoTrash size={12} color="#FF3B30" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {folders.length === 0 && uncategorizedNotes.length === 0 && (
                                <div className="text-center py-8">
                                    <IoFolderOpen size={48} color={colors.textSecondary} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                                        Create a folder to get started
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Note Editor */}
                    <div
                        className="flex-1 rounded-2xl p-6 flex flex-col"
                        style={{ backgroundColor: colors.surface }}
                    >
                        {isEditing ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <input
                                        type="text"
                                        placeholder="Note title..."
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="text-2xl font-bold bg-transparent outline-none flex-1"
                                        style={{ color: colors.text }}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setSelectedNote(null);
                                            }}
                                            className="p-2 rounded-lg border"
                                            style={{ borderColor: colors.border }}
                                        >
                                            <IoClose size={20} color={colors.textSecondary} />
                                        </button>
                                        <button
                                            onClick={handleSaveNote}
                                            disabled={isSaving || !editTitle.trim()}
                                            className="px-4 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
                                            style={{ backgroundColor: colors.primary }}
                                        >
                                            {isSaving ? "Saving..." : "Save"}
                                        </button>
                                    </div>
                                </div>
                                {selectedFolder && (
                                    <p className="text-xs mb-4" style={{ color: colors.textSecondary }}>
                                        📁 {selectedFolder.name}
                                    </p>
                                )}
                                <textarea
                                    placeholder="Start writing..."
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="flex-1 bg-transparent outline-none resize-none text-base leading-relaxed"
                                    style={{ color: colors.text }}
                                />
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <IoCreateOutline size={64} color={colors.textSecondary} className="mx-auto mb-4 opacity-30" />
                                    <p style={{ color: colors.textSecondary }}>
                                        Select a note or create a new one
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
