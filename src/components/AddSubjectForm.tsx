import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
    <div className="p-4 sm:p-6 space-y-6 text-slate-100 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-100">
          <BookOpen className="text-indigo-400 h-6 w-6" />
          Add New Subject
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure weekly lectures and attendance threshold limits
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <Label className="text-xs font-semibold text-slate-300">Subject Title</Label>
          <Input
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="e.g. Data Structures & Algorithms"
            className="bg-slate-900 border-slate-700 text-slate-100 mt-1.5"
          />
        </div>

        <div>
          <Label className="text-xs font-semibold text-slate-300 mb-2 block">Weekly Schedule Days</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {days.map((day) => (
              <div
                key={day}
                onClick={() => handleDayToggle(day)}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  selectedDays.includes(day)
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Checkbox checked={selectedDays.includes(day)} />
                  <span>{day}</span>
                </div>
                {selectedDays.includes(day) && <Check size={14} className="text-indigo-400" />}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between py-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-300">Enter Pre-existing Attendance Counts</span>
            <Switch checked={manualEntry} onCheckedChange={setManualEntry} />
          </div>

          {manualEntry && (
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800 mt-2">
              <div>
                <Label className="text-xs">Total Classes Held</Label>
                <Input
                  type="number"
                  min="0"
                  value={totalClasses}
                  onChange={(e) => setTotalClasses(Number(e.target.value))}
                  className="bg-slate-900 border-slate-700 text-slate-100 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Classes Attended</Label>
                <Input
                  type="number"
                  min="0"
                  value={attendedClasses}
                  onChange={(e) => setAttendedClasses(Number(e.target.value))}
                  className="bg-slate-900 border-slate-700 text-slate-100 mt-1"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <Label className="text-xs font-semibold text-slate-300">Required Attendance Threshold (%)</Label>
            <span className="text-xs font-bold text-indigo-400">{requiredAttendance}%</span>
          </div>
          <Input
            type="number"
            min="0"
            max="100"
            value={requiredAttendance}
            onChange={(e) => setRequiredAttendance(Number(e.target.value))}
            className="bg-slate-900 border-slate-700 text-slate-100"
          />
        </div>

        <Button
          onClick={handleAddSubject}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-5 rounded-xl gap-2 shadow-lg shadow-indigo-600/30"
        >
          <PlusCircle size={18} />
          Add Subject to Schedule
        </Button>
      </div>
    </div>
  );
};

export default AddSubjectForm;
