import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StickyNote, Search, Trash2, Edit3, Plus, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/utils/storageDB';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Note {
  id: string;
  title: string;
  content: string;
  subjectTag?: string;
  date: string;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('General');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);

  useEffect(() => {
    const loadedNotes = db.getSync<Note[]>('notes', []);
    setNotes(loadedNotes);

    const loadedSubjects = db.getSync<any[]>('subjects', []);
    setSubjectsList(loadedSubjects);
  }, []);

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
          ? { ...n, title: noteTitle.trim(), content: noteContent.trim(), subjectTag: selectedTag, date: new Date().toISOString() }
          : n
      );
      toast.success('Note updated');
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: noteTitle.trim(),
        content: noteContent.trim(),
        subjectTag: selectedTag,
        date: new Date().toISOString()
      };
      updated = [newNote, ...notes];
      toast.success('New note saved');
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
  };

  const resetForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setSelectedTag('General');
    setEditingNote(null);
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.subjectTag && n.subjectTag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-7 text-foreground font-sans max-w-7xl mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] flex items-center justify-center flex-shrink-0 shadow-sm">
            <StickyNote strokeWidth={1.8} className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight">
              Academic Notes & Vault
            </h2>
            <p className="text-xs text-[#666675] dark:text-[#9292A2] font-medium mt-0.5">
              Store subject notes, formulas, and important class logs locally
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#9292A2]" />
          <Input
            placeholder="Search notes or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-xs rounded-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Note Editor Form */}
        <Card className="glass-card p-6 space-y-4 h-fit">
          <h3 className="text-sm font-bold text-foreground font-display">
            {editingNote ? 'Edit Note' : 'Create New Note'}
          </h3>

          <Input
            placeholder="Note Title"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
          />

          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General">General Note</SelectItem>
              {subjectsList.map((s) => (
                <SelectItem key={s.id} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Write your note content here..."
            rows={8}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="text-xs leading-relaxed"
          />

          <div className="flex gap-2 pt-1">
            <Button onClick={saveNote} className="flex-1 font-bold text-xs">
              {editingNote ? 'Update Note' : 'Save Note'}
            </Button>

            {editingNote && (
              <Button variant="outline" onClick={resetForm} className="text-xs">
                Cancel
              </Button>
            )}
          </div>
        </Card>

        {/* Notes Grid */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground font-display">
              Saved Notes ({filteredNotes.length})
            </h3>
          </div>

          {filteredNotes.length === 0 ? (
            <Card className="glass-card p-10 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/15 text-[#7467E8] flex items-center justify-center mx-auto">
                <StickyNote strokeWidth={1.8} className="h-6 w-6" />
              </div>
              <p className="text-xs text-[#666675] dark:text-[#9292A2]">
                No notes found. Create your first academic note using the form on the left.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[620px] overflow-y-auto pr-1">
              <AnimatePresence>
                {filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card p-5 space-y-3 flex flex-col justify-between hover:border-[#7467E8]/40 transition-colors"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <h4 className="font-bold text-sm text-foreground font-display line-clamp-1">
                          {note.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button 
                            onClick={() => editNote(note)} 
                            className="h-7 w-7 rounded-full bg-[#F1F0F8] dark:bg-[#20222C] text-[#666675] dark:text-[#B9BBC7] hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                            title="Edit Note"
                          >
                            <Edit3 size={12} strokeWidth={2} />
                          </button>
                          <button 
                            onClick={() => setNoteToDelete(note)} 
                            className="h-7 w-7 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete Note"
                          >
                            <Trash2 size={12} strokeWidth={2} />
                          </button>
                        </div>
                      </div>

                      {note.subjectTag && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7467E8] dark:text-[#A59BFF] bg-[#E8E4FF] dark:bg-[#7467E8]/20 px-2.5 py-0.5 rounded-full mb-2">
                          <Tag size={10} strokeWidth={2.5} />
                          {note.subjectTag}
                        </span>
                      )}

                      <p className="text-xs text-[#666675] dark:text-[#B9BBC7] whitespace-pre-wrap leading-relaxed line-clamp-4">
                        {note.content}
                      </p>
                    </div>

                    <span className="text-[10px] text-[#9292A2] pt-2 border-t border-[#E8E7EF] dark:border-white/[0.08] block">
                      {new Date(note.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Liquid Confirmation Box (Zero Icons, Zero Emojis) */}
      <ConfirmDialog
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => {
          if (noteToDelete) {
            deleteNote(noteToDelete.id);
            setNoteToDelete(null);
          }
        }}
        title="Delete Note"
        description={`Do you really want to delete "${noteToDelete?.title || 'this note'}"? This action cannot be undone.`}
        confirmLabel="Delete Note"
        cancelLabel="Cancel"
        isDestructive={true}
      />
    </div>
  );
};

export default Notes;
