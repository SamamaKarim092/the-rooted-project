"use client";

import { useState, useMemo, useTransition, useEffect, useCallback } from "react";
import { 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Save, 
  Check, 
  FileText, 
  Clock, 
  Sparkles, 
  ArrowLeft,
  X,
  AlertCircle,
  Tag
} from "lucide-react";
import { createNote, updateNote, deleteNote, togglePinNote } from "@/lib/actions";

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  color?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface NotesClientProps {
  initialNotes: Note[];
}

const CATEGORIES = ["General", "Craft", "Mind", "Body", "Spirit", "Study", "Career", "Others"] as const;

export function NotesClient({ initialNotes }: NotesClientProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    initialNotes.length > 0 ? initialNotes[0].id : null
  );
  const [isCreatingNew, setIsCreatingNew] = useState(initialNotes.length === 0);

  // Active Editor Form State
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("General");
  const [isPinned, setIsPinned] = useState(false);

  // Search & Category Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Save Status State: "saved" | "unsaved" | "saving"
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">("saved");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Mobile view toggle: "list" | "editor"
  const [mobileView, setMobileView] = useState<"list" | "editor">(
    initialNotes.length > 0 ? "editor" : "editor"
  );

  const [isPending, startTransition] = useTransition();

  // Sync state when initialNotes change
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  // Selected note lookup
  const selectedNote = useMemo(() => {
    if (isCreatingNew || !selectedNoteId) return null;
    return notes.find((n) => n.id === selectedNoteId) || null;
  }, [notes, selectedNoteId, isCreatingNew]);

  // Sync editor fields when selected note changes
  useEffect(() => {
    if (isCreatingNew) {
      setHeading("");
      setDescription("");
      setCategory("General");
      setIsPinned(false);
      setSaveStatus("saved");
    } else if (selectedNote) {
      setHeading(selectedNote.title);
      setDescription(selectedNote.content);
      setCategory(selectedNote.category || "General");
      setIsPinned(selectedNote.isPinned);
      setSaveStatus("saved");
    }
  }, [selectedNote, isCreatingNew]);

  // Handle heading change
  const handleHeadingChange = (value: string) => {
    setHeading(value);
    setSaveStatus("unsaved");
  };

  // Handle description change
  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setSaveStatus("unsaved");
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSaveStatus("unsaved");
  };

  // Save Note Action
  const handleSaveNote = useCallback(async () => {
    const noteTitle = heading.trim() || "Untitled Note";

    setSaveStatus("saving");

    if (isCreatingNew) {
      // Create new note
      startTransition(async () => {
        try {
          const newNote = await createNote({
            title: noteTitle,
            content: description,
            category,
            isPinned,
          });

          setNotes((prev) => [newNote as Note, ...prev]);
          setSelectedNoteId(newNote.id);
          setIsCreatingNew(false);
          setSaveStatus("saved");
        } catch (error) {
          console.error("Failed to create note:", error);
          setSaveStatus("unsaved");
        }
      });
    } else if (selectedNoteId) {
      // Update existing note
      startTransition(async () => {
        try {
          const updated = await updateNote(selectedNoteId, {
            title: noteTitle,
            content: description,
            category,
            isPinned,
          });

          setNotes((prev) =>
            prev.map((n) => (n.id === selectedNoteId ? (updated as Note) : n))
          );
          setSaveStatus("saved");
        } catch (error) {
          console.error("Failed to update note:", error);
          setSaveStatus("unsaved");
        }
      });
    }
  }, [heading, description, category, isPinned, isCreatingNew, selectedNoteId]);

  // Keyboard shortcut: Ctrl+S / Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveNote();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveNote]);

  // Click "+ New Note"
  const handleStartNewNote = () => {
    setIsCreatingNew(true);
    setSelectedNoteId(null);
    setHeading("");
    setDescription("");
    setCategory("General");
    setIsPinned(false);
    setSaveStatus("saved");
    setMobileView("editor");
  };

  // Select an existing note
  const handleSelectNote = (noteId: string) => {
    // If unsaved changes exist in current note, save them first
    if (saveStatus === "unsaved" && (heading.trim() || description.trim())) {
      handleSaveNote();
    }
    setIsCreatingNew(false);
    setSelectedNoteId(noteId);
    setMobileView("editor");
  };

  // Toggle pin
  const handleTogglePin = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    startTransition(async () => {
      try {
        const updated = await togglePinNote(noteId);
        if (updated) {
          setNotes((prev) =>
            prev.map((n) => (n.id === noteId ? (updated as Note) : n))
          );
          if (selectedNoteId === noteId) {
            setIsPinned(updated.isPinned);
          }
        }
      } catch (error) {
        console.error("Failed to toggle pin:", error);
      }
    });
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    startTransition(async () => {
      try {
        await deleteNote(noteId);
        const remaining = notes.filter((n) => n.id !== noteId);
        setNotes(remaining);
        setDeleteConfirmId(null);

        if (selectedNoteId === noteId) {
          if (remaining.length > 0) {
            setSelectedNoteId(remaining[0].id);
            setIsCreatingNew(false);
          } else {
            setSelectedNoteId(null);
            setIsCreatingNew(true);
          }
        }
      } catch (error) {
        console.error("Failed to delete note:", error);
      }
    });
  };

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "ALL" ||
        note.category.toLowerCase() === categoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [notes, searchQuery, categoryFilter]);

  // Pinned vs Regular Notes
  const pinnedNotes = useMemo(
    () => filteredNotes.filter((n) => n.isPinned),
    [filteredNotes]
  );
  const otherNotes = useMemo(
    () => filteredNotes.filter((n) => !n.isPinned),
    [filteredNotes]
  );

  // Category Badge Colors
  const getCategoryBadgeClass = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "mind":
        return "bg-[#EAF2ED] text-[#2F523E] border-[#C8DFD2]";
      case "body":
        return "bg-[#FDF2EC] text-[#9E4C2B] border-[#F5D5C6]";
      case "craft":
        return "bg-[#FAF2E6] text-[#996328] border-[#EED7B7]";
      case "spirit":
        return "bg-[#F4EEF7] text-[#593977] border-[#DDD0E6]";
      case "study":
        return "bg-[#EBF1F7] text-[#2C5272] border-[#C7D9E7]";
      case "career":
        return "bg-[#F2F4E8] text-[#4F5927] border-[#D5DCAE]";
      case "others":
      case "other":
        return "bg-[#F0EFEB] text-[#4A524D] border-[#DCD9D2]";
      case "general":
      default:
        return "bg-[#F5F2EA] text-[#55635B] border-[#E2DDD3]";
    }
  };

  // Accurate Calendar Date Formatter
  const formatNoteDate = (dateVal: Date | string) => {
    try {
      const date = new Date(dateVal);
      if (isNaN(date.getTime())) return "";

      const now = new Date();

      // Check calendar days
      const isToday =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday =
        date.getFullYear() === yesterday.getFullYear() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getDate() === yesterday.getDate();

      if (isToday) {
        return "Today";
      }

      if (isYesterday) {
        return "Yesterday";
      }

      // If written before yesterday, display the actual calendar date (e.g. "Sep 19" or "Sep 19, 2026")
      const isSameYear = date.getFullYear() === now.getFullYear();
      if (isSameYear) {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Word count & character count
  const wordCount = description.trim() ? description.trim().split(/\s+/).length : 0;
  const charCount = description.length;

  return (
    <div className="space-y-6 w-full">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-[#1A241E]">
            Field Notes & Reflections
          </h2>
          <p className="text-sm text-[#586B60] mt-1 font-sans">
            Capture thoughts, ideas, learnings, and personal insights with mindful clarity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Total Notes Capsule */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FFFFFF] border border-[#EAE5D8] text-xs font-semibold text-[#586B60] shadow-xs">
            <FileText className="w-4 h-4 text-[#7C9A86]" />
            <span>{notes.length} {notes.length === 1 ? "Note" : "Notes"}</span>
          </div>

          {/* New Note Button */}
          <button
            onClick={handleStartNewNote}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1E3127] hover:bg-[#2A3F34] text-[#FAF7F0] font-medium text-sm transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[680px]">
        {/* ========================================================= */}
        {/* LEFT PANE: Note Explorer / List (Hidden on mobile if editing) */}
        {/* ========================================================= */}
        <div
          className={`lg:col-span-5 flex flex-col bg-[#FFFFFF] rounded-3xl border border-[#EAE5D8] shadow-xs overflow-hidden ${
            mobileView === "editor" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Search & Action Bar */}
          <div className="p-4 border-b border-[#EAE5D8] space-y-3 bg-[#FCFAF6]/60">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#8E9E94] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes by title or content..."
                className="w-full pl-9 pr-8 py-2 rounded-2xl bg-[#FAF7F0] border border-[#EAE5D8] text-xs text-[#1A241E] placeholder:text-[#8E9E94] focus:outline-none focus:border-[#7C9A86] focus:bg-[#FFFFFF] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E9E94] hover:text-[#1A241E] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills (Scrollable) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5">
              {["ALL", ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-semibold tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-[#1E3127] text-[#FAF7F0] shadow-2xs"
                      : "bg-[#FAF7F0] text-[#586B60] hover:text-[#1A241E] hover:bg-[#EFEAE0]"
                  }`}
                >
                  {cat.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Notes List Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#EAE5D8]/60 max-h-[600px] lg:max-h-[660px]">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                <div className="w-12 h-12 rounded-2xl bg-[#F7F4EB] border border-[#EAE5D8] flex items-center justify-center text-[#8E9E94] mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-base font-semibold text-[#1A241E]">
                  {searchQuery || categoryFilter !== "ALL"
                    ? "No matching notes"
                    : "No notes planted yet"}
                </h4>
                <p className="text-xs text-[#8E9E94] mt-1 max-w-[220px]">
                  {searchQuery || categoryFilter !== "ALL"
                    ? "Try adjusting your search terms or category filter."
                    : "Start your personal sanctuary of thoughts and ideas."}
                </p>
                {!searchQuery && categoryFilter === "ALL" && (
                  <button
                    onClick={handleStartNewNote}
                    className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3127] text-[#FAF7F0] text-xs font-semibold hover:bg-[#2A3F34] transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Note</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {/* Pinned Notes Section */}
                {pinnedNotes.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7C9A86]">
                      <Pin className="w-3 h-3 fill-[#7C9A86]" />
                      <span>Pinned Notes</span>
                    </div>

                    {pinnedNotes.map((note) => {
                      const isSelected = !isCreatingNew && selectedNoteId === note.id;
                      return (
                        <div
                          key={note.id}
                          onClick={() => handleSelectNote(note.id)}
                          className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                            isSelected
                              ? "bg-[#FAF7F0] border-[#1E3127] shadow-xs"
                              : "bg-[#FFFFFF] border-[#EAE5D8] hover:border-[#7C9A86]/50 hover:bg-[#FAF9F5]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-serif text-base font-bold text-[#1A241E] line-clamp-1 leading-snug">
                              {note.title || "Untitled Note"}
                            </h4>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={(e) => handleTogglePin(e, note.id)}
                                title="Unpin note"
                                className="p-1 rounded-lg text-[#7C9A86] hover:bg-[#EAE5D8]/50 transition-colors"
                              >
                                <Pin className="w-3.5 h-3.5 fill-[#7C9A86]" />
                              </button>
                            </div>
                          </div>

                          {/* Content Snippet */}
                          <p className="text-xs text-[#586B60] line-clamp-2 mt-1 leading-relaxed">
                            {note.content || "Empty note..."}
                          </p>

                          {/* Footer Meta */}
                          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#EAE5D8]/40 text-[11px] text-[#8E9E94]">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryBadgeClass(
                                note.category
                              )}`}
                            >
                              {note.category}
                            </span>
                            <span
                              className="flex items-center gap-1"
                              title={`Written on ${new Date(note.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}`}
                            >
                              <Clock className="w-3 h-3" />
                              {formatNoteDate(note.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Regular / Recent Notes Section */}
                {otherNotes.length > 0 && (
                  <div className="space-y-1.5">
                    {pinnedNotes.length > 0 && (
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8E9E94]">
                        <span>All Notes</span>
                      </div>
                    )}

                    {otherNotes.map((note) => {
                      const isSelected = !isCreatingNew && selectedNoteId === note.id;
                      return (
                        <div
                          key={note.id}
                          onClick={() => handleSelectNote(note.id)}
                          className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                            isSelected
                              ? "bg-[#FAF7F0] border-[#1E3127] shadow-xs"
                              : "bg-[#FFFFFF] border-[#EAE5D8] hover:border-[#7C9A86]/50 hover:bg-[#FAF9F5]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-serif text-base font-bold text-[#1A241E] line-clamp-1 leading-snug">
                              {note.title || "Untitled Note"}
                            </h4>
                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleTogglePin(e, note.id)}
                                title="Pin note"
                                className="p-1 rounded-lg text-[#8E9E94] hover:text-[#1E3127] hover:bg-[#EAE5D8]/50 transition-colors"
                              >
                                <Pin className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Content Snippet */}
                          <p className="text-xs text-[#586B60] line-clamp-2 mt-1 leading-relaxed">
                            {note.content || "Empty note..."}
                          </p>

                          {/* Footer Meta */}
                          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#EAE5D8]/40 text-[11px] text-[#8E9E94]">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryBadgeClass(
                                note.category
                              )}`}
                            >
                              {note.category}
                            </span>
                            <span
                              className="flex items-center gap-1"
                              title={`Written on ${new Date(note.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}`}
                            >
                              <Clock className="w-3 h-3" />
                              {formatNoteDate(note.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANE: Note Canvas / Editor (Active Note or Draft) */}
        {/* ========================================================= */}
        <div
          className={`lg:col-span-7 flex flex-col bg-[#FFFFFF] rounded-3xl border border-[#EAE5D8] shadow-xs overflow-hidden ${
            mobileView === "list" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Mobile Back Button & Editor Toolbar */}
          <div className="p-4 border-b border-[#EAE5D8] flex flex-wrap items-center justify-between gap-3 bg-[#FCFAF6]/60">
            <div className="flex items-center gap-2">
              {/* Mobile Back to List Button */}
              <button
                onClick={() => setMobileView("list")}
                className="lg:hidden p-2 rounded-xl text-[#586B60] hover:text-[#1A241E] hover:bg-[#EAE5D8]/60 transition-colors"
                title="Back to notes list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* Category Selector Pill */}
              <div className="flex items-center gap-1.5 bg-[#FAF7F0] border border-[#EAE5D8] rounded-2xl px-3 py-1.5">
                <Tag className="w-3.5 h-3.5 text-[#8E9E94]" />
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#1A241E] outline-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pin Toggle Button in Toolbar */}
              <button
                type="button"
                onClick={() => {
                  setIsPinned(!isPinned);
                  setSaveStatus("unsaved");
                }}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isPinned
                    ? "bg-[#EAF2ED] text-[#2F523E] border border-[#C8DFD2]"
                    : "text-[#8E9E94] hover:text-[#1A241E] hover:bg-[#EAE5D8]/50"
                }`}
                title={isPinned ? "Pinned Note" : "Pin Note"}
              >
                <Pin className={`w-4 h-4 ${isPinned ? "fill-[#2F523E]" : ""}`} />
              </button>
            </div>

            {/* Right Action Cluster: Status + Delete + Save Button */}
            <div className="flex items-center gap-3">
              {/* Save Status Indicator */}
              <div className="flex items-center gap-1.5 text-xs">
                {saveStatus === "saving" ? (
                  <span className="flex items-center gap-1.5 text-[#D98A6C] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#D98A6C] animate-pulse" />
                    Saving...
                  </span>
                ) : saveStatus === "unsaved" ? (
                  <span className="flex items-center gap-1.5 text-[#C87452] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#C87452]" />
                    Unsaved
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#5E7E6B] font-medium">
                    <Check className="w-3.5 h-3.5" />
                    Saved
                  </span>
                )}
              </div>

              {/* Delete Button (if not creating new) */}
              {!isCreatingNew && selectedNoteId && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(selectedNoteId)}
                  title="Delete this note"
                  className="p-2 rounded-xl text-[#8E9E94] hover:text-[#C87452] hover:bg-[#FAF0ED] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {/* Primary "Save Note" Button */}
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1E3127] hover:bg-[#2A3F34] text-[#FAF7F0] text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {saveStatus === "saving" ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Note</span>
              </button>
            </div>
          </div>

          {/* Editor Body */}
          <div className="flex-1 p-6 md:p-8 flex flex-col space-y-4 overflow-y-auto">
            {/* Note Heading / Title Input */}
            <div>
              <input
                type="text"
                value={heading}
                onChange={(e) => handleHeadingChange(e.target.value)}
                placeholder="Heading to write..."
                className="w-full font-serif text-2xl md:text-3xl font-bold text-[#1A241E] placeholder:text-[#C5BCB0] bg-transparent border-b border-[#EAE5D8]/80 pb-3 focus:outline-none focus:border-[#7C9A86] transition-colors"
              />
            </div>

            {/* Note Description / Body Textarea */}
            <div className="flex-1 flex flex-col">
              <textarea
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Write your note description, reflections, thoughts, or ideas here..."
                rows={16}
                className="w-full flex-1 font-sans text-base text-[#2A3A30] placeholder:text-[#C5BCB0] bg-transparent resize-y focus:outline-none leading-relaxed min-h-[360px]"
              />
            </div>
          </div>

          {/* Editor Footer / Info Bar */}
          <div className="px-6 py-3 border-t border-[#EAE5D8] flex items-center justify-between text-xs text-[#8E9E94] bg-[#FCFAF6]/60">
            <div className="flex items-center gap-3">
              <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
              <span>·</span>
              <span>{charCount} characters</span>
              {selectedNote && (
                <>
                  <span>·</span>
                  <span title={`Written on ${new Date(selectedNote.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}`}>
                    Written {formatNoteDate(selectedNote.createdAt)}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#FAF7F0] border border-[#EAE5D8] text-[10px] font-mono text-[#586B60]">
                Ctrl+S
              </kbd>
              <span className="hidden sm:inline">to save</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Note Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-[#1A241E]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#EAE5D8] shadow-lg max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 text-[#C87452]">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF0ED] flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1A241E]">
                Delete Note?
              </h3>
            </div>
            <p className="text-xs text-[#586B60] leading-relaxed">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-2xl border border-[#EAE5D8] text-xs font-semibold text-[#586B60] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteNote(deleteConfirmId)}
                className="px-4 py-2 rounded-2xl bg-[#C87452] hover:bg-[#B56342] text-[#FAF7F0] text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
