import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Coffee, Brain, CheckCircle2, Armchair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { db } from '@/utils/storageDB';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const MODE_PRESETS: Record<TimerMode, { label: string; duration: number; color: string; icon: any }> = {
  focus: { label: 'Focus Session', duration: 25 * 60, color: '#7467E8', icon: Brain },
  shortBreak: { label: 'Short Break', duration: 5 * 60, color: '#10B981', icon: Coffee },
  longBreak: { label: 'Long Break', duration: 15 * 60, color: '#3B82F6', icon: Armchair }
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
      toast.success('Break finished! Ready to focus?', {
        description: 'Starting your next focus block.'
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

  const RADIUS = 110;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const progress = timeLeft / MODE_PRESETS[mode].duration;
  const strokeDashoffset = CIRCUMFERENCE - progress * CIRCUMFERENCE;

  const CurrentIcon = MODE_PRESETS[mode].icon;

  return (
    <div className="space-y-7 text-foreground font-sans max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Timer strokeWidth={1.8} className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight">
              Focus Pomodoro Timer
            </h2>
            <p className="text-xs text-[#666675] dark:text-[#9292A2] font-medium mt-0.5">
              Science-backed study interval tracker with subject tagging
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select Subject Tag" />
            </SelectTrigger>
            <SelectContent>
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
        <Card className="glass-card p-6 sm:p-8 md:col-span-2 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Segmented Mode Control */}
          <div className="flex p-1.5 bg-[#F1F0F8] dark:bg-[#20222C] border border-[#E8E7EF] dark:border-white/10 rounded-full mb-8 w-full max-w-md justify-between gap-1">
            {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => {
              const isSelected = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'text-white shadow-xs'
                      : 'text-[#666675] dark:text-[#B9BBC7] hover:text-foreground'
                  }`}
                  style={isSelected ? { backgroundColor: MODE_PRESETS[m].color } : {}}
                >
                  {m === 'focus' && <Brain size={14} strokeWidth={2} />}
                  {m === 'shortBreak' && <Coffee size={14} strokeWidth={2} />}
                  {m === 'longBreak' && <Armchair size={14} strokeWidth={2} />}
                  <span>{MODE_PRESETS[m].label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative flex items-center justify-center my-4">
            <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90" viewBox="0 0 260 260">
              <circle
                cx="130"
                cy="130"
                r={RADIUS}
                stroke="currentColor"
                strokeWidth="8"
                className="text-[#E8E7EF] dark:text-white/10"
                fill="transparent"
              />
              <circle
                cx="130"
                cy="130"
                r={RADIUS}
                stroke={MODE_PRESETS[mode].color}
                strokeWidth="8"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
              <CurrentIcon strokeWidth={2} className="h-7 w-7 mb-2" style={{ color: MODE_PRESETS[mode].color }} />
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground font-mono">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#666675] dark:text-[#9292A2] font-display mt-1.5">
                {MODE_PRESETS[mode].label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <Button
              onClick={toggleTimer}
              size="lg"
              className="px-8 font-display font-bold shadow-lg transition-all rounded-full gap-2 text-white h-12"
              style={{ backgroundColor: MODE_PRESETS[mode].color }}
            >
              {isActive ? <Pause size={18} strokeWidth={2} /> : <Play size={18} strokeWidth={2} />}
              {isActive ? 'Pause' : 'Start Focus'}
            </Button>

            <button
              onClick={resetTimer}
              className="h-12 w-12 rounded-full border border-[#E8E7EF] dark:border-white/10 bg-[#F1F0F8] dark:bg-[#20222C] text-[#666675] dark:text-[#B9BBC7] hover:text-foreground flex items-center justify-center transition-all cursor-pointer active:scale-95"
              title="Reset Timer"
              aria-label="Reset Timer"
            >
              <RotateCcw size={18} strokeWidth={2} />
            </button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card p-6 space-y-4">
            <h3 className="text-base font-display font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 strokeWidth={2} className="text-emerald-500 h-5 w-5" />
              Session Stats
            </h3>
            <div className="space-y-3">
              <div className="bg-[#E8E4FF]/40 dark:bg-[#7467E8]/10 p-4 rounded-[20px] border border-[#7467E8]/20 flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Completed Focus</p>
                  <p className="text-2xl font-extrabold font-display text-[#7467E8]">{completedSessions}</p>
                </div>
                <Brain strokeWidth={1.8} className="h-8 w-8 text-[#7467E8]/40" />
              </div>

              <div className="bg-[#DDEDEA]/40 dark:bg-emerald-500/10 p-4 rounded-[20px] border border-emerald-500/20 flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-[#666675] dark:text-[#9292A2]">Total Focused Time</p>
                  <p className="text-2xl font-extrabold font-display text-emerald-700 dark:text-emerald-300">
                    {Math.round((completedSessions * 25) / 60)}h {(completedSessions * 25) % 60}m
                  </p>
                </div>
                <Timer strokeWidth={1.8} className="h-8 w-8 text-emerald-500/40" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 space-y-3">
            <h3 className="text-sm font-display font-bold text-foreground">Study Method Guidelines</h3>
            <ul className="text-xs text-[#666675] dark:text-[#9292A2] space-y-2 list-disc pl-4 leading-relaxed">
              <li>Focus strictly for 25 minutes without notifications.</li>
              <li>Take a 5 minute break after each focus session.</li>
              <li>After 4 sessions, take a longer 15 minute break.</li>
              <li>Tag your study session with a subject for focused tracking.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
