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
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  const [editDays, setEditDays] = useState<string[]>([]);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

  const handleExport = () => {
    const backup = db.exportBackup();
    setExportData(backup);
    toast.success('Backup export code generated');
  };

  const handleImport = () => {
    if (!importData.trim()) {
      toast.error('Please paste valid backup code');
      return;
    }
    const success = db.importBackup(importData);
    if (success) {
      toast.success('Data imported successfully');
      loadSubjects();
      setImportData('');
    } else {
      toast.error('Invalid backup code format');
    }
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

  return (
    <div className="p-4 sm:p-6 space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-100">
            <Calculator className="text-indigo-400 h-6 w-6" />
            Attendance Math & Statistics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time bunk calculations, attendance trends, and data backup tools
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleExport} className="border-slate-700 text-slate-300 gap-1.5">
                <Download size={14} />
                Export Backup
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
              <DialogHeader>
                <DialogTitle>Export Data Backup</DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Copy this code to transfer your subjects and notes to another device.
                </DialogDescription>
              </DialogHeader>
              <Textarea value={exportData} readOnly className="font-mono text-xs h-32 bg-slate-950 border-slate-800" />
              <DialogFooter>
                <Button 
                  onClick={() => { navigator.clipboard.writeText(exportData); toast.success('Copied to clipboard'); }}
                  className="bg-indigo-600"
                >
                  Copy to Clipboard
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 gap-1.5">
                <Upload size={14} />
                Import Backup
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
              <DialogHeader>
                <DialogTitle>Import Data Backup</DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Paste backup code from another device to restore data.
                </DialogDescription>
              </DialogHeader>
              <Textarea 
                placeholder="Paste backup code here..." 
                value={importData} 
                onChange={(e) => setImportData(e.target.value)} 
                className="font-mono text-xs h-32 bg-slate-950 border-slate-800" 
              />
              <DialogFooter>
                <Button onClick={handleImport} className="bg-indigo-600">Import Restore</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {subjects.length === 0 ? (
        <Card className="glass-card p-8 text-center text-slate-400 space-y-3">
          <Info className="h-10 w-10 text-indigo-400 mx-auto opacity-80" />
          <p className="text-sm">No subjects added yet. Add subjects to view attendance math and charts.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Analytics Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-card p-5">
              <span className="text-xs font-semibold text-slate-400">Overall Attendance</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-3xl font-extrabold text-indigo-400">{overallAttendance}%</span>
                <Gauge className="h-8 w-8 text-indigo-500/30" />
              </div>
              <Progress value={overallAttendance} className="h-2 mt-3" />
            </Card>

            <Card className="glass-card p-5">
              <span className="text-xs font-semibold text-slate-400">Total Lectures</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-3xl font-extrabold text-slate-100">{attendedClasses}/{totalClasses}</span>
                <Activity className="h-8 w-8 text-emerald-500/30" />
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block">Attended vs Total Conducted</span>
            </Card>

            <Card className="glass-card p-5">
              <span className="text-xs font-semibold text-emerald-400">Safe Bunk Budget</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-3xl font-extrabold text-emerald-400">{totalBunkableAll}</span>
                <ArrowDown className="h-8 w-8 text-emerald-500/30" />
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">Lectures skipable safely</span>
            </Card>

            <Card className="glass-card p-5">
              <span className="text-xs font-semibold text-rose-400">Recovery Required</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-3xl font-extrabold text-rose-400">{totalRecoveryAll}</span>
                <ArrowUp className="h-8 w-8 text-rose-500/30" />
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">Classes needed to recover</span>
            </Card>
          </div>

          {/* Interactive Chart Section */}
          <Card className="glass-card p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <h3 className="text-lg font-bold text-slate-100">Subject Attendance Visualization</h3>
              <div className="flex gap-1.5 overflow-x-auto max-w-full pb-2 sm:pb-0">
                {(['bar', 'line', 'area', 'pie', 'radar'] as ChartType[]).map((t) => (
                  <Button
                    key={t}
                    variant={chartType === t ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType(t)}
                    className="capitalize text-xs h-8 px-3 border-slate-700"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    <Bar dataKey="attendance" name="Current %" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="required" name="Target %" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={3} />
                    <Line type="monotone" dataKey="required" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                ) : chartType === 'area' ? (
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="attendance" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                  </AreaChart>
                ) : chartType === 'pie' ? (
                  <PieChart>
                    <Pie data={chartData} dataKey="attendance" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {chartData.map((e, i) => (
                        <Cell key={i} fill={e.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  </PieChart>
                ) : (
                  <RadarChart cx="50%" cy="50%" outerRadius={100} data={chartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" stroke="#94a3b8" />
                    <Radar name="Current %" dataKey="attendance" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  </RadarChart>
                )}
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Subject Breakdown Table */}
          <Card className="glass-card p-5">
            <h3 className="text-lg font-bold text-slate-100 mb-4">Subject Attendance & Bunk Math Breakdown</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Subject</TableHead>
                    <TableHead className="text-slate-400">Attendance</TableHead>
                    <TableHead className="text-slate-400">Target Threshold</TableHead>
                    <TableHead className="text-slate-400">Can Bunk</TableHead>
                    <TableHead className="text-slate-400">Must Attend</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subj) => {
                    const pct = subj.totalClasses === 0 ? 0 : Math.round((subj.attendedClasses / subj.totalClasses) * 100);
                    const req = subj.requiredAttendance || 75;
                    const bunkable = calculateBunkableClasses(subj);
                    const recovery = calculateRequiredClasses(subj);

                    return (
                      <TableRow key={subj.id} className="border-slate-800/60 hover:bg-slate-800/30">
                        <TableCell className="font-semibold text-slate-200">{subj.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${pct >= req ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {pct}%
                            </span>
                            <span className="text-xs text-slate-500">({subj.attendedClasses}/{subj.totalClasses})</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-400">{req}%</TableCell>
                        <TableCell>
                          {bunkable > 0 ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                              <ArrowDown size={12} /> {bunkable} lectures
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">0</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {recovery > 0 ? (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-xs bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                              <ArrowUp size={12} /> {recovery} lectures
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(subj)} className="h-8 w-8 p-0 text-slate-400 hover:text-slate-100">
                              <Edit size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSubject(subj.id)} className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                              <Trash2 size={14} />
                            </Button>
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
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Edit Subject Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Subject Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-slate-950 border-slate-700" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Total Classes</Label>
                <Input type="number" min="0" value={editTotalClasses} onChange={(e) => setEditTotalClasses(Number(e.target.value))} className="bg-slate-950 border-slate-700" />
              </div>
              <div>
                <Label className="text-xs">Attended Classes</Label>
                <Input type="number" min="0" value={editAttendedClasses} onChange={(e) => setEditAttendedClasses(Number(e.target.value))} className="bg-slate-950 border-slate-700" />
              </div>
            </div>

            <div>
              <Label className="text-xs">Required Attendance (%)</Label>
              <Input type="number" min="0" max="100" value={editRequiredAttendance} onChange={(e) => setEditRequiredAttendance(Number(e.target.value))} className="bg-slate-950 border-slate-700" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveEditChanges} className="bg-indigo-600">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Statistics;
