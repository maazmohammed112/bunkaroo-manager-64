import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookOpen, Check, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { db } from '@/utils/storageDB';

interface Subject {
  id: string;
  name: string;
  totalClasses: number;
  attendedClasses: number;
  days: string[];
  requiredAttendance: number;
}

const AddSubjectForm: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectName, setSubjectName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [requiredAttendance, setRequiredAttendance] = useState(75);
  const [manualEntry, setManualEntry] = useState(false);
  const [totalClasses, setTotalClasses] = useState(0);
  const [attendedClasses, setAttendedClasses] = useState(0);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const loaded = db.getSync<Subject[]>('subjects', []);
    setSubjects(loaded);
  }, []);

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddSubject = () => {
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
    <div className="max-w-2xl mx-auto space-y-6 text-foreground font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 pb-1">
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

      <Card className="glass-card p-6 sm:p-8 space-y-6">
        <div>
          <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2] mb-1.5 block">
            Subject Title
          </Label>
          <Input
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
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
            <Switch checked={manualEntry} onCheckedChange={setManualEntry} />
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
          />
        </div>

        <Button
          onClick={handleAddSubject}
          size="lg"
          className="w-full text-sm sm:text-base font-bold gap-2 py-6 rounded-[18px]"
        >
          <PlusCircle size={18} strokeWidth={2} />
          Add Subject to Schedule
        </Button>
      </Card>
    </div>
  );
};

export default AddSubjectForm;
