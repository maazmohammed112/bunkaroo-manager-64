import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Coffee, Brain, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { db } from '@/utils/storageDB';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const MODE_PRESETS: Record<TimerMode, { label: string; duration: number; color: string; icon: any }> = {
  focus: { label: 'Focus Session', duration: 25 * 60, color: '#6366f1', icon: Brain },
  shortBreak: { label: 'Short Break', duration: 5 * 60, color: '#10b981', icon: Coffee },
  longBreak: { label: 'Long Break', duration: 15 * 60, color: '#3b82f6', icon: Sparkles }
};

const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_PRESETS.focus.duration);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [selectedSubject, setSelectedSubject] = useState<string>('general');
  const [subjectsList, setSubjectsList] = useState<any[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadedSubjects = db.getSync<any[]>('subjects', []);
    setSubjectsList(loadedSubjects);

    const savedCompleted = db.getSync<number>('pomodoro_completed_sessions', 0);
    setCompletedSessions(savedCompleted);
  }, []);

  useEffect(() => {
    setTimeLeft(MODE_PRESETS[mode].duration);
    setIsActive(false);
  }, [mode]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, mode]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (mode === 'focus') {
      const nextCount = completedSessions + 1;
      setCompletedSessions(nextCount);
      db.set('pomodoro_completed_sessions', nextCount);

      toast.success('Focus session complete! Take a break.', {
        description: 'You completed a 25 minute study session.'
      });

      if (nextCount % 4 === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      toast.info('Break time finished!', {
        description: 'Ready to dive back into your studies?'
      });
      setMode('focus');
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODE_PRESETS[mode].duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = MODE_PRESETS[mode].duration;
  const progressPercentage = ((totalDuration - timeLeft) / totalDuration) * 100;
  const strokeDashoffset = 440 - (440 * progressPercentage) / 100;

  const CurrentIcon = MODE_PRESETS[mode].icon;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2">
            <Timer strokeWidth={1.5} className="text-indigo-400 h-6 w-6" />
            Pomodoro Study Timer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Maintain focus, manage intervals, and track your study productivity.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="bg-slate-900/60 border-slate-700 text-slate-200 text-xs">
              <SelectValue placeholder="Select Subject Tag" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
              <SelectItem value="general">General Study</SelectItem>
              {subjectsList.map((subj) => (
                <SelectItem key={subj.id} value={subj.name}>
                  {subj.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card p-6 md:col-span-2 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="flex gap-2 p-1.5 bg-slate-950/60 border border-slate-800 rounded-xl mb-8 w-full max-w-md justify-between">
            {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  mode === m
                    ? 'bg-indigo-600 text-white shadow-md font-display'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {m === 'focus' && <Brain size={14} strokeWidth={1.5} />}
                {m === 'shortBreak' && <Coffee size={14} strokeWidth={1.5} />}
                {m === 'longBreak' && <Sparkles size={14} strokeWidth={1.5} />}
                <span>{MODE_PRESETS[m].label}</span>
              </button>
            ))}
          </div>

          <div className="relative flex items-center justify-center my-4">
            <svg className="w-64 h-64 transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800/60"
                fill="transparent"
              />
              <circle
                cx="128"
                cy="128"
                r="70"
                stroke={MODE_PRESETS[mode].color}
                strokeWidth="8"
                strokeDasharray="440"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <CurrentIcon strokeWidth={1.5} className="h-8 w-8 mb-2 opacity-80" style={{ color: MODE_PRESETS[mode].color }} />
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-100 font-mono">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-display font-medium mt-1">
                {MODE_PRESETS[mode].label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <Button
              onClick={toggleTimer}
              size="lg"
              className="px-8 font-display font-bold shadow-lg transition-all rounded-xl gap-2 text-white"
              style={{ backgroundColor: MODE_PRESETS[mode].color }}
            >
              {isActive ? <Pause size={18} strokeWidth={1.5} /> : <Play size={18} strokeWidth={1.5} />}
              {isActive ? 'Pause' : 'Start Focus'}
            </Button>

            <Button
              onClick={resetTimer}
              variant="outline"
              size="icon"
              className="rounded-xl border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              <RotateCcw size={18} strokeWidth={1.5} />
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card p-6">
            <h3 className="text-base font-display font-bold text-slate-200 mb-4 flex items-center gap-2">
              <CheckCircle2 strokeWidth={1.5} className="text-emerald-400 h-5 w-5" />
              Session Stats
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400">Completed Focus</p>
                  <p className="text-2xl font-bold font-display text-indigo-400">{completedSessions}</p>
                </div>
                <Brain strokeWidth={1.5} className="h-8 w-8 text-indigo-500/30" />
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400">Total Focused Time</p>
                  <p className="text-2xl font-bold font-display text-emerald-400">
                    {Math.round((completedSessions * 25) / 60)} hrs {(completedSessions * 25) % 60} mins
                  </p>
                </div>
                <Timer strokeWidth={1.5} className="h-8 w-8 text-emerald-500/30" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <h3 className="text-sm font-display font-bold text-slate-300 mb-3">Study Method Guidelines</h3>
            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
              <li>Focus strictly for 25 minutes without notifications.</li>
              <li>Take a 5 minute break after each focus session.</li>
              <li>After 4 sessions, take a longer 15 minute break.</li>
              <li>Tag your study session with a subject for focused subject tracking.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
