import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  BookOpen, 
  Check, 
  AlertCircle, 
  Info, 
  CalendarDays, 
  Clock, 
  SlidersHorizontal,
  ChevronRight,
  Layers
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { db } from '@/utils/storageDB';
import { getTodayDateKey, addDaysToDateKey } from '@/utils/dateUtils';

interface Subject {
  id: string;
  name: string;
  totalClasses: number;
  attendedClasses: number;
  days: string[];
  requiredAttendance: number;
}

interface TimetableSettings {
  mode: 'classic' | 'calendar';
  weeklyHolidays: string[];
  startDate: string;
  semesterEndDate: string;
}

const AddSubjectForm: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectName, setSubjectName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [requiredAttendance, setRequiredAttendance] = useState(75);
  const [manualEntry, setManualEntry] = useState(false);
  const [totalClasses, setTotalClasses] = useState(0);
  const [attendedClasses, setAttendedClasses] = useState(0);

  // Tracking Mode selection state
  const [isModeSelected, setIsModeSelected] = useState<boolean>(() => {
    return db.getSync('bunkbuddy_mode_selected', false);
  });

  const [currentMode, setCurrentMode] = useState<'calendar' | 'classic'>(() => {
    const s = db.getSync<TimetableSettings | null>('timetable_settings', null);
    return s?.mode || 'calendar';
  });

  const [showModeDetails, setShowModeDetails] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const loaded = db.getSync<Subject[]>('subjects', []);
    setSubjects(loaded);
  }, []);

  // Listen for mode changes from settings or other components
  useEffect(() => {
    const handleSettingsUpdate = (e: any) => {
      if (e.detail?.mode) {
        setCurrentMode(e.detail.mode);
        setIsModeSelected(true);
      }
    };
    window.addEventListener('timetable-settings-updated', handleSettingsUpdate as EventListener);
    return () => window.removeEventListener('timetable-settings-updated', handleSettingsUpdate as EventListener);
  }, []);

  const handleSelectMode = (mode: 'calendar' | 'classic') => {
    const existing = db.getSync<TimetableSettings>('timetable_settings', {
      mode: 'calendar',
      weeklyHolidays: ['Saturday', 'Sunday'],
      startDate: getTodayDateKey(),
      semesterEndDate: addDaysToDateKey(getTodayDateKey(), 120)
    });

    const updated: TimetableSettings = { ...existing, mode };
    db.set('timetable_settings', updated);
    db.set('bunkbuddy_mode_selected', true);
    setCurrentMode(mode);
    setIsModeSelected(true);

    window.dispatchEvent(new CustomEvent('timetable-settings-updated', { detail: updated }));
    toast.success('Tracking mode confirmed! You can now add your subjects.');
  };

  const handleRedirectToSettings = () => {
    window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'timetable' }));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-timetable-settings'));
    }, 150);
  };

  const handleDayToggle = (day: string) => {
    if (!isModeSelected) {
      toast.error('First select your tracking mode above');
      return;
    }
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddSubject = () => {
    if (!isModeSelected) {
      toast.error('First select your tracking mode (Calendar or Classic Mode)');
      return;
    }

    if (!subjectName.trim()) {
      toast.error('Subject name is required');
      return;
    }

    if (selectedDays.length === 0) {
      toast.error('Please select at least one day for schedule');
      return;
    }

    if (subjects.some((s) => s.name.toLowerCase() === subjectName.trim().toLowerCase())) {
      toast.error('A subject with this name already exists');
      return;
    }

    if (manualEntry) {
      if (attendedClasses > totalClasses) {
        toast.error('Attended classes cannot exceed total classes');
        return;
      }
      if (totalClasses < 0 || attendedClasses < 0) {
        toast.error('Class counts cannot be negative');
        return;
      }
    }

    const newSubject: Subject = {
      id: Date.now().toString(),
      name: subjectName.trim(),
      totalClasses: manualEntry ? totalClasses : 0,
      attendedClasses: manualEntry ? attendedClasses : 0,
      days: selectedDays,
      requiredAttendance
    };

    const updated = [...subjects, newSubject];
    setSubjects(updated);
    db.set('subjects', updated);

    // Reset form
    setSubjectName('');
    setSelectedDays([]);
    setRequiredAttendance(75);
    setManualEntry(false);
    setTotalClasses(0);
    setAttendedClasses(0);

    toast.success(`${newSubject.name} added to timetable!`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-foreground font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] flex items-center justify-center flex-shrink-0 shadow-sm">
            <BookOpen strokeWidth={1.8} className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight">
              Add New Subject
            </h2>
            <p className="text-xs text-[#666675] dark:text-[#9292A2] font-medium mt-0.5">
              Configure weekly lectures and attendance threshold limits
            </p>
          </div>
        </div>

        {/* Current Active Mode Badge */}
        {isModeSelected && (
          <div className="flex items-center gap-2 bg-[#F1F0F8] dark:bg-[#181A22] border border-[#E8E7EF] dark:border-white/10 px-3.5 py-1.5 rounded-full text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-foreground">
              {currentMode === 'calendar' ? 'Calendar Date Mode' : 'Classic Mode'}
            </span>
            <button
              type="button"
              onClick={() => setIsModeSelected(false)}
              className="text-[11px] font-bold text-[#7467E8] dark:text-[#A59BFF] hover:underline cursor-pointer ml-1"
            >
              Change
            </button>
          </div>
        )}
      </div>

      {/* 1. MODE SELECTION GATE (REQUIRED BEFORE ADDING SUBJECTS) */}
      {!isModeSelected ? (
        <Card className="glass-card p-6 sm:p-7 rounded-[28px] border-2 border-[#7467E8]/40 shadow-lg space-y-5 bg-gradient-to-br from-white/95 via-[#F8F8FC]/90 to-[#E8E4FF]/30 dark:from-[#161824]/95 dark:via-[#1A1C28]/90 dark:to-[#7467E8]/10">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#7467E8] text-white">
                  Step 1 Required
                </span>
                <span className="text-xs font-bold text-[#7467E8] dark:text-[#A59BFF]">
                  First Select Your Tracking Mode
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-display text-foreground">
                How would you like to track your semester?
              </h3>
              <p className="text-xs text-[#666675] dark:text-[#9292A2] leading-relaxed">
                Subject creation is locked until you select a tracking mode. Choose the option that fits your college routine best:
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowModeDetails(!showModeDetails)}
              className="p-2 rounded-full bg-[#F1F0F8] dark:bg-[#20222C] text-[#666675] dark:text-[#B9BBC7] hover:text-[#7467E8] transition-colors cursor-pointer flex-shrink-0"
              title="Learn about modes"
            >
              <Info size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Mode Choice Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Calendar Date Mode */}
            <div 
              onClick={() => handleSelectMode('calendar')}
              className="relative p-5 rounded-[22px] bg-white dark:bg-[#181A22] border-2 border-[#7467E8]/30 hover:border-[#7467E8] shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group text-left"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-2xl bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] dark:text-[#A59BFF] flex items-center justify-center">
                  <CalendarDays size={20} strokeWidth={2} />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  Recommended
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm sm:text-base text-foreground font-display flex items-center gap-1.5">
                  Calendar Date Mode
                  <ChevronRight size={15} className="text-[#7467E8] group-hover:translate-x-0.5 transition-transform" />
                </h4>
                <p className="text-xs text-[#666675] dark:text-[#9292A2] leading-relaxed">
                  Date-by-date attendance with a full interactive month calendar, holiday & sick leave marks, and exam timeline tracking.
                </p>
              </div>

              <Button 
                size="sm"
                className="w-full rounded-full text-xs font-bold bg-[#7467E8] hover:bg-[#6658DF] text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectMode('calendar');
                }}
              >
                Choose Calendar Mode
              </Button>
            </div>

            {/* Classic Mode */}
            <div 
              onClick={() => handleSelectMode('classic')}
              className="relative p-5 rounded-[22px] bg-white dark:bg-[#181A22] border-2 border-[#E8E7EF] dark:border-white/10 hover:border-[#7467E8] shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group text-left"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-2xl bg-[#F1F0F8] dark:bg-[#20222C] text-[#666675] dark:text-[#9292A2] flex items-center justify-center">
                  <Clock size={20} strokeWidth={2} />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F1F0F8] dark:bg-[#20222C] text-[#666675] dark:text-[#9292A2]">
                  Standard
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm sm:text-base text-foreground font-display flex items-center gap-1.5">
                  Classic Mode
                  <ChevronRight size={15} className="text-[#7467E8] group-hover:translate-x-0.5 transition-transform" />
                </h4>
                <p className="text-xs text-[#666675] dark:text-[#9292A2] leading-relaxed">
                  Simple day-of-week lecture scheduling. Count lectures attended and missed without specific date calendars.
                </p>
              </div>

              <Button 
                variant="outline"
                size="sm"
                className="w-full rounded-full text-xs font-bold hover:bg-[#7467E8] hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectMode('classic');
                }}
              >
                Choose Classic Mode
              </Button>
            </div>
          </div>

          {/* Info accordion / details */}
          <AnimatePresence>
            {showModeDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden p-4 rounded-2xl bg-[#F1F0F8]/80 dark:bg-[#20222C]/80 border border-[#E8E7EF] dark:border-white/10 text-xs space-y-2 text-[#666675] dark:text-[#B9BBC7]"
              >
                <p className="font-semibold text-foreground">Mode Breakdown & Advice:</p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li><strong>Calendar Date Mode:</strong> Perfect if your college has holidays, exam prep leaves, or fest off-days that you need to exclude from attendance. Includes full month grid navigation.</li>
                  <li><strong>Classic Mode:</strong> Perfect if you want a fast, simple weekly schedule without picking dates.</li>
                </ul>
                <div className="pt-2 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRedirectToSettings}
                    className="text-xs text-[#7467E8] dark:text-[#A59BFF] hover:bg-[#E8E4FF] dark:hover:bg-[#7467E8]/20"
                  >
                    Open Timetable Settings Modal &rarr;
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      ) : (
        /* Confirmation message when mode is selected */
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
              <Check size={14} strokeWidth={3} />
            </div>
            <span>
              Mode active: <strong>{currentMode === 'calendar' ? 'Calendar Date Mode' : 'Classic Mode'}</strong>. You can now add subjects to your schedule.
            </span>
          </div>
          <button
            type="button"
            onClick={handleRedirectToSettings}
            className="text-[#7467E8] dark:text-[#A59BFF] font-bold hover:underline cursor-pointer flex-shrink-0"
          >
            Configure Timeline
          </button>
        </div>
      )}

      {/* 2. SUBJECT CREATION FORM */}
      <Card className={`glass-card p-6 sm:p-8 space-y-6 transition-all ${
        !isModeSelected ? 'opacity-50 pointer-events-none select-none filter blur-[0.5px]' : ''
      }`}>
        <div>
          <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2] mb-1.5 block">
            Subject Title
          </Label>
          <Input
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            disabled={!isModeSelected}
            placeholder="e.g. Data Structures & Algorithms"
          />
        </div>

        <div>
          <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2] mb-2.5 block">
            Weekly Schedule Days
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {days.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <div
                  key={day}
                  onClick={() => handleDayToggle(day)}
                  className={`flex items-center justify-between p-3.5 rounded-[16px] border text-xs font-semibold cursor-pointer transition-all active:scale-[0.98] select-none ${
                    isSelected
                      ? 'border-[#7467E8] bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] dark:text-[#A59BFF] shadow-xs'
                      : 'border-[#E8E7EF] dark:border-white/10 bg-[#F1F0F8]/60 dark:bg-[#20222C]/60 text-[#666675] dark:text-[#B9BBC7] hover:border-[#7467E8]/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Checkbox checked={isSelected} className="pointer-events-none" />
                    <span>{day}</span>
                  </div>
                  {isSelected && <Check size={15} strokeWidth={2.5} className="text-[#7467E8] dark:text-[#A59BFF]" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual Pre-existing Attendance Section */}
        <div className="p-4 sm:p-5 rounded-[20px] bg-[#F1F0F8]/50 dark:bg-[#20222C]/50 border border-[#E8E7EF] dark:border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs sm:text-sm font-bold text-foreground block">
                Enter Pre-existing Attendance
              </span>
              <span className="text-[11px] text-[#666675] dark:text-[#9292A2]">
                Enable if classes for this subject have already begun
              </span>
            </div>
            <Switch 
              checked={manualEntry} 
              onCheckedChange={setManualEntry} 
              disabled={!isModeSelected}
            />
          </div>

          {manualEntry && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#E8E7EF] dark:border-white/[0.08]">
              <div>
                <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2] mb-1.5 block">
                  Total Classes Held
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={totalClasses}
                  onChange={(e) => setTotalClasses(Number(e.target.value))}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2] mb-1.5 block">
                  Classes Attended
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={attendedClasses}
                  onChange={(e) => setAttendedClasses(Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Target Threshold */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">
              Required Target Attendance Threshold (%)
            </Label>
            <span className="text-xs font-bold text-[#7467E8] bg-[#E8E4FF] dark:bg-[#7467E8]/20 px-2.5 py-0.5 rounded-full">
              {requiredAttendance}%
            </span>
          </div>
          <Input
            type="number"
            min="0"
            max="100"
            value={requiredAttendance}
            onChange={(e) => setRequiredAttendance(Number(e.target.value))}
            disabled={!isModeSelected}
          />
        </div>

        <Button
          onClick={handleAddSubject}
          disabled={!isModeSelected}
          size="lg"
          className="w-full text-sm sm:text-base font-bold gap-2 py-6 rounded-[18px] cursor-pointer"
        >
          <PlusCircle size={18} strokeWidth={2} />
          Add Subject to Schedule
        </Button>
      </Card>
    </div>
  );
};

export default AddSubjectForm;
