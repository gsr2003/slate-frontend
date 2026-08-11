import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import API from "../api";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { format } from "date-fns";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import {
  ChevronLeft,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  FileText,
  BookOpen,
} from "lucide-react";

interface SidebarProps {
  mode: "diary" | "notes";
  setMode: (mode: "diary" | "notes") => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  onClose: () => void;
}

interface Note {
  _id: string;
  title: string;
}

interface Diary {
  _id: string;
  title: string;
}

const Sidebar = ({
  mode,
  setMode,
  selectedId,
  setSelectedId,
  selectedDate,
  setSelectedDate,
  onClose,
}: SidebarProps) => {
  const { user, logout } = useAuthStore();

  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [newDiaryTitle, setNewDiaryTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const fetchNotes = async () => {
    try {
      const { data } = await API.get("/notes");
      setNotes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) return;
    setLoading(true);
    try {
      const { data } = await API.post("/notes", { title: newNoteTitle });
      setNotes([data, ...notes]);
      setSelectedId(data._id);
      setNewNoteTitle("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    try {
      await API.delete(`/notes/${id}`);
      setNotes(notes.filter((n) => n._id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRenameNote = async (id: string) => {
    if (!editingTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      const { data } = await API.put(`/notes/${id}`, { title: editingTitle });
      setNotes(notes.map((n) => (n._id === id ? { ...n, title: data.title } : n)));
      setEditingId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDiaries = async () => {
    try {
      const { data } = await API.get("/diaries");
      setDiaries(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateDiary = async () => {
    if (!newDiaryTitle.trim()) return;
    setLoading(true);
    try {
      const { data } = await API.post("/diaries", { title: newDiaryTitle });
      setDiaries([data, ...diaries]);
      setSelectedId(data._id);
      setSelectedDate(null);
      setNewDiaryTitle("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiary = async (id: string) => {
    if (!confirm("Delete this diary and all its entries?")) return;
    try {
      await API.delete(`/diaries/${id}`);
      setDiaries(diaries.filter((d) => d._id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setSelectedDate(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRenameDiary = async (id: string) => {
    if (!editingTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      const { data } = await API.put(`/diaries/${id}`, { title: editingTitle });
      setDiaries(diaries.map((d) => (d._id === id ? { ...d, title: data.title } : d)));
      setEditingId(null);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (mode === "notes") {
      fetchNotes();
      setSelectedDate(null);
    } else {
      fetchDiaries();
    }
  }, [mode]);

  const today = new Date().toISOString().split("T")[0];
  const selectedDateObj = selectedDate
    ? new Date(selectedDate + "T00:00:00")
    : undefined;

  return (
    <div className="w-72 h-full flex flex-col transition-colors duration-300 border-r bg-white border-gray-200 text-gray-900">
      {/* Header */}
      <div className="px-5 pt-5 pb-5 flex items-start justify-between border-b border-gray-100">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Slate</h1>
          <p className="text-xs mt-1.5 font-medium text-gray-500">
            {user?.name}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-md transition hover:bg-gray-100 text-gray-600"
          title="Hide Sidebar"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="px-4 pt-4">
        <div className="flex p-1 rounded-xl bg-gray-100">
          <button
            onClick={() => {
              setMode("notes");
              setSelectedId(null);
              setSelectedDate(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              mode === "notes"
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText size={14} />
            Notes
          </button>
          <button
            onClick={() => {
              setMode("diary");
              setSelectedId(null);
              setSelectedDate(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-1.5 ${
              mode === "diary"
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <BookOpen size={14} />
            Diary
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {mode === "notes" && (
          <>
            <div className="mb-4 space-y-2">
              <input
                type="text"
                placeholder="New note title..."
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateNote()}
                className="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-gray-400 transition bg-gray-50 border-gray-200 text-gray-900"
              />
              <button
                onClick={handleCreateNote}
                disabled={loading || !newNoteTitle.trim()}
                className="w-full py-2 rounded-lg text-sm font-bold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Plus size={15} strokeWidth={2.5} />
                {loading ? "Creating..." : "Create Note"}
              </button>
            </div>

            <div className="space-y-0.5">
              {notes.length === 0 && (
                <p className="text-center text-sm py-8 font-medium text-gray-400">
                  No notes yet
                </p>
              )}
              {notes.map((note) => (
                <div
                  key={note._id}
                  className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-sm group transition ${
                    selectedId === note._id
                      ? "bg-gray-900 text-white font-bold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {editingId === note._id ? (
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => handleRenameNote(note._id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameNote(note._id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="flex-1 bg-white text-black px-2 py-1 rounded text-sm outline-none font-medium"
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => setSelectedId(note._id)}
                        className="flex-1 text-left truncate font-medium"
                      >
                        {note.title}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(note._id);
                          setEditingTitle(note.title);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10"
                        title="Rename"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:bg-black/10"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {mode === "diary" && (
          <>
            <div className="mb-4 space-y-2">
              <input
                type="text"
                placeholder="New diary name..."
                value={newDiaryTitle}
                onChange={(e) => setNewDiaryTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateDiary()}
                className="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-gray-400 transition bg-gray-50 border-gray-200 text-gray-900"
              />
              <button
                onClick={handleCreateDiary}
                disabled={loading || !newDiaryTitle.trim()}
                className="w-full py-2 rounded-lg text-sm font-bold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Plus size={15} strokeWidth={2.5} />
                {loading ? "Creating..." : "Create Diary"}
              </button>
            </div>

            <div className="space-y-0.5 mb-4">
              {diaries.length === 0 && (
                <p className="text-center text-sm py-8 font-medium text-gray-400">
                  No diaries yet
                </p>
              )}
              {diaries.map((diary) => (
                <div
                  key={diary._id}
                  className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-sm group transition ${
                    selectedId === diary._id
                      ? "bg-gray-900 text-white font-bold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {editingId === diary._id ? (
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => handleRenameDiary(diary._id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameDiary(diary._id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="flex-1 bg-white text-black px-2 py-1 rounded text-sm outline-none font-medium"
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setSelectedId(diary._id);
                          setSelectedDate(null);
                        }}
                        className="flex-1 text-left truncate font-medium"
                      >
                        {diary.title}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(diary._id);
                          setEditingTitle(diary.title);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10"
                        title="Rename"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteDiary(diary._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:bg-black/10"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            {selectedId && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs mb-2 font-bold text-gray-500">
                  Select Date
                </p>

                <div className="rounded-xl border p-1 border-gray-200 bg-gray-50">
                  <DayPicker
                    mode="single"
                    selected={selectedDateObj}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(format(date, "yyyy-MM-dd"));
                      }
                    }}
                    classNames={{
                      root: "text-xs",
                      months: "w-full",
                      month: "w-full",
                      month_caption:
                        "flex justify-center items-center gap-2 py-1 font-bold text-sm",
                      nav: "flex gap-0.5",
                      button_previous:
                        "p-0.5 rounded hover:bg-gray-200 scale-75",
                      button_next: "p-0.5 rounded hover:bg-gray-200 scale-75",
                      weekdays: "flex",
                      weekday:
                        "w-8 text-center text-[10px] font-medium opacity-60",
                      week: "flex",
                      day: "w-8 h-8 text-center text-xs",
                      day_button:
                        "w-8 h-8 rounded-md hover:bg-gray-200 transition",
                      selected: "bg-gray-900 text-white font-bold",
                      today: "font-bold underline",
                      outside: "opacity-30",
                      chevron: "fill-gray-600",
                    }}
                  />
                </div>

                <button
                  onClick={() => setSelectedDate(today)}
                  className="w-full mt-2 text-sm font-bold text-gray-700 hover:text-gray-900"
                >
                  Use Today
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Logout only */}
      <div className="px-4 py-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition font-bold flex items-center justify-center gap-2"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;