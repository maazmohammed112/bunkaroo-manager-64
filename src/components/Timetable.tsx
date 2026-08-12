import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, X, Pencil, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { db } from '@/utils/storageDB';

interface Subject {
  id: string;
  name: string;
  totalClasses: number;
  attendedClasses: number;
  days: string[];
  requiredAttendance?: number;
}

const Timetable: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedDays, setEditedDays] = useState<string[]>([]);
  const [editedRequiredAttendance, setEditedRequiredAttendance] = useState(75);
  const [editedTotalClasses, setEditedTotalClasses] = useState(0);
  const [editedAttendedClasses, setEditedAttendedClasses] = useState(0);

  useEffect(() => {
    const loaded = db.getSync<Subject[]>('subjects', []);
    setSubjects(loaded);
  }, []);

  const markAttendance = (subjectId: string, attended: boolean) => {
    const updated = subjects.map((subj) => {
      if (subj.id === subjectId) {
        return {
          ...subj,
          totalClasses: subj.totalClasses + 1,
          attendedClasses: attended ? subj.attendedClasses + 1 : subj.attendedClasses
        };
      }
      return subj;
    });

    setSubjects(updated);
    db.set('subjects', updated);
    toast.success(attended ? 'Class marked as Attended' : 'Class marked as Missed');
  };

  const getAttendanceStatus = (attended: number, total: number, required = 75) => {
    if (total === 0) return 'neutral';
    const percentage = (attended / total) * 100;
    if (percentage >= required) return 'good';
    if (percentage >= required * 0.9) return 'warning';
    return 'danger';
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setEditedName(subject.name);
    setEditedDays(subject.days || []);
    setEditedRequiredAttendance(subject.requiredAttendance || 75);
    setEditedTotalClasses(subject.totalClasses);
    setEditedAttendedClasses(subject.attendedClasses);
    setIsEditDialogOpen(true);
  };

  const handleDayToggle = (day: string) => {
    setEditedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveEdit = () => {
    if (!editingSubject) return;
    if (!editedName.trim()) {
      toast.error('Subject name is required');
      return;
    }

    const updated = subjects.map((subj) => {
      if (subj.id === editingSubject.id) {
        return {
          ...subj,
          name: editedName,
          days: editedDays,
          requiredAttendance: editedRequiredAttendance,
          totalClasses: editedTotalClasses,
          attendedClasses: editedAttendedClasses
        };
      }
      return subj;
    });

    setSubjects(updated);
    db.set('subjects', updated);
    setIsEditDialogOpen(false);
    toast.success('Subject schedule updated');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 text-slate-100 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2 text-slate-100">
            <Calendar strokeWidth={1.5} className="text-indigo-400 h-6 w-6" />
            Weekly Timetable Schedule
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Log daily class attendance with 1-click Attended / Missed actions
          </p>
        </div>
      </div>

      {subjects.length === 0 ? (
        <Card className="glass-card p-8 text-center text-slate-400 space-y-3">
          <Clock strokeWidth={1.5} className="h-10 w-10 text-indigo-400 mx-auto opacity-80" />
          <p className="text-sm">No subjects in schedule yet. Add a subject in the Add Subject tab.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {days.map((day) => {
            const daySubjects = subjects.filter((s) => s.days?.includes(day));

            return (
              <div key={day} className="space-y-3">
                <h3 className="text-base font-display font-bold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                  {day}
                </h3>

                {daySubjects.length === 0 ? (
                  <p className="text-xs text-slate-500 italic pl-4">No lectures scheduled</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {daySubjects.map((subj) => {
                      const status = getAttendanceStatus(subj.attendedClasses, subj.totalClasses, subj.requiredAttendance);
                      const pct = subj.totalClasses === 0 ? 0 : Math.round((subj.attendedClasses / subj.totalClasses) * 100);

                      return (
                        <Card key={`${day}-${subj.id}`} className="glass-card p-4 space-y-3 border-l-4 border-l-indigo-500">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-base text-slate-100 font-display">{subj.name}</h4>
                              <p className="text-xs text-slate-400">
                                {subj.attendedClasses} of {subj.totalClasses} lectures
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => openEditDialog(subj)}
                                className="p-1 text-slate-400 hover:text-slate-200"
                                title="Edit Subject"
                              >
                                <Pencil size={14} strokeWidth={1.5} />
                              </button>
                              <Badge 
                                variant={status === 'good' ? 'default' : status === 'warning' ? 'outline' : 'destructive'}
                                className="text-xs font-semibold"
                              >
                                {pct}%
                              </Badge>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => markAttendance(subj.id, true)}
                              className="flex-1 py-1.5 px-3 bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all font-display"
                            >
                              <Check size={14} strokeWidth={1.5} />
                              Attend
                            </button>
                            <button
                              onClick={() => markAttendance(subj.id, false)}
                              className="flex-1 py-1.5 px-3 bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all font-display"
                            >
                              <X size={14} strokeWidth={1.5} />
                              Miss
                            </button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Subject Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Schedule</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs">Subject Name</Label>
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="bg-slate-950 border-slate-700"
              />
            </div>

            <div>
              <Label className="text-xs mb-1.5 block">Schedule Days</Label>
              <div className="grid grid-cols-3 gap-2">
                {days.map((day) => (
                  <div
                    key={day}
                    onClick={() => handleDayToggle(day)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${
                      editedDays.includes(day)
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                        : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    <Checkbox checked={editedDays.includes(day)} />
                    <span>{day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Total Classes</Label>
                <Input
                  type="number"
                  min="0"
                  value={editedTotalClasses}
                  onChange={(e) => setEditedTotalClasses(Number(e.target.value))}
                  className="bg-slate-950 border-slate-700"
                />
              </div>
              <div>
                <Label className="text-xs">Attended Classes</Label>
                <Input
                  type="number"
                  min="0"
                  value={editedAttendedClasses}
                  onChange={(e) => setEditedAttendedClasses(Number(e.target.value))}
                  className="bg-slate-950 border-slate-700"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Required Target Threshold (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={editedRequiredAttendance}
                onChange={(e) => setEditedRequiredAttendance(Number(e.target.value))}
                className="bg-slate-950 border-slate-700"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSaveEdit} className="bg-indigo-600">Save Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Timetable;
