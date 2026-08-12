import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="p-4 sm:p-6 space-y-6 text-slate-100 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-100">
            <StickyNote className="text-indigo-400 h-6 w-6" />
            Academic Notes & Vault
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Store subject notes, formulas, and important class logs locally
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-900 border-slate-700 text-xs text-slate-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Note Editor Form */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200">
            {editingNote ? 'Edit Note' : 'Create New Note'}
          </h3>

          <Input
            placeholder="Note Title"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="bg-slate-950 border-slate-800 text-slate-100"
          />

          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="bg-slate-950 border-slate-800 text-xs text-slate-300">
              <SelectValue placeholder="Select Category Tag" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
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
            className="bg-slate-950 border-slate-800 text-slate-100 text-xs leading-relaxed"
          />

          <div className="flex gap-2">
            <Button onClick={saveNote} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs">
              {editingNote ? 'Update Note' : 'Save Note'}
            </Button>

            {editingNote && (
              <Button variant="outline" onClick={resetForm} className="border-slate-700 text-slate-300 text-xs">
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Notes Grid */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Saved Notes ({filteredNotes.length})</h3>

          {filteredNotes.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-500 text-xs">
              No notes found. Create a new note on the left.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
              <AnimatePresence>
                {filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card p-4 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm text-slate-100">{note.title}</h4>
                        <div className="flex gap-1">
                          <button onClick={() => editNote(note)} className="p-1 text-slate-400 hover:text-slate-200">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => deleteNote(note.id)} className="p-1 text-rose-400 hover:text-rose-300">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {note.subjectTag && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full mb-2">
                          <Tag size={10} />
                          {note.subjectTag}
                        </span>
                      )}

                      <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </p>
                    </div>

                    <span className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80 block">
                      {new Date(note.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
