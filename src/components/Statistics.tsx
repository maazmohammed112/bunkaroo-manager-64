import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { 
  BarChart as BarChartIcon, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Activity, 
  AreaChart as AreaChartIcon,
  Gauge, 
  Download,
  Upload,
  AlertCircle,
  CheckCircle2, 
  Info,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Calculator,
  Flame,
  Zap,
  Sparkles,
  RotateCcw,
  Minus,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { db } from '@/utils/storageDB';

interface Subject {
  id: string;
  name: string;
  totalClasses: number;
  attendedClasses: number;
  requiredAttendance: number;
  days: string[];
}

type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'radar';

const Statistics: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [overallAttendance, setOverallAttendance] = useState(0);
  const [averageRequired, setAverageRequired] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [attendedClasses, setAttendedClasses] = useState(0);
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [editName, setEditName] = useState('');
  const [editTotalClasses, setEditTotalClasses] = useState(0);
  const [editAttendedClasses, setEditAttendedClasses] = useState(0);
  const [editRequiredAttendance, setEditRequiredAttendance] = useState(75);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // What-If Simulator State
  const [simSubjectId, setSimSubjectId] = useState<string>('all');
  const [simMissClasses, setSimMissClasses] = useState<number>(1);
  const [simAttendClasses, setSimAttendClasses] = useState<number>(0);
  const [simLeaveDays, setSimLeaveDays] = useState<number>(0);

  const resetSimulation = () => {
    setSimMissClasses(1);
    setSimAttendClasses(0);
    setSimLeaveDays(0);
  };

  const handleExport = () => {
    const backup = {
      app: 'BunkBuddy',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      subjects: db.getSync<Subject[]>('subjects', []),
      notes: db.getSync('notes', []),
      userData: db.getSync('userData', null),
      timetable_settings: db.getSync('timetable_settings', null),
      attendance_daily_logs: db.getSync('attendance_daily_logs', {})
    };
    const jsonString = JSON.stringify(backup, null, 2);
    setExportData(jsonString);
    setIsExportOpen(true);
  };

  const handleDownloadFile = () => {
    if (!exportData) return;
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bunkbuddy-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup file downloaded');
  };

  const handleImport = () => {
    if (!importData.trim()) {
      toast.error('Please paste your backup JSON code or choose a file');
      return;
    }

    try {
      const parsed = JSON.parse(importData);
      let importedSubjects: Subject[] = [];

      if (Array.isArray(parsed)) {
        importedSubjects = parsed;
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.subjects)) {
          importedSubjects = parsed.subjects;
        }
        if (Array.isArray(parsed.notes)) {
          db.set('notes', parsed.notes);
        }
        if (parsed.userData) {
          db.set('userData', parsed.userData);
        }
        if (parsed.timetable_settings) {
          db.set('timetable_settings', parsed.timetable_settings);
          db.set('bunkbuddy_mode_selected', true);
          window.dispatchEvent(new CustomEvent('timetable-settings-updated', { detail: parsed.timetable_settings }));
        }
        if (parsed.attendance_daily_logs) {
          db.set('attendance_daily_logs', parsed.attendance_daily_logs);
        }
      }

      if (!importedSubjects.length) {
        toast.error('No valid subjects found in backup code');
        return;
      }

      setSubjects(importedSubjects);
      db.set('subjects', importedSubjects);
      calculateStatistics(importedSubjects);
      setImportData('');
      setIsImportOpen(false);
      toast.success(`Successfully restored ${importedSubjects.length} subjects!`);
    } catch (err) {
      toast.error('Invalid JSON backup code. Please check formatting.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
      toast.info('File loaded! Click "Restore Data" to apply.');
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = () => {
    const stored = db.getSync<Subject[]>('subjects', []);
    setSubjects(stored);
    calculateStatistics(stored);
  };

  const calculateStatistics = (subjectList: Subject[]) => {
    if (!subjectList.length) {
      setOverallAttendance(0);
      setTotalClasses(0);
      setAttendedClasses(0);
      setAverageRequired(75);
      return;
    }

    const totalAttended = subjectList.reduce((sum, s) => sum + Number(s.attendedClasses || 0), 0);
    const totalHeld = subjectList.reduce((sum, s) => sum + Number(s.totalClasses || 0), 0);
    const avgReq = subjectList.reduce((sum, s) => sum + Number(s.requiredAttendance || 75), 0) / subjectList.length;

    setTotalClasses(totalHeld);
    setAttendedClasses(totalAttended);
    setAverageRequired(avgReq);

    const overallPercent = totalHeld === 0 ? 0 : Math.round((totalAttended / totalHeld) * 100);
    setOverallAttendance(overallPercent);
  };

  // Precise Bunkable Classes Math
  const calculateBunkableClasses = (subject: Subject) => {
    if (subject.totalClasses === 0) return 0;
    const reqPct = (subject.requiredAttendance || 75) / 100;
    const currentPct = subject.attendedClasses / subject.totalClasses;

    if (currentPct < reqPct) return 0;

    // Floor of max classes missed while staying >= reqPct
    // Formula: floor((attended - reqPct * total) / reqPct)
    const bunkable = Math.floor((subject.attendedClasses - reqPct * subject.totalClasses) / reqPct);
    return Math.max(0, bunkable);
  };

  // Precise Required Recovery Classes Math
  const calculateRequiredClasses = (subject: Subject) => {
    if (subject.totalClasses === 0) return 0;
    const reqPct = (subject.requiredAttendance || 75) / 100;
    const currentPct = subject.attendedClasses / subject.totalClasses;

    if (currentPct >= reqPct) return 0;

    // Formula: ceil((reqPct * total - attended) / (1 - reqPct))
    const required = Math.ceil((reqPct * subject.totalClasses - subject.attendedClasses) / (1 - reqPct));
    return Math.max(0, required);
  };

  const handleDeleteSubject = (id: string) => {
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    db.set('subjects', updated);
    calculateStatistics(updated);
    toast.success('Subject removed');
  };

  const openEditDialog = (subject: Subject) => {
    setEditSubject(subject);
    setEditName(subject.name);
    setEditTotalClasses(subject.totalClasses);
    setEditAttendedClasses(subject.attendedClasses);
    setEditRequiredAttendance(subject.requiredAttendance || 75);
    setEditDays(subject.days || []);
  };

  const saveEditChanges = () => {
    if (!editSubject) return;
    if (!editName.trim()) {
      toast.error('Subject name is required');
      return;
    }
    if (editAttendedClasses > editTotalClasses) {
      toast.error('Attended classes cannot exceed total classes');
      return;
    }
    if (editTotalClasses < 0 || editAttendedClasses < 0) {
      toast.error('Class counts cannot be negative');
      return;
    }

    const updated = subjects.map((s) => {
      if (s.id === editSubject.id) {
        return {
          ...s,
          name: editName,
          totalClasses: editTotalClasses,
          attendedClasses: editAttendedClasses,
          requiredAttendance: editRequiredAttendance,
          days: editDays
        };
      }
      return s;
    });

    setSubjects(updated);
    db.set('subjects', updated);
    calculateStatistics(updated);
    setEditSubject(null);
    toast.success('Subject details saved');
  };

  const COLORS = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  const chartData = subjects.map((s, idx) => ({
    name: s.name,
    attendance: s.totalClasses === 0 ? 0 : Math.round((s.attendedClasses / s.totalClasses) * 100),
    required: s.requiredAttendance || 75,
    fill: COLORS[idx % COLORS.length]
  }));

  const totalBunkableAll = subjects.reduce((sum, s) => sum + calculateBunkableClasses(s), 0);
  const totalRecoveryAll = subjects.reduce((sum, s) => sum + calculateRequiredClasses(s), 0);

  // Simulator Derived Calculations
  const simSelectedSubject = subjects.find((s) => s.id === simSubjectId);
  const simBaseTotal = simSelectedSubject
    ? simSelectedSubject.totalClasses
    : subjects.reduce((sum, s) => sum + s.totalClasses, 0);

  const simBaseAttended = simSelectedSubject
    ? simSelectedSubject.attendedClasses
    : subjects.reduce((sum, s) => sum + s.attendedClasses, 0);

  const simReqThreshold = simSelectedSubject
    ? (simSelectedSubject.requiredAttendance || 75)
    : 75;

  const currentPercentage = simBaseTotal === 0 ? 0 : Math.round((simBaseAttended / simBaseTotal) * 100);

  // Estimate missed classes if taking whole days off next week
  const daysOffMissedClasses = simSelectedSubject
    ? Math.max(1, Math.round(((simSelectedSubject.days?.length || 3) / 5) * simLeaveDays))
    : Math.max(1, Math.round(subjects.length * (simLeaveDays / 5) * 3.5));

  const totalSimMissed = simLeaveDays > 0 ? daysOffMissedClasses : simMissClasses;

  const simProjectedTotal = simBaseTotal + totalSimMissed + simAttendClasses;
  const simProjectedAttended = simBaseAttended + simAttendClasses;
  const simProjectedPercentage = simProjectedTotal === 0 ? 0 : Math.round((simProjectedAttended / simProjectedTotal) * 100);

  const simPercentageDiff = simProjectedPercentage - currentPercentage;
  const isSimProjectedSafe = simProjectedPercentage >= simReqThreshold;

  const simProjectedBunks = Math.max(
    0,
    Math.floor((simProjectedAttended - (simReqThreshold / 100) * simProjectedTotal) / (simReqThreshold / 100))
  );

  const simProjectedRecoveryNeeded = Math.max(
    0,
    Math.ceil(((simReqThreshold / 100) * simProjectedTotal - simProjectedAttended) / (1 - simReqThreshold / 100))
  );

  const simProjectedOutcomeText = isSimProjectedSafe
    ? `You remain in the safe zone with ${simProjectedBunks} buffer bunkable lectures remaining above ${simReqThreshold}%.`
    : `Warning: Attendance drops below your ${simReqThreshold}% requirement. You will need to attend ${simProjectedRecoveryNeeded} straight lectures to recover.`;

  return (
    <div className="space-y-7 text-foreground font-sans max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Calculator strokeWidth={1.8} className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight">
              Attendance Math & Statistics
            </h2>
            <p className="text-xs text-[#666675] dark:text-[#9292A2] font-medium mt-0.5">
              Real-time bunk calculations, attendance trends, and data backup tools
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Dialog */}
          <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport} 
                className="rounded-full gap-1.5 text-xs font-semibold cursor-pointer"
                data-tour="export-backup"
              >
                <Download size={14} strokeWidth={2} />
                Export Backup
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-lg font-bold text-foreground">
                  Export Data Backup
                </DialogTitle>
                <DialogDescription className="text-xs text-[#666675] dark:text-[#9292A2]">
                  Copy this code or download as a file to transfer your subjects and notes across devices.
                </DialogDescription>
              </DialogHeader>
              <Textarea 
                value={exportData} 
                readOnly 
                className="font-mono text-[11px] h-36 bg-[#F8F8FC] dark:bg-[#15161F]" 
              />
              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button 
                  variant="outline"
                  onClick={handleDownloadFile}
                  className="rounded-full text-xs font-semibold gap-1.5"
                >
                  <Download size={13} />
                  Download File
                </Button>
                <Button 
                  onClick={() => { navigator.clipboard.writeText(exportData); toast.success('Copied to clipboard'); }}
                  className="rounded-full text-xs font-bold gap-1.5"
                >
                  Copy to Clipboard
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Import Dialog */}
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs font-semibold cursor-pointer">
                <Upload size={14} strokeWidth={2} />
                Import Backup
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-lg font-bold text-foreground">
                  Import Data Backup
                </DialogTitle>
                <DialogDescription className="text-xs text-[#666675] dark:text-[#9292A2]">
                  Paste backup code or upload a saved JSON file to restore all your subjects and notes.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-[#666675] dark:text-[#9292A2] cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-[#7467E8]/50 hover:bg-[#7467E8]/5 transition-colors">
                    <Upload size={13} className="text-[#7467E8]" />
                    <span>Upload JSON Backup File</span>
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <Textarea 
                  placeholder="Or paste your backup JSON code here..." 
                  value={importData} 
                  onChange={(e) => setImportData(e.target.value)} 
                  className="font-mono text-[11px] h-32 bg-[#F8F8FC] dark:bg-[#15161F]" 
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button variant="outline" onClick={() => setIsImportOpen(false)} className="rounded-full text-xs">
                  Cancel
                </Button>
                <Button onClick={handleImport} className="rounded-full text-xs font-bold px-5">
                  Restore Data
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {subjects.length === 0 ? (
        <Card className="glass-card p-10 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="h-14 w-14 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/15 text-[#7467E8] flex items-center justify-center mx-auto">
            <Info strokeWidth={1.8} className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground font-display">No subjects added yet</h3>
            <p className="text-xs text-[#666675] dark:text-[#9292A2]">
              Add subjects in the Add Subject tab to view intelligent bunk limits, analytics, and interactive charts.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Analytics Overview Grid - Direct Reference Soft Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-card p-5 space-y-2">
              <span className="text-xs font-bold text-[#666675] dark:text-[#9292A2] block">
                Overall Attendance
              </span>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-[#7467E8] tracking-tight font-display">
                  {overallAttendance}%
                </span>
                <div className="h-10 w-10 rounded-2xl bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] flex items-center justify-center">
                  <Gauge className="h-5 w-5" strokeWidth={2} />
                </div>
              </div>
              <div className="w-full bg-[#F1F0F8] dark:bg-[#20222C] rounded-full h-2 overflow-hidden mt-3">
                <div 
                  className="bg-[#7467E8] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, overallAttendance)}%` }}
                />
              </div>
            </Card>

            <Card className="glass-card p-5 space-y-2">
              <span className="text-xs font-bold text-[#666675] dark:text-[#9292A2] block">
                Total Lectures
              </span>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-foreground tracking-tight font-display">
                  {attendedClasses}/{totalClasses}
                </span>
                <div className="h-10 w-10 rounded-2xl bg-[#DEE7F6] dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                  <Activity className="h-5 w-5" strokeWidth={2} />
                </div>
              </div>
              <span className="text-[11px] text-[#666675] dark:text-[#9292A2] font-medium block">
                Attended vs total held
              </span>
            </Card>

            <Card className="glass-card p-5 space-y-2 bg-[#DDEDEA]/40 dark:bg-emerald-500/10 border-emerald-500/20">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                Safe Bunk Budget
              </span>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 tracking-tight font-display">
                  {totalBunkableAll}
                </span>
                <div className="h-10 w-10 rounded-2xl bg-[#DDEDEA] dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <ArrowDown className="h-5 w-5" strokeWidth={2} />
                </div>
              </div>
              <span className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 font-medium block">
                Lectures skipable safely
              </span>
            </Card>

            <Card className="glass-card p-5 space-y-2 bg-[#F7DDE9]/40 dark:bg-rose-500/10 border-rose-500/20">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block">
                Recovery Required
              </span>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-rose-700 dark:text-rose-300 tracking-tight font-display">
                  {totalRecoveryAll}
                </span>
                <div className="h-10 w-10 rounded-2xl bg-[#F7DDE9] dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-center">
                  <ArrowUp className="h-5 w-5" strokeWidth={2} />
                </div>
              </div>
              <span className="text-[11px] text-rose-700/80 dark:text-rose-300/80 font-medium block">
                Classes needed to recover
              </span>
            </Card>
          </div>

          {/* Interactive What-If Bunk & Leave Simulator */}
          <Card className="glass-card p-6 rounded-[28px] border-[#7467E8]/25 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#E8E7EF] dark:border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] flex items-center justify-center flex-shrink-0">
                  <Sparkles size={18} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground font-display flex items-center gap-2">
                    What-If Bunk & Leave Simulator
                  </h3>
                  <p className="text-xs text-[#666675] dark:text-[#9292A2] font-medium">
                    Test skipping classes or taking days off to preview your projected percentage
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={simSubjectId} onValueChange={setSimSubjectId}>
                  <SelectTrigger className="w-full sm:w-56 h-9 rounded-full text-xs font-semibold">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all" className="text-xs font-semibold">
                      Semester Average (All Subjects)
                    </SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-xs font-medium">
                        {s.name} ({s.totalClasses === 0 ? 0 : Math.round((s.attendedClasses / s.totalClasses) * 100)}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetSimulation}
                  className="h-9 px-3 rounded-full text-xs font-semibold text-[#666675] dark:text-[#9292A2] hover:text-foreground cursor-pointer"
                  title="Reset simulation values"
                >
                  <RotateCcw size={13} className="mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Steppers & Leave Sliders Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stepper 1: Miss Individual Classes */}
              <div className="p-4 rounded-2xl bg-[#F6F6FA] dark:bg-[#15161F] border border-[#E8E7EF] dark:border-white/[0.08] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">
                    Miss Upcoming Classes
                  </span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full">
                    {simMissClasses} {simMissClasses === 1 ? 'class' : 'classes'}
                  </span>
                </div>
                <p className="text-[11px] text-[#666675] dark:text-[#9292A2] leading-tight">
                  Simulate skipping lectures of this subject
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSimMissClasses(Math.max(0, simMissClasses - 1))}
                    disabled={simMissClasses <= 0}
                    className="h-8 w-8 rounded-full bg-white dark:bg-[#20222C] border border-[#E8E7EF] dark:border-white/10 flex items-center justify-center text-foreground hover:bg-[#F1F0F8] dark:hover:bg-[#282B37] disabled:opacity-40 cursor-pointer active:scale-95 transition-all"
                  >
                    <Minus size={13} strokeWidth={2.5} />
                  </button>
                  <div className="flex-1 text-center font-display font-bold text-base text-foreground">
                    {simMissClasses}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSimMissClasses(simMissClasses + 1)}
                    className="h-8 w-8 rounded-full bg-white dark:bg-[#20222C] border border-[#E8E7EF] dark:border-white/10 flex items-center justify-center text-foreground hover:bg-[#F1F0F8] dark:hover:bg-[#282B37] cursor-pointer active:scale-95 transition-all"
                  >
                    <Plus size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Stepper 2: Leave Next Week (Days Off) */}
              <div className="p-4 rounded-2xl bg-[#F6F6FA] dark:bg-[#15161F] border border-[#E8E7EF] dark:border-white/[0.08] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">
                    Take Leave Next Week
                  </span>
                  <span className="text-xs font-bold text-[#7467E8] dark:text-[#A59BFF] bg-[#7467E8]/10 px-2.5 py-0.5 rounded-full">
                    {simLeaveDays === 0 ? 'None' : `${simLeaveDays} ${simLeaveDays === 1 ? 'day' : 'days'}`}
                  </span>
                </div>
                <p className="text-[11px] text-[#666675] dark:text-[#9292A2] leading-tight">
                  {simLeaveDays > 0 
                    ? `Misses approx ${daysOffMissedClasses} scheduled lectures`
                    : 'Select days off to simulate full-day leaves'}
                </p>
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                  {[0, 1, 2, 3, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSimLeaveDays(d)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                        simLeaveDays === d
                          ? 'bg-[#7467E8] text-white shadow-xs'
                          : 'bg-white dark:bg-[#20222C] text-[#666675] dark:text-[#9292A2] hover:text-foreground border border-[#E8E7EF] dark:border-white/10'
                      }`}
                    >
                      {d === 0 ? '0d' : `${d}d`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stepper 3: Attend Consecutive Classes (Recovery) */}
              <div className="p-4 rounded-2xl bg-[#F6F6FA] dark:bg-[#15161F] border border-[#E8E7EF] dark:border-white/[0.08] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground">
                    Attend Next Classes
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    +{simAttendClasses} attended
                  </span>
                </div>
                <p className="text-[11px] text-[#666675] dark:text-[#9292A2] leading-tight">
                  Simulate attending consecutive classes straight
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSimAttendClasses(Math.max(0, simAttendClasses - 1))}
                    disabled={simAttendClasses <= 0}
                    className="h-8 w-8 rounded-full bg-white dark:bg-[#20222C] border border-[#E8E7EF] dark:border-white/10 flex items-center justify-center text-foreground hover:bg-[#F1F0F8] dark:hover:bg-[#282B37] disabled:opacity-40 cursor-pointer active:scale-95 transition-all"
                  >
                    <Minus size={13} strokeWidth={2.5} />
                  </button>
                  <div className="flex-1 text-center font-display font-bold text-base text-foreground">
                    {simAttendClasses}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSimAttendClasses(simAttendClasses + 1)}
                    className="h-8 w-8 rounded-full bg-white dark:bg-[#20222C] border border-[#E8E7EF] dark:border-white/10 flex items-center justify-center text-foreground hover:bg-[#F1F0F8] dark:hover:bg-[#282B37] cursor-pointer active:scale-95 transition-all"
                  >
                    <Plus size={13} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>

            {/* Live Projected Outcome Strip */}
            <div className={`p-4 rounded-[22px] border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isSimProjectedSafe 
                ? 'bg-[#DDEDEA]/50 dark:bg-emerald-500/10 border-emerald-500/25' 
                : 'bg-[#F7DDE9]/50 dark:bg-rose-500/10 border-rose-500/25'
            }`}>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#666675] dark:text-[#9292A2]">
                  Simulated Outcome Preview
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold font-display text-[#666675] dark:text-[#9292A2]">
                    Current: <strong className="text-foreground">{currentPercentage}%</strong>
                  </span>
                  <span className="text-foreground/40 font-bold">➔</span>
                  <span className="text-2xl font-extrabold font-display tracking-tight text-foreground">
                    Projected: <span className={isSimProjectedSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{simProjectedPercentage}%</span>
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    simPercentageDiff > 0 
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' 
                      : simPercentageDiff < 0 
                      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {simPercentageDiff > 0 ? `+${simPercentageDiff}%` : `${simPercentageDiff}%`}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 font-medium">
                  {simProjectedOutcomeText}
                </p>
              </div>

              <div className="flex sm:flex-col items-end gap-1 flex-shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isSimProjectedSafe 
                    ? 'bg-[#DDEDEA] dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300' 
                    : 'bg-[#F7DDE9] dark:bg-rose-500/20 text-rose-800 dark:text-rose-300'
                }`}>
                  {isSimProjectedSafe ? 'Safe Zone' : 'Danger Zone'}
                </span>
                <span className="text-[11px] text-[#666675] dark:text-[#9292A2] font-medium">
                  Target: {simReqThreshold}%
                </span>
              </div>
            </div>
          </Card>

          {/* Interactive Chart Section */}
          <Card className="glass-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground font-display">
                  Subject Attendance Visualization
                </h3>
                <p className="text-xs text-[#666675] dark:text-[#9292A2]">
                  Compare attendance against target threshold
                </p>
              </div>

              {/* Segmented Pill Selector */}
              <div className="flex p-1 bg-[#F1F0F8] dark:bg-[#20222C] rounded-full border border-[#E8E7EF] dark:border-white/10 overflow-x-auto max-w-full">
                {(['bar', 'line', 'area', 'pie', 'radar'] as ChartType[]).map((t) => {
                  const isActive = chartType === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setChartType(t)}
                      className={`capitalize text-xs font-bold py-1.5 px-3 rounded-full transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#7467E8] text-white shadow-xs'
                          : 'text-[#666675] dark:text-[#B9BBC7] hover:text-foreground'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#9292A2" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9292A2" domain={[0, 100]} fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="attendance" name="Current %" fill="#7467E8" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="required" name="Target %" fill="#F43F5E" radius={[8, 8, 0, 0]} />
                  </BarChart>
                ) : chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#9292A2" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9292A2" domain={[0, 100]} fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="attendance" stroke="#7467E8" strokeWidth={3} dot={{ r: 4, fill: '#7467E8' }} />
                    <Line type="monotone" dataKey="required" stroke="#F43F5E" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#F43F5E' }} />
                  </LineChart>
                ) : chartType === 'area' ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#9292A2" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9292A2" domain={[0, 100]} fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="attendance" stroke="#7467E8" fill="#7467E8" fillOpacity={0.2} strokeWidth={2.5} />
                  </AreaChart>
                ) : chartType === 'pie' ? (
                  <PieChart>
                    <Pie data={chartData} dataKey="attendance" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {chartData.map((e, i) => (
                        <Cell key={i} fill={e.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                ) : (
                  <RadarChart cx="50%" cy="50%" outerRadius={100} data={chartData}>
                    <PolarGrid stroke="#E8E7EF" />
                    <PolarAngleAxis dataKey="name" stroke="#9292A2" fontSize={11} />
                    <Radar name="Current %" dataKey="attendance" stroke="#7467E8" fill="#7467E8" fillOpacity={0.4} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  </RadarChart>
                )}
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Subject Breakdown Table */}
          <Card className="glass-card p-6 space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground font-display">
                Subject Attendance & Bunk Math Breakdown
              </h3>
              <p className="text-xs text-[#666675] dark:text-[#9292A2]">
                Detailed counts, safe margin calculations, and quick actions
              </p>
            </div>

            <div className="overflow-x-auto rounded-[18px] border border-[#E8E7EF] dark:border-white/10">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F1F0F8]/50 dark:bg-[#20222C]/50 hover:bg-[#F1F0F8]/50">
                    <TableHead>Subject</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Can Bunk</TableHead>
                    <TableHead>Must Attend</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subj) => {
                    const pct = subj.totalClasses === 0 ? 0 : Math.round((subj.attendedClasses / subj.totalClasses) * 100);
                    const req = subj.requiredAttendance || 75;
                    const bunkable = calculateBunkableClasses(subj);
                    const recovery = calculateRequiredClasses(subj);

                    return (
                      <TableRow key={subj.id}>
                        <TableCell className="font-semibold text-foreground">{subj.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-xs sm:text-sm ${pct >= req ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              {pct}%
                            </span>
                            <span className="text-[11px] text-[#9292A2]">({subj.attendedClasses}/{subj.totalClasses})</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-[#666675] dark:text-[#B9BBC7]">{req}%</TableCell>
                        <TableCell>
                          {bunkable > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-[#DDEDEA] dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-bold">
                              <ArrowDown size={12} strokeWidth={2.5} /> {bunkable} lectures
                            </span>
                          ) : (
                            <span className="text-[#9292A2] text-xs">0</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {recovery > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-[#F7DDE9] dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/20 px-2.5 py-1 rounded-full text-xs font-bold">
                              <ArrowUp size={12} strokeWidth={2.5} /> {recovery} lectures
                            </span>
                          ) : (
                            <span className="text-[#9292A2] text-xs">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <button 
                              onClick={() => openEditDialog(subj)} 
                              className="h-8 w-8 rounded-full bg-[#F1F0F8] dark:bg-[#20222C] text-[#666675] dark:text-[#B9BBC7] hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                              title="Edit Subject"
                            >
                              <Edit size={13} strokeWidth={2} />
                            </button>
                            <button 
                              onClick={() => setSubjectToDelete(subj)} 
                              className="h-8 w-8 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-colors cursor-pointer"
                              title="Delete Subject"
                            >
                              <Trash2 size={13} strokeWidth={2} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Subject Dialog */}
      <Dialog open={!!editSubject} onOpenChange={(open) => !open && setEditSubject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-foreground">
              Edit Subject Details
            </DialogTitle>
            <DialogDescription className="text-xs text-[#666675] dark:text-[#9292A2]">
              Update class totals and attendance counts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Subject Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Total Classes</Label>
                <Input type="number" min="0" value={editTotalClasses} onChange={(e) => setEditTotalClasses(Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Attended Classes</Label>
                <Input type="number" min="0" value={editAttendedClasses} onChange={(e) => setEditAttendedClasses(Number(e.target.value))} className="mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Required Attendance (%)</Label>
              <Input type="number" min="0" max="100" value={editRequiredAttendance} onChange={(e) => setEditRequiredAttendance(Number(e.target.value))} className="mt-1" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setEditSubject(null)}>Cancel</Button>
            <Button onClick={saveEditChanges}>Save Changes</Button>
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

export default Statistics;
