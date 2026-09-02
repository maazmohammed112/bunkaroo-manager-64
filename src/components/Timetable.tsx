import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, X, Pencil, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
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
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  useEffect(() => {
    const loaded = db.getSync<Subject[]>('subjects', []);
    setSubjects(loaded);
  }, []);

  const handleDeleteSubject = (id: string) => {
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    db.set('subjects', updated);
    setIsEditDialogOpen(false);
    toast.success('Subject removed');
  };

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
    if (editedAttendedClasses > editedTotalClasses) {
      toast.error('Attended classes cannot exceed total classes');
      return;
    }
    if (editedTotalClasses < 0 || editedAttendedClasses < 0) {
      toast.error('Class counts cannot be negative');
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
    <div className="space-y-7 text-foreground font-sans max-w-7xl mx-auto">
      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Calendar strokeWidth={1.8} className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight">
              Weekly Timetable Schedule
            </h2>
            <p className="text-xs text-[#666675] dark:text-[#9292A2] font-medium mt-0.5">
              Log daily class attendance with 1-click Attended / Missed actions
            </p>
          </div>
        </div>
      </div>

      {subjects.length === 0 ? (
        <Card className="glass-card p-10 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="h-14 w-14 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/15 text-[#7467E8] flex items-center justify-center mx-auto">
            <Clock strokeWidth={1.8} className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground font-display">No subjects scheduled yet</h3>
            <p className="text-xs text-[#666675] dark:text-[#9292A2]">
              Add your college subjects and lecture days in the Add Subject tab to begin tracking.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {days.map((day) => {
            const daySubjects = subjects.filter((s) => s.days?.includes(day));

            return (
              <div key={day} className="space-y-3.5">
                <div className="flex items-center gap-2.5 pb-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#7467E8]"></span>
                  <h3 className="text-sm sm:text-base font-bold font-display text-foreground tracking-tight">
                    {day}
                  </h3>
                  <span className="text-[11px] font-semibold text-[#666675] dark:text-[#9292A2] bg-[#F1F0F8] dark:bg-[#20222C] px-2.5 py-0.5 rounded-full">
                    {daySubjects.length} {daySubjects.length === 1 ? 'class' : 'classes'}
                  </span>
                </div>

                {daySubjects.length === 0 ? (
                  <div className="p-4 rounded-[20px] bg-white/50 dark:bg-[#181A22]/50 border border-dashed border-[#E8E7EF] dark:border-white/10 text-center">
                    <p className="text-xs text-[#9292A2] dark:text-[#888B98] italic">No lectures scheduled for {day}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {daySubjects.map((subj) => {
                      const status = getAttendanceStatus(subj.attendedClasses, subj.totalClasses, subj.requiredAttendance);
                      const pct = subj.totalClasses === 0 ? 0 : Math.round((subj.attendedClasses / subj.totalClasses) * 100);

                      return (
                        <Card 
                          key={`${day}-${subj.id}`} 
                          className="glass-card p-5 space-y-4 hover:border-[#7467E8]/40 dark:hover:border-[#7467E8]/40"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-1">
                              <h4 className="font-bold text-sm sm:text-base text-foreground font-display leading-tight line-clamp-1">
                                {subj.name}
                              </h4>
                              <p className="text-xs text-[#666675] dark:text-[#9292A2] font-medium">
                                <span className="font-bold text-foreground">{subj.attendedClasses}</span> attended of <span className="font-bold text-foreground">{subj.totalClasses}</span> held
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => openEditDialog(subj)}
                                className="h-8 w-8 rounded-full bg-[#F1F0F8] dark:bg-[#20222C] text-[#666675] dark:text-[#B9BBC7] hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                                title="Edit Subject Schedule"
                                aria-label="Edit Subject"
                              >
                                <Pencil size={13} strokeWidth={2} />
                              </button>
                              <Badge 
                                variant={status === 'good' ? 'mint' : status === 'warning' ? 'warning' : 'destructive'}
                              >
                                {pct}%
                              </Badge>
                            </div>
                          </div>

                          {/* Progress bar visual */}
                          <div className="w-full bg-[#F1F0F8] dark:bg-[#20222C] rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                status === 'good' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>

                          {/* 1-Click Attend / Miss Actions with Soft Pastel Styling */}
                          <div className="flex gap-2.5 pt-1">
                            <button
                              onClick={() => markAttendance(subj.id, true)}
                              className="flex-1 py-2.5 px-3 bg-[#DDEDEA] hover:bg-[#cde4e0] dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-900 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold rounded-[14px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                            >
                              <Check size={15} strokeWidth={2.5} />
                              Attend
                            </button>
                            <button
                              onClick={() => markAttendance(subj.id, false)}
                              className="flex-1 py-2.5 px-3 bg-[#F7DDE9] hover:bg-[#f3cbdc] dark:bg-rose-500/15 dark:hover:bg-rose-500/25 text-rose-900 dark:text-rose-300 border border-rose-500/20 text-xs font-bold rounded-[14px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                            >
                              <X size={15} strokeWidth={2.5} />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-foreground">
              Edit Schedule Details
            </DialogTitle>
            <DialogDescription className="text-xs text-[#666675] dark:text-[#9292A2]">
              Update weekly lecture days and subject name
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Subject Name</Label>
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="e.g. Data Structures"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2] mb-2 block">
                Schedule Days
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {days.map((day) => (
                  <div
                    key={day}
                    onClick={() => handleDayToggle(day)}
                    className={`flex items-center gap-2 p-2.5 rounded-[14px] border text-xs font-semibold cursor-pointer transition-all ${
                      editedDays.includes(day)
                        ? 'border-[#7467E8] bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] dark:text-[#A59BFF]'
                        : 'border-[#E8E7EF] dark:border-white/10 bg-[#F1F0F8]/60 dark:bg-[#20222C]/60 text-[#666675] dark:text-[#B9BBC7]'
                    }`}
                  >
                    <Checkbox checked={editedDays.includes(day)} className="pointer-events-none" />
                    <span>{day.slice(0, 3)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Total Classes</Label>
                <Input
                  type="number"
                  min="0"
                  value={editedTotalClasses}
                  onChange={(e) => setEditedTotalClasses(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Attended Classes</Label>
                <Input
                  type="number"
                  min="0"
                  value={editedAttendedClasses}
                  onChange={(e) => setEditedAttendedClasses(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Required Target Threshold (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={editedRequiredAttendance}
                onChange={(e) => setEditedRequiredAttendance(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row items-center justify-between gap-2 pt-3">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={() => setSubjectToDelete(editingSubject)}
              className="text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs rounded-full cursor-pointer mr-auto px-3"
            >
              Delete Subject
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(false)} className="rounded-full text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit} className="rounded-full text-xs font-bold px-5">
                Save Schedule
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Liquid Confirmation Box (Zero Icons, Zero Emojis) */}
      <ConfirmDialog
        isOpen={!!subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={() => {
          if (subjectToDelete) {
            handleDeleteSubject(subjectToDelete.id);
            setSubjectToDelete(null);
          }
        }}
        title="Delete Subject"
        description={`Do you really want to delete "${subjectToDelete?.name || 'this subject'}"? This action cannot be undone and will permanently remove all attendance history.`}
        confirmLabel="Delete Subject"
        cancelLabel="Cancel"
        isDestructive={true}
      />
    </div>
  );
};

export default Timetable;
