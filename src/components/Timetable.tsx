import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Check, 
  X, 
  Pencil, 
  Clock, 
  CheckCheck, 
  Undo2, 
  Settings2, 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays, 
  Coffee, 
  Sparkles, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
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

interface TimetableSettings {
  mode: 'classic' | 'calendar';
  weeklyHolidays: string[];
  startDate: string;
  semesterEndDate: string;
}

interface DailyAttendanceRecord {
  status: 'regular' | 'holiday' | 'sick_leave';
  note?: string;
  classLogs?: Record<string, 'attended' | 'missed'>;
}

const ALL_WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Timetable: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeView, setActiveView] = useState<'today' | 'calendar' | 'weekly'>('today');

  // Timetable Configuration & Settings
  const [settings, setSettings] = useState<TimetableSettings>(() => {
    return db.getSync('timetable_settings', {
      mode: 'calendar',
      weeklyHolidays: ['Saturday', 'Sunday'],
      startDate: new Date().toISOString().split('T')[0],
      semesterEndDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveReason, setLeaveReason] = useState('Sick Leave');
  const [leaveNote, setLeaveNote] = useState('');

  // Daily records stored in IndexedDB
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyAttendanceRecord>>(() => {
    return db.getSync('attendance_daily_logs', {});
  });

  // Edit Subject Dialog State
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

  const saveSettings = (newSettings: TimetableSettings) => {
    setSettings(newSettings);
    db.set('timetable_settings', newSettings);
    setIsSettingsOpen(false);
    toast.success('Timetable configuration saved');
  };

  const formatIndianDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const isWeeklyHoliday = (dateStr: string) => {
    const day = getDayName(dateStr);
    return settings.weeklyHolidays.includes(day);
  };

  // 1-Tap Mark All Present Today with Functional Undo
  const markAllPresentToday = () => {
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaySubjects = subjects.filter((s) => s.days?.includes(todayName));

    if (todaySubjects.length === 0) {
      toast.info(`No classes scheduled for today (${todayName})`);
      return;
    }

    const previousSubjects = [...subjects];
    const previousLogs = { ...dailyLogs };

    const updated = subjects.map((subj) => {
      if (subj.days?.includes(todayName)) {
        return {
          ...subj,
          totalClasses: subj.totalClasses + 1,
          attendedClasses: subj.attendedClasses + 1
        };
      }
      return subj;
    });

    setSubjects(updated);
    db.set('subjects', updated);

    // Save into daily log
    const todayStr = new Date().toISOString().split('T')[0];
    const newDailyLogs = { ...dailyLogs };
    const classLogs = { ...(newDailyLogs[todayStr]?.classLogs || {}) };
    todaySubjects.forEach((s) => {
      classLogs[s.id] = 'attended';
    });
    newDailyLogs[todayStr] = {
      status: 'regular',
      classLogs
    };
    setDailyLogs(newDailyLogs);
    db.set('attendance_daily_logs', newDailyLogs);

    toast.success(`Marked all ${todaySubjects.length} classes as Attended for today!`, {
      action: {
        label: 'Undo',
        onClick: () => {
          setSubjects(previousSubjects);
          db.set('subjects', previousSubjects);
          setDailyLogs(previousLogs);
          db.set('attendance_daily_logs', previousLogs);
          toast.info('Today’s bulk attendance has been reverted');
        }
      },
      duration: 6000
    });
  };

  const markAttendance = (subjectId: string, attended: boolean, targetDate?: string) => {
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

    // Record in daily log if date is provided
    if (targetDate) {
      const newDailyLogs = { ...dailyLogs };
      const currentRecord = newDailyLogs[targetDate] || { status: 'regular', classLogs: {} };
      const classLogs = { ...(currentRecord.classLogs || {}) };
      classLogs[subjectId] = attended ? 'attended' : 'missed';
      newDailyLogs[targetDate] = {
        ...currentRecord,
        classLogs
      };
      setDailyLogs(newDailyLogs);
      db.set('attendance_daily_logs', newDailyLogs);
    }

    toast.success(attended ? 'Class marked as Attended' : 'Class marked as Missed');
  };

  const markDayAsLeave = () => {
    const newDailyLogs = { ...dailyLogs };
    newDailyLogs[selectedDate] = {
      status: leaveReason === 'Sick Leave' ? 'sick_leave' : 'holiday',
      note: leaveNote.trim() || leaveReason
    };
    setDailyLogs(newDailyLogs);
    db.set('attendance_daily_logs', newDailyLogs);
    setIsLeaveModalOpen(false);
    setLeaveNote('');
    toast.success(`Marked ${formatIndianDate(selectedDate)} as ${leaveReason}`);
  };

  const removeDayLeave = (dateStr: string) => {
    const newDailyLogs = { ...dailyLogs };
    delete newDailyLogs[dateStr];
    setDailyLogs(newDailyLogs);
    db.set('attendance_daily_logs', newDailyLogs);
    toast.info('Holiday status removed. Regular classes active.');
  };

  const changeDateBy = (offset: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offset);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const getAttendanceStatus = (attended: number, total: number, required = 75) => {
    if (total === 0) return 'neutral';
    const percentage = (attended / total) * 100;
    if (percentage >= required) return 'good';
    if (percentage >= required * 0.9) return 'warning';
    return 'danger';
  };

  const handleDeleteSubject = (id: string) => {
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    db.set('subjects', updated);
    setIsEditDialogOpen(false);
    toast.success('Subject removed');
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

  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const selectedDayName = getDayName(selectedDate);
  const selectedDateLog = dailyLogs[selectedDate];
  const isSelectedDateHoliday = isWeeklyHoliday(selectedDate) || selectedDateLog?.status === 'holiday' || selectedDateLog?.status === 'sick_leave';
  const selectedDaySubjects = subjects.filter((s) => s.days?.includes(selectedDayName));
  const todaySubjects = subjects.filter((s) => s.days?.includes(todayDayName));

  return (
    <div className="space-y-6 text-foreground font-sans max-w-7xl mx-auto">
      {/* Top Header & Navigation Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] flex items-center justify-center flex-shrink-0 shadow-sm">
            <CalendarDays strokeWidth={1.8} className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight">
              Class Timetable & Attendance
            </h2>
            <p className="text-xs text-[#666675] dark:text-[#9292A2] font-medium mt-0.5">
              {settings.mode === 'calendar' ? 'Calendar-linked daily tracking with holiday support' : 'Weekly lecture logging and schedule tracker'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          {/* 1-Tap Mark All Present Button */}
          <Button
            onClick={markAllPresentToday}
            className="rounded-full text-xs font-bold bg-[#7467E8] hover:bg-[#6658DF] text-white shadow-sm flex items-center gap-1.5 cursor-pointer h-9 px-3.5"
            title="Mark all classes for today as Attended in 1-click"
          >
            <CheckCheck size={14} strokeWidth={2.2} />
            <span>Mark All Present Today</span>
          </Button>

          {/* Timetable Configuration Dialog */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="rounded-full text-xs font-semibold gap-1.5 cursor-pointer h-9 px-3"
            title="Configure tracking mode, weekly holidays, and semester end date"
          >
            <Settings2 size={14} />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </div>
      </div>

      {/* Segmented View Switcher */}
      <div className="flex p-1 bg-[#F1F0F8] dark:bg-[#181A22] rounded-full border border-[#E8E7EF] dark:border-white/10 w-fit max-w-full overflow-x-auto select-none">
        <button
          type="button"
          onClick={() => setActiveView('today')}
          className={`text-xs font-bold py-1.5 px-4 rounded-full transition-all cursor-pointer ${
            activeView === 'today'
              ? 'bg-[#7467E8] text-white shadow-xs'
              : 'text-[#666675] dark:text-[#9292A2] hover:text-foreground'
          }`}
        >
          Today's Classes
        </button>

        <button
          type="button"
          onClick={() => setActiveView('calendar')}
          className={`text-xs font-bold py-1.5 px-4 rounded-full transition-all cursor-pointer ${
            activeView === 'calendar'
              ? 'bg-[#7467E8] text-white shadow-xs'
              : 'text-[#666675] dark:text-[#9292A2] hover:text-foreground'
          }`}
        >
          Calendar Date View
        </button>

        <button
          type="button"
          onClick={() => setActiveView('weekly')}
          className={`text-xs font-bold py-1.5 px-4 rounded-full transition-all cursor-pointer ${
            activeView === 'weekly'
              ? 'bg-[#7467E8] text-white shadow-xs'
              : 'text-[#666675] dark:text-[#9292A2] hover:text-foreground'
          }`}
        >
          Weekly Overview
        </button>
      </div>

      {/* VIEW 1: TODAY'S CLASSES */}
      {activeView === 'today' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#7467E8]"></span>
              <h3 className="text-base font-bold font-display text-foreground">
                Today — {todayDayName}, {formatIndianDate(new Date().toISOString())}
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#666675] dark:text-[#9292A2] bg-[#F1F0F8] dark:bg-[#20222C] px-3 py-1 rounded-full">
              {todaySubjects.length} {todaySubjects.length === 1 ? 'class scheduled' : 'classes scheduled'}
            </span>
          </div>

          {todaySubjects.length === 0 ? (
            <Card className="glass-card p-8 text-center space-y-3 max-w-md mx-auto my-6">
              <div className="h-12 w-12 rounded-full bg-[#DDEDEA] dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
                <Coffee size={24} strokeWidth={2} />
              </div>
              <h4 className="font-bold text-sm text-foreground font-display">No classes scheduled for today!</h4>
              <p className="text-xs text-[#666675] dark:text-[#9292A2]">
                Enjoy your break or switch to the Weekly Overview to review your full timetable.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {todaySubjects.map((subj) => {
                const status = getAttendanceStatus(subj.attendedClasses, subj.totalClasses, subj.requiredAttendance);
                const pct = subj.totalClasses === 0 ? 0 : Math.round((subj.attendedClasses / subj.totalClasses) * 100);

                return (
                  <Card key={subj.id} className="glass-card p-5 space-y-4 hover:border-[#7467E8]/40 transition-all">
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
                          type="button"
                          onClick={() => openEditDialog(subj)}
                          className="h-8 w-8 rounded-full bg-[#F1F0F8] dark:bg-[#20222C] text-[#666675] dark:text-[#B9BBC7] hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                          title="Edit Subject"
                        >
                          <Pencil size={13} strokeWidth={2} />
                        </button>
                        <Badge variant={status === 'good' ? 'mint' : status === 'warning' ? 'warning' : 'destructive'}>
                          {pct}%
                        </Badge>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#F1F0F8] dark:bg-[#20222C] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          status === 'good' ? 'bg-emerald-500' : status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>

                    {/* 1-Click Attend / Miss Actions */}
                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => markAttendance(subj.id, true, new Date().toISOString().split('T')[0])}
                        className="flex-1 py-2.5 px-3 bg-[#DDEDEA] hover:bg-[#cde4e0] dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-900 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold rounded-[14px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                      >
                        <Check size={15} strokeWidth={2.5} />
                        Attend
                      </button>
                      <button
                        type="button"
                        onClick={() => markAttendance(subj.id, false, new Date().toISOString().split('T')[0])}
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
      )}

      {/* VIEW 2: CALENDAR DATE VIEW */}
      {activeView === 'calendar' && (
        <div className="space-y-5">
          {/* Date Selector Navigation Bar */}
          <Card className="glass-card p-4 sm:p-5 rounded-[24px] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <button
                type="button"
                onClick={() => changeDateBy(-1)}
                className="h-9 w-9 rounded-full bg-[#F1F0F8] dark:bg-[#20222C] border border-[#E8E7EF] dark:border-white/10 flex items-center justify-center text-foreground hover:bg-[#E8E4FF] transition-colors cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                  className="h-9 rounded-full px-3 text-xs font-semibold w-36 sm:w-40 border-[#E8E7EF] dark:border-white/10"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="h-9 rounded-full text-xs font-bold px-3 cursor-pointer"
                >
                  Today
                </Button>
              </div>

              <button
                type="button"
                onClick={() => changeDateBy(1)}
                className="h-9 w-9 rounded-full bg-[#F1F0F8] dark:bg-[#20222C] border border-[#E8E7EF] dark:border-white/10 flex items-center justify-center text-foreground hover:bg-[#E8E4FF] transition-colors cursor-pointer"
                title="Next Day"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Selected Date Information & Action */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-left sm:text-right">
                <span className="font-bold text-sm font-display text-foreground block">
                  {selectedDayName}, {formatIndianDate(selectedDate)}
                </span>
                <span className="text-[11px] text-[#666675] dark:text-[#9292A2] font-medium">
                  {isSelectedDateHoliday ? 'Non-Instructional / Holiday' : `${selectedDaySubjects.length} classes scheduled`}
                </span>
              </div>

              {isSelectedDateHoliday ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeDayLeave(selectedDate)}
                  className="rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10 cursor-pointer h-9"
                >
                  Clear Holiday
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="rounded-full text-xs font-semibold gap-1.5 cursor-pointer h-9"
                >
                  <Coffee size={13} />
                  Mark Day Off / Leave
                </Button>
              )}
            </div>
          </Card>

          {/* If the day is a Holiday or Leave Day */}
          {isSelectedDateHoliday ? (
            <Card className="glass-card p-8 rounded-[24px] text-center space-y-3 bg-[#DDEDEA]/30 dark:bg-emerald-500/10 border-emerald-500/20 max-w-lg mx-auto">
              <div className="h-12 w-12 rounded-full bg-[#DDEDEA] dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto">
                <Coffee size={22} strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-foreground font-display">
                  {selectedDateLog?.note || (isWeeklyHoliday(selectedDate) ? 'Weekly Holiday' : 'Day Off')}
                </h4>
                <p className="text-xs text-[#666675] dark:text-[#9292A2]">
                  Attendance tracking is paused for this date. No missed classes will be counted against your records.
                </p>
              </div>
            </Card>
          ) : selectedDaySubjects.length === 0 ? (
            <div className="p-8 rounded-[24px] bg-white/50 dark:bg-[#181A22]/50 border border-dashed border-[#E8E7EF] dark:border-white/10 text-center max-w-md mx-auto">
              <p className="text-xs text-[#9292A2] dark:text-[#888B98] italic">
                No classes scheduled for {selectedDayName}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {selectedDaySubjects.map((subj) => {
                const status = getAttendanceStatus(subj.attendedClasses, subj.totalClasses, subj.requiredAttendance);
                const pct = subj.totalClasses === 0 ? 0 : Math.round((subj.attendedClasses / subj.totalClasses) * 100);
                const logForThisDate = selectedDateLog?.classLogs?.[subj.id];

                return (
                  <Card key={`${selectedDate}-${subj.id}`} className="glass-card p-5 space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-foreground font-display leading-tight line-clamp-1">
                          {subj.name}
                        </h4>
                        <p className="text-xs text-[#666675] dark:text-[#9292A2] font-medium mt-0.5">
                          Total: <strong className="text-foreground">{subj.attendedClasses}/{subj.totalClasses}</strong> ({pct}%)
                        </p>
                      </div>

                      {logForThisDate ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          logForThisDate === 'attended' 
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        }`}>
                          Logged: {logForThisDate === 'attended' ? 'Attended' : 'Missed'}
                        </span>
                      ) : (
                        <Badge variant={status === 'good' ? 'mint' : status === 'warning' ? 'warning' : 'destructive'}>
                          {pct}%
                        </Badge>
                      )}
                    </div>

                    {/* Attend / Miss buttons for this date */}
                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => markAttendance(subj.id, true, selectedDate)}
                        className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-[14px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                          logForThisDate === 'attended'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-[#DDEDEA] hover:bg-[#cde4e0] dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border border-emerald-500/20'
                        }`}
                      >
                        <Check size={14} strokeWidth={2.5} />
                        Attended
                      </button>

                      <button
                        type="button"
                        onClick={() => markAttendance(subj.id, false, selectedDate)}
                        className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-[14px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                          logForThisDate === 'missed'
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-[#F7DDE9] hover:bg-[#f3cbdc] dark:bg-rose-500/15 text-rose-900 dark:text-rose-300 border border-rose-500/20'
                        }`}
                      >
                        <X size={14} strokeWidth={2.5} />
                        Missed
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: FULL WEEKLY OVERVIEW */}
      {activeView === 'weekly' && (
        <div className="space-y-8">
          {ALL_WEEKDAYS.map((day) => {
            const daySubjects = subjects.filter((s) => s.days?.includes(day));
            const isHoliday = settings.weeklyHolidays.includes(day);

            return (
              <div key={day} className="space-y-3.5">
                <div className="flex items-center gap-2.5 pb-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${isHoliday ? 'bg-[#9292A2]' : 'bg-[#7467E8]'}`}></span>
                  <h3 className="text-sm sm:text-base font-bold font-display text-foreground tracking-tight">
                    {day}
                  </h3>
                  <span className="text-[11px] font-semibold text-[#666675] dark:text-[#9292A2] bg-[#F1F0F8] dark:bg-[#20222C] px-2.5 py-0.5 rounded-full">
                    {isHoliday ? 'Weekly Holiday' : `${daySubjects.length} ${daySubjects.length === 1 ? 'class' : 'classes'}`}
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
                        <Card key={`${day}-${subj.id}`} className="glass-card p-5 space-y-4 hover:border-[#7467E8]/40">
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
                                type="button"
                                onClick={() => openEditDialog(subj)}
                                className="h-8 w-8 rounded-full bg-[#F1F0F8] dark:bg-[#20222C] text-[#666675] dark:text-[#B9BBC7] hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                                title="Edit Subject"
                              >
                                <Pencil size={13} strokeWidth={2} />
                              </button>
                              <Badge variant={status === 'good' ? 'mint' : status === 'warning' ? 'warning' : 'destructive'}>
                                {pct}%
                              </Badge>
                            </div>
                          </div>

                          <div className="flex gap-2.5 pt-1">
                            <button
                              type="button"
                              onClick={() => markAttendance(subj.id, true)}
                              className="flex-1 py-2.5 px-3 bg-[#DDEDEA] hover:bg-[#cde4e0] dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold rounded-[14px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                            >
                              <Check size={15} strokeWidth={2.5} />
                              Attend
                            </button>
                            <button
                              type="button"
                              onClick={() => markAttendance(subj.id, false)}
                              className="flex-1 py-2.5 px-3 bg-[#F7DDE9] hover:bg-[#f3cbdc] dark:bg-rose-500/15 text-rose-900 dark:text-rose-300 border border-rose-500/20 text-xs font-bold rounded-[14px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
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

      {/* MODAL 1: Mark Full Day as Holiday / Leave */}
      <Dialog open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
        <DialogContent className="max-w-md rounded-[28px]">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Coffee size={18} className="text-[#7467E8]" />
              Mark Day Off / Leave
            </DialogTitle>
            <DialogDescription className="text-xs text-[#666675] dark:text-[#9292A2]">
              Mark {formatIndianDate(selectedDate)} as a non-instructional day so classes aren't counted against your attendance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Reason / Leave Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Sick Leave', 'College Fest / Event', 'Prep Leave / Exam', 'Personal Holiday'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLeaveReason(type)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold text-left transition-all border ${
                      leaveReason === type 
                        ? 'bg-[#7467E8] text-white border-[#7467E8]' 
                        : 'bg-[#F6F6FA] dark:bg-[#15161F] text-foreground border-[#E8E7EF] dark:border-white/10 hover:border-[#7467E8]/40'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Optional Note</Label>
              <Input
                placeholder="e.g. Annual Sports Day or Doctor Appointment"
                value={leaveNote}
                onChange={(e) => setLeaveNote(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setIsLeaveModalOpen(false)} className="rounded-full text-xs">
              Cancel
            </Button>
            <Button onClick={markDayAsLeave} className="rounded-full text-xs font-bold bg-[#7467E8] hover:bg-[#6658DF] text-white">
              Save Day Off
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Timetable Configuration & Settings */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md rounded-[28px]">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Settings2 size={18} className="text-[#7467E8]" />
              Timetable Configuration
            </DialogTitle>
            <DialogDescription className="text-xs text-[#666675] dark:text-[#9292A2]">
              Customize your tracking mode, weekly off-days, and semester timeline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Mode Selector */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-[#F6F6FA] dark:bg-[#15161F] border border-[#E8E7EF] dark:border-white/10">
              <span className="font-bold text-foreground block">Tracking Mode</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, mode: 'calendar' })}
                  className={`p-2.5 rounded-xl font-bold text-left transition-all border ${
                    settings.mode === 'calendar'
                      ? 'bg-[#7467E8] text-white border-[#7467E8]'
                      : 'bg-white dark:bg-[#20222C] text-foreground border-[#E8E7EF] dark:border-white/10'
                  }`}
                >
                  <span className="block text-xs">Calendar Date Mode</span>
                  <span className="block text-[10px] opacity-80 font-normal mt-0.5">Date-by-date tracking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, mode: 'classic' })}
                  className={`p-2.5 rounded-xl font-bold text-left transition-all border ${
                    settings.mode === 'classic'
                      ? 'bg-[#7467E8] text-white border-[#7467E8]'
                      : 'bg-white dark:bg-[#20222C] text-foreground border-[#E8E7EF] dark:border-white/10'
                  }`}
                >
                  <span className="block text-xs">Classic Mode</span>
                  <span className="block text-[10px] opacity-80 font-normal mt-0.5">Day-of-week only</span>
                </button>
              </div>
            </div>

            {/* Weekly Holidays Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2] block">
                Weekly Holidays (Off-Days)
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ALL_WEEKDAYS.map((day) => {
                  const isChecked = settings.weeklyHolidays.includes(day);
                  return (
                    <label
                      key={day}
                      className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked 
                          ? 'bg-[#E8E4FF] dark:bg-[#7467E8]/20 border-[#7467E8]/40 text-[#7467E8] dark:text-[#A59BFF] font-bold'
                          : 'bg-white dark:bg-[#20222C] border-[#E8E7EF] dark:border-white/10 text-[#666675] dark:text-[#9292A2]'
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const updated = checked 
                            ? [...settings.weeklyHolidays, day]
                            : settings.weeklyHolidays.filter((d) => d !== day);
                          setSettings({ ...settings, weeklyHolidays: updated });
                        }}
                      />
                      <span className="text-xs">{day.slice(0, 3)}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Semester End Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">
                Semester End Date / Validity
              </Label>
              <Input
                type="date"
                value={settings.semesterEndDate}
                onChange={(e) => setSettings({ ...settings, semesterEndDate: e.target.value })}
                className="rounded-xl text-xs h-10 border-[#E8E7EF] dark:border-white/10"
              />
              <p className="text-[11px] text-[#666675] dark:text-[#9292A2]">
                Used to calculate remaining teaching days and exam validity.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)} className="rounded-full text-xs">
              Cancel
            </Button>
            <Button onClick={() => saveSettings(settings)} className="rounded-full text-xs font-bold bg-[#7467E8] hover:bg-[#6658DF] text-white">
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Edit Subject Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md rounded-[28px]">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-foreground">
              Edit Schedule Details
            </DialogTitle>
            <DialogDescription className="text-xs text-[#666675] dark:text-[#9292A2]">
              Update weekly lecture days and subject details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Subject Name</Label>
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="e.g. Data Structures"
                className="mt-1 rounded-xl text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2] mb-2 block">
                Schedule Days
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {ALL_WEEKDAYS.slice(0, 6).map((day) => {
                  const isSelected = editedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border text-center ${
                        isSelected 
                          ? 'bg-[#7467E8] text-white border-[#7467E8]' 
                          : 'bg-[#F6F6FA] dark:bg-[#15161F] text-foreground border-[#E8E7EF] dark:border-white/10'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Total Held</Label>
                <Input
                  type="number"
                  min="0"
                  value={editedTotalClasses}
                  onChange={(e) => setEditedTotalClasses(Number(e.target.value))}
                  className="mt-1 rounded-xl text-xs"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Attended</Label>
                <Input
                  type="number"
                  min="0"
                  value={editedAttendedClasses}
                  onChange={(e) => setEditedAttendedClasses(Number(e.target.value))}
                  className="mt-1 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Required Attendance (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={editedRequiredAttendance}
                onChange={(e) => setEditedRequiredAttendance(Number(e.target.value))}
                className="mt-1 rounded-xl text-xs"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row items-center justify-between gap-2 pt-3">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => editingSubject && handleDeleteSubject(editingSubject.id)}
              className="rounded-full text-xs font-bold"
            >
              Delete Subject
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(false)} className="rounded-full text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit} className="rounded-full text-xs font-bold bg-[#7467E8] text-white">
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Timetable;
