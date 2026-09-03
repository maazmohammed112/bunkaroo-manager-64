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
  FileText,
  AlertCircle,
  SlidersHorizontal,
  Info,
  Plus,
  RotateCcw,
  Sparkles
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
import {
  ALL_WEEKDAYS,
  WEEKDAY_SHORT,
  formatDateKey,
  parseDateKey,
  getTodayDateKey,
  addDaysToDateKey,
  getDayNameFromKey,
  getDayShortNameFromKey,
  formatDisplayDate,
  formatFullDisplayDate,
  getMonthYearHeader,
  generateCalendarMatrix
} from '@/utils/dateUtils';

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

const Timetable: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeView, setActiveView] = useState<'today' | 'calendar' | 'weekly'>('today');

  // Timetable Configuration & Settings
  const [settings, setSettings] = useState<TimetableSettings>(() => {
    return db.getSync('timetable_settings', {
      mode: 'calendar',
      weeklyHolidays: ['Saturday', 'Sunday'],
      startDate: getTodayDateKey(),
      semesterEndDate: addDaysToDateKey(getTodayDateKey(), 120)
    });
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateKey());
  
  // Year & Month for full month calendar grid navigation
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(() => new Date());

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveReason, setLeaveReason] = useState('Sick Leave');
  const [leaveNote, setLeaveNote] = useState('');

  // Extra Lecture Modal State
  const [isExtraLectureOpen, setIsExtraLectureOpen] = useState(false);
  const [extraSubjectId, setExtraSubjectId] = useState('');

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

  // Listen for open-settings event (from AddSubject or other views)
  useEffect(() => {
    const handleOpenSettings = () => {
      setIsSettingsOpen(true);
    };
    window.addEventListener('open-timetable-settings', handleOpenSettings);
    return () => window.removeEventListener('open-timetable-settings', handleOpenSettings);
  }, []);

  // Listen for external settings update
  useEffect(() => {
    const handleSettingsUpdate = (e: any) => {
      if (e.detail) {
        setSettings(e.detail);
      }
    };
    window.addEventListener('timetable-settings-updated', handleSettingsUpdate as EventListener);
    return () => window.removeEventListener('timetable-settings-updated', handleSettingsUpdate as EventListener);
  }, []);

  const saveSettings = (newSettings: TimetableSettings) => {
    setSettings(newSettings);
    db.set('timetable_settings', newSettings);
    db.set('bunkbuddy_mode_selected', true);
    setIsSettingsOpen(false);
    window.dispatchEvent(new CustomEvent('timetable-settings-updated', { detail: newSettings }));
    toast.success('Timetable configuration saved');
  };

  // Holiday and override resolution:
  // 1. Explicit override in daily log takes top priority!
  //    - status === 'regular': explicitly marked as regular/working (overrides weekly holiday!)
  //    - status === 'holiday' | 'sick_leave': explicitly marked as off/holiday
  // 2. Default to weekly holidays (Saturday & Sunday by default)
  const getDateHolidayInfo = (dateStr: string) => {
    const log = dailyLogs[dateStr];
    if (log?.status === 'holiday' || log?.status === 'sick_leave') {
      return {
        isHoliday: true,
        isOverride: true,
        reason: log.note || (log.status === 'sick_leave' ? 'Sick Leave' : 'Holiday / Day Off'),
        isLeave: log.status === 'sick_leave'
      };
    }
    if (log?.status === 'regular') {
      return {
        isHoliday: false,
        isOverride: true,
        reason: log.note || 'Active Working Day',
        isLeave: false
      };
    }
    const dayName = getDayNameFromKey(dateStr);
    const isWeekly = settings.weeklyHolidays.includes(dayName);
    return {
      isHoliday: isWeekly,
      isOverride: false,
      reason: isWeekly ? `${dayName} (Weekly Holiday)` : 'Regular Class Day',
      isLeave: false
    };
  };

  const isWeeklyHoliday = (dateStr: string) => {
    return getDateHolidayInfo(dateStr).isHoliday;
  };

  // 1-Tap Mark All Present Today with Functional Undo
  const markAllPresentToday = () => {
    const todayStr = getTodayDateKey();
    const todayName = getDayNameFromKey(todayStr);
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
    const newDailyLogs = { ...dailyLogs };
    const classLogs = { ...(newDailyLogs[todayStr]?.classLogs || {}) };
    todaySubjects.forEach((s) => {
      classLogs[s.id] = 'attended';
    });
    newDailyLogs[todayStr] = {
      ...(newDailyLogs[todayStr] || {}),
      status: newDailyLogs[todayStr]?.status || 'regular',
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
    const dateKey = targetDate || selectedDate || getTodayDateKey();
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

    // Record in daily log
    const newDailyLogs = { ...dailyLogs };
    const currentRecord = newDailyLogs[dateKey] || { status: 'regular', classLogs: {} };
    const classLogs = { ...(currentRecord.classLogs || {}) };
    classLogs[subjectId] = attended ? 'attended' : 'missed';
    newDailyLogs[dateKey] = {
      ...currentRecord,
      classLogs
    };
    setDailyLogs(newDailyLogs);
    db.set('attendance_daily_logs', newDailyLogs);

    toast.success(attended ? 'Class marked as Attended' : 'Class marked as Missed');
  };

  const markDayAsLeave = () => {
    const newDailyLogs = { ...dailyLogs };
    newDailyLogs[selectedDate] = {
      ...(newDailyLogs[selectedDate] || {}),
      status: leaveReason === 'Sick Leave' ? 'sick_leave' : 'holiday',
      note: leaveNote.trim() || leaveReason
    };
    setDailyLogs(newDailyLogs);
    db.set('attendance_daily_logs', newDailyLogs);
    setIsLeaveModalOpen(false);
    setLeaveNote('');
    toast.success(`Marked ${formatDisplayDate(selectedDate)} as ${leaveReason}`);
  };

  // Remove holiday status: for weekly holidays (Saturday/Sunday), mark as working day override.
  // For custom holiday dates, set status to regular.
  const removeDayLeave = (dateStr: string) => {
    const newDailyLogs = { ...dailyLogs };
    const dayName = getDayNameFromKey(dateStr);
    const isWeekly = settings.weeklyHolidays.includes(dayName);

    newDailyLogs[dateStr] = {
      ...(newDailyLogs[dateStr] || {}),
      status: 'regular',
      note: isWeekly ? 'Active Working Day' : undefined
    };

    setDailyLogs(newDailyLogs);
    db.set('attendance_daily_logs', newDailyLogs);
    toast.success(`Holiday removed! ${dayName} (${formatDisplayDate(dateStr)}) is now an active class day.`);
  };

  // Reset a date to follow standard weekly defaults
  const resetDateToDefault = (dateStr: string) => {
    const newDailyLogs = { ...dailyLogs };
    if (newDailyLogs[dateStr]) {
      // If there are attendance logs, keep classLogs but reset status
      if (newDailyLogs[dateStr].classLogs && Object.keys(newDailyLogs[dateStr].classLogs!).length > 0) {
        delete newDailyLogs[dateStr].note;
        const dayName = getDayNameFromKey(dateStr);
        newDailyLogs[dateStr].status = settings.weeklyHolidays.includes(dayName) ? 'holiday' : 'regular';
      } else {
        delete newDailyLogs[dateStr];
      }
    }
    setDailyLogs(newDailyLogs);
    db.set('attendance_daily_logs', newDailyLogs);
    toast.info(`Reset ${formatDisplayDate(dateStr)} to default weekly schedule.`);
  };

  const changeDateBy = (offset: number) => {
    const newDateStr = addDaysToDateKey(selectedDate, offset);
    setSelectedDate(newDateStr);
    const d = parseDateKey(newDateStr);
    if (d.getMonth() !== currentCalendarMonth.getMonth() || d.getFullYear() !== currentCalendarMonth.getFullYear()) {
      setCurrentCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  };

  const changeMonthBy = (offset: number) => {
    setCurrentCalendarMonth(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() + offset, 1);
      return newDate;
    });
  };

  const jumpToToday = () => {
    const todayStr = getTodayDateKey();
    setSelectedDate(todayStr);
    const today = parseDateKey(todayStr);
    setCurrentCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const handleCellClick = (cellDateStr: string) => {
    setSelectedDate(cellDateStr);
    const cellDate = parseDateKey(cellDateStr);
    if (cellDate.getMonth() !== currentCalendarMonth.getMonth() || cellDate.getFullYear() !== currentCalendarMonth.getFullYear()) {
      setCurrentCalendarMonth(new Date(cellDate.getFullYear(), cellDate.getMonth(), 1));
    }
  };

  // Extra Lecture Logging (e.g. Sunday make-up or lab session)
  const handleLogExtraLecture = (attended: boolean) => {
    if (!extraSubjectId) {
      toast.error('Please select a subject');
      return;
    }
    markAttendance(extraSubjectId, attended, selectedDate);
    setIsExtraLectureOpen(false);
    setExtraSubjectId('');
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

  // Build month calendar days matrix using timezone-safe generator
  const monthName = getMonthYearHeader(currentCalendarMonth);
  const matrixCells = generateCalendarMatrix(currentCalendarMonth);

  const calendarCells = matrixCells.map((cell) => {
    const holidayInfo = getDateHolidayInfo(cell.dateStr);
    const classes = subjects.filter(s => s.days?.includes(cell.dayOfWeekName));
    const logs = dailyLogs[cell.dateStr]?.classLogs;

    return {
      dateStr: cell.dateStr,
      dayNum: cell.dayNum,
      isCurrentMonth: cell.isCurrentMonth,
      isToday: cell.isToday,
      isSelected: cell.dateStr === selectedDate,
      isHoliday: holidayInfo.isHoliday,
      holidayLabel: holidayInfo.reason,
      classCount: classes.length,
      hasLogs: !!logs && Object.keys(logs).length > 0,
      allAttended: !!logs && classes.length > 0 && classes.every(c => logs[c.id] === 'attended'),
      anyMissed: !!logs && Object.values(logs).includes('missed')
    };
  });

  const todayKey = getTodayDateKey();
  const todayDayName = getDayNameFromKey(todayKey);
  const selectedDayName = getDayNameFromKey(selectedDate);
  const selectedDateHolidayInfo = getDateHolidayInfo(selectedDate);
  const isSelectedDateHoliday = selectedDateHolidayInfo.isHoliday;
  const selectedDateLog = dailyLogs[selectedDate];
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
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight">
                Class Timetable & Attendance
              </h2>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] dark:text-[#A59BFF]">
                {settings.mode === 'calendar' ? 'Calendar Mode' : 'Classic Mode'}
              </span>
            </div>
            <p className="text-xs text-[#666675] dark:text-[#9292A2] font-medium mt-0.5">
              {settings.mode === 'calendar' 
                ? 'Full interactive month calendar, daily date-by-date logging, and leave management' 
                : 'Weekly routine timetable and lecture attendance logging'}
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
            <span>Settings</span>
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
          Full Month Calendar
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
                Today — {todayDayName}, {formatDisplayDate(todayKey)}
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#666675] dark:text-[#9292A2] bg-[#F1F0F8] dark:bg-[#20222C] px-3 py-1 rounded-full">
              {todaySubjects.length} {todaySubjects.length === 1 ? 'class scheduled' : 'classes scheduled'}
            </span>
          </div>

          {todaySubjects.length === 0 ? (
            <Card className="glass-card p-8 text-center space-y-3 max-w-md mx-auto my-6 rounded-[24px]">
              <div className="h-12 w-12 rounded-full bg-[#DDEDEA] dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
                <Coffee size={24} strokeWidth={2} />
              </div>
              <h4 className="font-bold text-sm text-foreground font-display">No classes scheduled for today!</h4>
              <p className="text-xs text-[#666675] dark:text-[#9292A2]">
                Enjoy your break or switch to the Full Month Calendar to inspect your schedule for any day.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {todaySubjects.map((subj) => {
                const status = getAttendanceStatus(subj.attendedClasses, subj.totalClasses, subj.requiredAttendance);
                const pct = subj.totalClasses === 0 ? 0 : Math.round((subj.attendedClasses / subj.totalClasses) * 100);

                return (
                  <Card key={subj.id} className="glass-card p-5 space-y-4 hover:border-[#7467E8]/40 transition-all rounded-[22px]">
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
                        onClick={() => markAttendance(subj.id, true, todayKey)}
                        className="flex-1 py-2.5 px-3 bg-[#DDEDEA] hover:bg-[#cde4e0] dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-900 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold rounded-[14px] flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                      >
                        <Check size={15} strokeWidth={2.5} />
                        Attend
                      </button>
                      <button
                        type="button"
                        onClick={() => markAttendance(subj.id, false, todayKey)}
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

      {/* VIEW 2: FULL MONTH CALENDAR VIEW */}
      {activeView === 'calendar' && (
        <div className="space-y-6">
          {/* Full Monthly Calendar Card */}
          <Card className="glass-card p-5 sm:p-7 rounded-[28px] space-y-5 border border-[#E8E7EF] dark:border-white/10 shadow-sm">
            {/* Calendar Month Navigation Header */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[#E8E7EF] dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] dark:text-[#A59BFF] flex items-center justify-center">
                  <CalendarDays size={20} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-foreground tracking-tight">
                    {monthName}
                  </h3>
                  <p className="text-[11px] text-[#666675] dark:text-[#9292A2] font-medium">
                    Tap any date to inspect scheduled classes or log attendance
                  </p>
                </div>
              </div>

              {/* Month Switcher Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeMonthBy(-1)}
                  className="h-9 w-9 p-0 rounded-full cursor-pointer hover:bg-[#E8E4FF] dark:hover:bg-[#7467E8]/20"
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={jumpToToday}
                  className="h-9 rounded-full px-3.5 text-xs font-bold cursor-pointer"
                >
                  Today
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeMonthBy(1)}
                  className="h-9 w-9 p-0 rounded-full cursor-pointer hover:bg-[#E8E4FF] dark:hover:bg-[#7467E8]/20"
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>

            {/* Calendar 7-Day Header */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center select-none">
              {WEEKDAY_SHORT.map((wd, idx) => {
                const isOff = settings.weeklyHolidays.includes(ALL_WEEKDAYS[idx]);
                return (
                  <div 
                    key={wd} 
                    className={`py-2 text-[11px] font-bold uppercase tracking-wider ${
                      isOff 
                        ? 'text-rose-500/70 dark:text-rose-400/70' 
                        : 'text-[#666675] dark:text-[#9292A2]'
                    }`}
                  >
                    {wd}
                  </div>
                );
              })}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 select-none">
              {calendarCells.map((cell) => {
                const isSelected = cell.dateStr === selectedDate;
                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => handleCellClick(cell.dateStr)}
                    className={`min-h-[58px] sm:min-h-[70px] p-1.5 sm:p-2 rounded-[16px] sm:rounded-[18px] border transition-all cursor-pointer flex flex-col justify-between text-left group active:scale-95 ${
                      isSelected
                        ? 'bg-[#7467E8] text-white border-[#7467E8] shadow-md shadow-[#7467E8]/30 scale-[1.02] z-10'
                        : cell.isToday
                        ? 'bg-[#E8E4FF]/60 dark:bg-[#7467E8]/20 border-[#7467E8] text-foreground'
                        : cell.isCurrentMonth
                        ? 'bg-white/70 dark:bg-[#181A22]/70 border-[#E8E7EF] dark:border-white/10 text-foreground hover:border-[#7467E8]/40 hover:bg-white dark:hover:bg-[#1E202C]'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] border-transparent text-[#9292A2]/50 dark:text-[#666675]/50'
                    }`}
                  >
                    {/* Top Row: Date Number & Holiday Indicator */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs sm:text-sm font-bold font-display ${
                        isSelected 
                          ? 'text-white' 
                          : cell.isToday 
                          ? 'text-[#7467E8] dark:text-[#A59BFF]' 
                          : cell.isCurrentMonth 
                          ? 'text-foreground' 
                          : 'text-[#9292A2]/60'
                      }`}>
                        {cell.dayNum}
                      </span>

                      {cell.isHoliday && (
                        <span 
                          className={`text-[10px] ${isSelected ? 'text-white' : 'text-amber-500 dark:text-amber-400'}`}
                          title={cell.holidayLabel || 'Holiday / Day Off'}
                        >
                          <Coffee size={12} strokeWidth={2} />
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Scheduled Class Indicator / Status */}
                    <div className="pt-1 flex items-center justify-between">
                      {cell.classCount > 0 ? (
                        <div className="flex items-center gap-1 w-full justify-between">
                          <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : cell.isHoliday
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                              : 'bg-[#F1F0F8] dark:bg-[#252836] text-[#7467E8] dark:text-[#A59BFF]'
                          }`}>
                            {cell.classCount} {cell.classCount === 1 ? 'class' : 'classes'}
                          </span>

                          {/* Attendance Status Dot */}
                          {cell.hasLogs && (
                            <span 
                              className={`h-2 w-2 rounded-full flex-shrink-0 ${
                                cell.allAttended 
                                  ? 'bg-emerald-400' 
                                  : cell.anyMissed 
                                  ? 'bg-rose-400' 
                                  : 'bg-amber-400'
                              }`} 
                              title="Attendance logged"
                            />
                          )}
                        </div>
                      ) : cell.isHoliday ? (
                        <span className={`text-[9px] font-semibold truncate ${
                          isSelected ? 'text-white/90' : 'text-[#9292A2] dark:text-[#888B98]'
                        }`}>
                          Off
                        </span>
                      ) : (
                        <span className="text-[9px] opacity-0 group-hover:opacity-60 text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Selected Date Inspector Card */}
          <Card className="glass-card p-5 sm:p-7 rounded-[28px] border border-[#E8E7EF] dark:border-white/10 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#E8E7EF] dark:border-white/10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => changeDateBy(-1)}
                  className="h-9 w-9 rounded-full bg-[#F1F0F8] dark:bg-[#20222C] border border-[#E8E7EF] dark:border-white/10 flex items-center justify-center text-foreground hover:bg-[#E8E4FF] transition-colors cursor-pointer"
                  title="Previous Day"
                >
                  <ChevronLeft size={16} />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base sm:text-lg font-bold font-display text-foreground">
                      {selectedDayName}, {formatDisplayDate(selectedDate)}
                    </h4>
                    {selectedDate === todayKey && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7467E8] text-white">
                        Today
                      </span>
                    )}
                    {selectedDateHolidayInfo.isOverride && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F1F0F8] dark:bg-[#20222C] text-[#7467E8] dark:text-[#A59BFF] border border-[#7467E8]/30">
                        Custom Schedule
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#666675] dark:text-[#9292A2] font-medium mt-0.5">
                    {isSelectedDateHoliday 
                      ? selectedDateHolidayInfo.reason 
                      : `${selectedDaySubjects.length} ${selectedDaySubjects.length === 1 ? 'class' : 'classes'} scheduled for this day`}
                  </p>
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

              {/* Day Off / Working Actions */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {isSelectedDateHoliday ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeDayLeave(selectedDate)}
                    className="rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10 cursor-pointer h-9 px-3.5"
                    title="Clear holiday and mark this as an active class day"
                  >
                    Clear Holiday Status
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLeaveModalOpen(true)}
                    className="rounded-full text-xs font-semibold gap-1.5 cursor-pointer h-9 px-3.5"
                    title="Mark this date as an off day, sick leave, or fest"
                  >
                    <Coffee size={14} />
                    Mark Day Off / Leave
                  </Button>
                )}

                {/* Reset override button */}
                {selectedDateHolidayInfo.isOverride && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetDateToDefault(selectedDate)}
                    className="rounded-full text-xs text-[#666675] dark:text-[#9292A2] hover:text-foreground h-9 px-2.5 gap-1 cursor-pointer"
                    title="Reset this date to weekly timetable default"
                  >
                    <RotateCcw size={12} />
                    <span className="hidden sm:inline">Reset</span>
                  </Button>
                )}

                {/* Log Extra Lecture */}
                {subjects.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setExtraSubjectId(subjects[0]?.id || '');
                      setIsExtraLectureOpen(true);
                    }}
                    className="rounded-full text-xs font-semibold text-[#7467E8] dark:text-[#A59BFF] border-[#7467E8]/30 hover:bg-[#7467E8]/10 cursor-pointer h-9 px-3 gap-1"
                    title="Log an extra or make-up lecture for this date"
                  >
                    <Plus size={13} />
                    <span>Extra Lecture</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Holiday Notice if Scheduled Classes Exist on a Holiday */}
            {isSelectedDateHoliday && selectedDaySubjects.length > 0 && (
              <div className="p-3.5 sm:p-4 rounded-[20px] bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                    <Coffee size={18} strokeWidth={2.2} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-sm text-foreground font-display">
                        {selectedDateHolidayInfo.reason}
                      </h5>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300">
                        {selectedDaySubjects.length} {selectedDaySubjects.length === 1 ? 'class' : 'classes'} scheduled
                      </span>
                    </div>
                    <p className="text-xs text-[#666675] dark:text-[#9292A2] mt-0.5">
                      This day is marked as off, but has scheduled classes. You can log attendance below or click "Make Working Day" to activate the schedule.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeDayLeave(selectedDate)}
                  className="rounded-full text-xs font-bold text-[#7467E8] dark:text-[#A59BFF] border-[#7467E8]/30 hover:bg-[#7467E8]/10 cursor-pointer h-8 px-3 whitespace-nowrap"
                >
                  Make Working Day
                </Button>
              </div>
            )}

            {/* If Selected Day is a Holiday with NO scheduled classes */}
            {isSelectedDateHoliday && selectedDaySubjects.length === 0 ? (
              <div className="p-8 rounded-[24px] text-center space-y-3 bg-[#DDEDEA]/30 dark:bg-emerald-500/10 border border-emerald-500/20 max-w-lg mx-auto">
                <div className="h-12 w-12 rounded-full bg-[#DDEDEA] dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto">
                  <Coffee size={22} strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-foreground font-display">
                    {selectedDateHolidayInfo.reason}
                  </h4>
                  <p className="text-xs text-[#666675] dark:text-[#9292A2]">
                    Attendance tracking is paused for this date. No missed lectures will count against your criteria.
                  </p>
                </div>
              </div>
            ) : selectedDaySubjects.length === 0 ? (
              <div className="p-8 rounded-[24px] bg-white/50 dark:bg-[#181A22]/50 border border-dashed border-[#E8E7EF] dark:border-white/10 text-center max-w-md mx-auto space-y-2">
                <p className="text-xs text-[#9292A2] dark:text-[#888B98] italic">
                  No classes scheduled for {selectedDayName}
                </p>
                {subjects.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setExtraSubjectId(subjects[0]?.id || '');
                      setIsExtraLectureOpen(true);
                    }}
                    className="rounded-full text-xs font-semibold gap-1.5 cursor-pointer mt-1"
                  >
                    <Plus size={13} />
                    Log Extra Lecture for this Date
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {selectedDaySubjects.map((subj) => {
                  const status = getAttendanceStatus(subj.attendedClasses, subj.totalClasses, subj.requiredAttendance);
                  const pct = subj.totalClasses === 0 ? 0 : Math.round((subj.attendedClasses / subj.totalClasses) * 100);
                  const logForThisDate = selectedDateLog?.classLogs?.[subj.id];

                  return (
                    <Card key={`${selectedDate}-${subj.id}`} className="glass-card p-5 space-y-4 rounded-[22px]">
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
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            logForThisDate === 'attended' 
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' 
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          }`}>
                            {logForThisDate === 'attended' ? 'Attended' : 'Missed'}
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
          </Card>
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
                    {isHoliday 
                      ? (daySubjects.length > 0 ? `Weekly Holiday • ${daySubjects.length} ${daySubjects.length === 1 ? 'class' : 'classes'}` : 'Weekly Holiday')
                      : `${daySubjects.length} ${daySubjects.length === 1 ? 'class' : 'classes'}`}
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
                        <Card key={`${day}-${subj.id}`} className="glass-card p-5 space-y-4 hover:border-[#7467E8]/40 rounded-[22px]">
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
              Mark {formatFullDisplayDate(selectedDate)} as a non-instructional day so classes aren't counted against your attendance.
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
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground block">Tracking Mode</span>
                <span className="text-[10px] text-[#7467E8] font-bold">
                  {settings.mode === 'calendar' ? 'Calendar Mode Active' : 'Classic Mode Active'}
                </span>
              </div>
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
                  <span className="block text-[10px] opacity-80 font-normal mt-0.5">Date-by-date calendar</span>
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
              <div className="grid grid-cols-4 gap-1.5">
                {ALL_WEEKDAYS.map((day) => {
                  const isSelected = editedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all border text-center ${
                        isSelected 
                          ? 'bg-[#7467E8] text-white border-[#7467E8]' 
                          : 'bg-[#F6F6FA] dark:bg-[#15161F] text-foreground border-[#E8E7EF] dark:border-white/10 hover:border-[#7467E8]/40'
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

      {/* MODAL 4: Log Extra Lecture / Make-up Session */}
      <Dialog open={isExtraLectureOpen} onOpenChange={setIsExtraLectureOpen}>
        <DialogContent className="max-w-md rounded-[28px]">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Plus size={18} className="text-[#7467E8]" />
              Log Extra Lecture
            </DialogTitle>
            <DialogDescription className="text-xs text-[#666675] dark:text-[#9292A2]">
              Record attendance for an extra or make-up lecture on {formatFullDisplayDate(selectedDate)}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Select Subject</Label>
              <select
                value={extraSubjectId}
                onChange={(e) => setExtraSubjectId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#E8E7EF] dark:border-white/10 bg-white dark:bg-[#15161F] text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#7467E8]"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.attendedClasses}/{s.totalClasses} attended)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setIsExtraLectureOpen(false)} className="rounded-full text-xs">
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => handleLogExtraLecture(false)} 
                className="rounded-full text-xs font-bold bg-[#F7DDE9] hover:bg-[#f3cbdc] text-rose-900 border border-rose-500/20 shadow-xs"
              >
                <X size={14} className="mr-1" /> Mark Missed
              </Button>
              <Button 
                onClick={() => handleLogExtraLecture(true)} 
                className="rounded-full text-xs font-bold bg-[#7467E8] hover:bg-[#6658DF] text-white shadow-xs"
              >
                <Check size={14} className="mr-1" /> Mark Attended
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Timetable;
