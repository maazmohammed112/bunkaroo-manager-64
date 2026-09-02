import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  StickyNote, 
  Search, 
  Trash2, 
  Edit3, 
  Tag, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Bookmark,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/utils/storageDB';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Note {
  id: string;
  title: string;
  content: string;
  subjectTag?: string;
  date: string;
  dueDate?: string;
  noteType?: 'general' | 'assignment' | 'exam';
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('General');
  const [noteType, setNoteType] = useState<'general' | 'assignment' | 'exam'>('general');
  const [dueDate, setDueDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'deadlines'>('all');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);

  useEffect(() => {
    // Load from IndexedDB
    const loadedNotes = db.getSync<Note[]>('notes', []);
    setNotes(loadedNotes);

    const loadedSubjects = db.getSync<any[]>('subjects', []);
    setSubjectsList(loadedSubjects);
    setIsLoading(false);
  }, []);

  const formatIndianDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getDeadlineInfo = (dueStr?: string) => {
    if (!dueStr) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueStr);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Overdue by ${Math.abs(diffDays)}d`, variant: 'danger' as const };
    }
    if (diffDays === 0) {
      return { label: 'Due Today', variant: 'warning' as const };
    }
    if (diffDays === 1) {
      return { label: 'Due Tomorrow', variant: 'warning' as const };
    }
    return { label: `Due in ${diffDays} days`, variant: 'safe' as const };
  };

  const saveNote = () => {
    if (!noteTitle.trim()) {
      toast.error('Note title is required');
      return;
    }
    if (!noteContent.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }

    let updated: Note[];

    if (editingNote) {
      updated = notes.map((n) =>
        n.id === editingNote.id
          ? {
              ...n,
              title: noteTitle.trim(),
              content: noteContent.trim(),
              subjectTag: selectedTag,
              noteType,
              dueDate: dueDate || undefined,
              date: new Date().toISOString()
            }
          : n
      );
      toast.success('Note updated');
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: noteTitle.trim(),
        content: noteContent.trim(),
        subjectTag: selectedTag,
        noteType,
        dueDate: dueDate || undefined,
        date: new Date().toISOString()
      };
      updated = [newNote, ...notes];
      toast.success(noteType === 'general' ? 'Note saved' : 'Deadline task logged');
    }

    setNotes(updated);
    db.set('notes', updated);
    resetForm();
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    db.set('notes', updated);
    toast.success('Note deleted');
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setSelectedTag(note.subjectTag || 'General');
    setNoteType(note.noteType || 'general');
    setDueDate(note.dueDate || '');
  };

  const resetForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setSelectedTag('General');
    setNoteType('general');
    setDueDate('');
    setEditingNote(null);
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.subjectTag && n.subjectTag.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === 'deadlines') {
      return !!n.dueDate || n.noteType === 'assignment' || n.noteType === 'exam';
    }
    return true;
  });

  return (
    <div className="space-y-6 text-foreground font-sans max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] flex items-center justify-center flex-shrink-0 shadow-sm">
            <StickyNote strokeWidth={1.8} className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight">
              Academic Notes & Deadlines Vault
            </h2>
            <p className="text-xs text-[#666675] dark:text-[#9292A2] font-medium mt-0.5">
              Subject notes, assignment due dates, and upcoming exam reminders stored securely
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#9292A2]" />
          <Input
            placeholder="Search notes, deadlines, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-xs rounded-full h-9"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1 bg-[#F1F0F8] dark:bg-[#181A22] rounded-full border border-[#E8E7EF] dark:border-white/10 w-fit max-w-full overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => setFilterMode('all')}
          className={`text-xs font-bold py-1.5 px-4 rounded-full transition-all cursor-pointer ${
            filterMode === 'all'
              ? 'bg-[#7467E8] text-white shadow-xs'
              : 'text-[#666675] dark:text-[#9292A2] hover:text-foreground'
          }`}
        >
          All Notes ({notes.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterMode('deadlines')}
          className={`text-xs font-bold py-1.5 px-4 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
            filterMode === 'deadlines'
              ? 'bg-[#7467E8] text-white shadow-xs'
              : 'text-[#666675] dark:text-[#9292A2] hover:text-foreground'
          }`}
        >
          <Clock size={12} />
          <span>Deadlines & Exams ({notes.filter((n) => n.dueDate || n.noteType !== 'general').length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Note Editor Form */}
        <Card className="glass-card p-5 sm:p-6 space-y-4 h-fit rounded-[24px]">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-foreground font-display">
              {editingNote ? 'Edit Item' : 'New Academic Item'}
            </h3>
            {editingNote && (
              <span className="text-[10px] font-bold text-[#7467E8] bg-[#7467E8]/10 px-2 py-0.5 rounded-full">
                Editing Mode
              </span>
            )}
          </div>

          {/* Type Selector: General / Assignment / Exam */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F1F0F8] dark:bg-[#15161F] rounded-xl border border-[#E8E7EF] dark:border-white/10 text-center">
            {(['general', 'assignment', 'exam'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setNoteType(t)}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                  noteType === t
                    ? 'bg-white dark:bg-[#20222C] text-foreground shadow-xs'
                    : 'text-[#666675] dark:text-[#9292A2] hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <Input
            placeholder={noteType === 'exam' ? 'Exam Title (e.g. Mid-Term 1)' : noteType === 'assignment' ? 'Assignment Title (e.g. Lab Record 3)' : 'Note Title'}
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="rounded-xl text-xs h-10"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="rounded-xl text-xs h-10">
                <SelectValue placeholder="Category Tag" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="General" className="text-xs">General</SelectItem>
                {subjectsList.map((s) => (
                  <SelectItem key={s.id} value={s.name} className="text-xs">
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Optional Due Date */}
            <div className="relative">
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-xl text-xs h-10"
                title="Due date or exam date"
              />
            </div>
          </div>

          <Textarea
            placeholder={noteType === 'exam' ? 'Exam syllabus, chapters covered, or room details...' : 'Note content, formula summary, or assignment instructions...'}
            rows={6}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="text-xs leading-relaxed rounded-xl"
          />

          <div className="flex gap-2 pt-1">
            <Button onClick={saveNote} className="flex-1 font-bold text-xs rounded-full bg-[#7467E8] hover:bg-[#6658DF] text-white cursor-pointer h-9">
              {editingNote ? 'Update Item' : 'Save Item'}
            </Button>

            {editingNote && (
              <Button variant="outline" onClick={resetForm} className="text-xs rounded-full cursor-pointer h-9">
                Cancel
              </Button>
            )}
          </div>
        </Card>

        {/* Notes & Deadlines Grid */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground font-display">
              {filterMode === 'deadlines' ? 'Upcoming Deadlines & Exams' : 'Saved Notes'} ({filteredNotes.length})
            </h3>
          </div>

          {isLoading ? (
            /* Skeleton Loading State */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 rounded-[24px] bg-white/40 dark:bg-[#181A22]/40 border border-[#E8E7EF] dark:border-white/10 space-y-3 animate-pulse">
                  <div className="h-4 bg-[#E8E7EF] dark:bg-white/10 rounded-full w-3/4"></div>
                  <div className="h-3 bg-[#E8E7EF] dark:bg-white/10 rounded-full w-1/3"></div>
                  <div className="h-16 bg-[#E8E7EF] dark:bg-white/10 rounded-2xl w-full"></div>
                </div>
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <Card className="glass-card p-10 text-center space-y-3 rounded-[24px]">
              <div className="h-12 w-12 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/15 text-[#7467E8] flex items-center justify-center mx-auto">
                <StickyNote strokeWidth={1.8} className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-sm text-foreground font-display">
                {filterMode === 'deadlines' ? 'No upcoming deadlines or exams' : 'No notes found'}
              </h4>
              <p className="text-xs text-[#666675] dark:text-[#9292A2]">
                {filterMode === 'deadlines'
                  ? 'Add your assignment due dates or exam schedules using the form on the left.'
                  : 'Create your first academic note or formula summary using the form on the left.'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[640px] overflow-y-auto pr-1">
              <AnimatePresence>
                {filteredNotes.map((note) => {
                  const deadline = getDeadlineInfo(note.dueDate);

                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass-card p-5 rounded-[24px] space-y-3 flex flex-col justify-between hover:border-[#7467E8]/40 transition-colors"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <h4 className="font-bold text-sm text-foreground font-display line-clamp-1">
                            {note.title}
                          </h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => editNote(note)}
                              className="h-7 w-7 rounded-full bg-[#F1F0F8] dark:bg-[#20222C] text-[#666675] dark:text-[#B9BBC7] hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 size={12} strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setNoteToDelete(note)}
                              className="h-7 w-7 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={12} strokeWidth={2} />
                            </button>
                          </div>
                        </div>

                        {/* Badges Row: Subject Tag + Deadline Chip */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                          {note.subjectTag && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7467E8] dark:text-[#A59BFF] bg-[#E8E4FF] dark:bg-[#7467E8]/20 px-2.5 py-0.5 rounded-full">
                              <Tag size={9} strokeWidth={2.5} />
                              {note.subjectTag}
                            </span>
                          )}

                          {note.noteType && note.noteType !== 'general' && (
                            <span className="text-[10px] font-bold capitalize px-2 py-0.5 rounded-full bg-[#F1F0F8] dark:bg-[#20222C] text-foreground">
                              {note.noteType}
                            </span>
                          )}

                          {deadline && (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                deadline.variant === 'danger'
                                  ? 'bg-[#F7DDE9] text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                                  : deadline.variant === 'warning'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                                  : 'bg-[#DDEDEA] text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                              }`}
                            >
                              <Clock size={9} strokeWidth={2.5} />
                              {deadline.label}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#666675] dark:text-[#B9BBC7] whitespace-pre-wrap leading-relaxed line-clamp-4">
                          {note.content}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#E8E7EF] dark:border-white/[0.08] flex items-center justify-between text-[10px] text-[#9292A2]">
                        <span>{formatIndianDate(note.date)}</span>
                        {note.dueDate && (
                          <span className="font-semibold text-foreground">
                            Due: {formatIndianDate(note.dueDate)}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => {
          if (noteToDelete) {
            deleteNote(noteToDelete.id);
            setNoteToDelete(null);
          }
        }}
        title="Delete Item"
        description={`Do you really want to delete "${noteToDelete?.title || 'this item'}"? This action cannot be undone.`}
        confirmLabel="Delete Item"
        cancelLabel="Cancel"
        isDestructive={true}
      />
    </div>
  );
};

export default Notes;
