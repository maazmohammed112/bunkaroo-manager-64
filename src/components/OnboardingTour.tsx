import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, 
  PlusCircle, 
  PieChart, 
  Timer, 
  StickyNote, 
  DownloadCloud, 
  UploadCloud, 
  Check, 
  SlidersHorizontal,
  Info,
  ChevronRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { db } from '@/utils/storageDB';
import { toast } from 'sonner';

export interface TourStep {
  target: string; // matches data-tour attribute
  title: string;
  description: string;
  tip?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'timetable',
    title: 'Timetable & Full Month Calendar',
    description: 'Track daily attendance with interactive full month calendar grids, date-by-date logging, and college holiday support.',
    tip: 'Switch between Today, Full Month Calendar, and Weekly Overview anytime.'
  },
  {
    target: 'add',
    title: 'Select Mode & Add Subjects',
    description: 'Confirm your tracking mode (Calendar Date Mode or Classic Mode) to unlock subject creation and configure weekly lecture schedules.',
    tip: 'Subject creation activates once your preferred tracking mode is chosen.'
  },
  {
    target: 'statistics',
    title: 'Cross-Device Backup & Bunk Math',
    description: 'Calculate safe bunks, margin to threshold, and recovery requirements. Use Export & Import to transfer all your subjects and attendance between your phone, tablet, and laptop.',
    tip: 'Backups are stored in a safe JSON file with zero cloud lock-in.'
  },
  {
    target: 'pomodoro',
    title: 'Pomodoro Study Timer',
    description: 'Run focused study blocks with custom timers, ambient sounds, and structured break intervals.',
    tip: 'Stay disciplined during exam preparations and project sprints.'
  },
  {
    target: 'notes',
    title: 'Academic Notes Vault',
    description: 'Keep quick lecture notes, syllabus checklists, and important class announcements locally on your device.',
    tip: 'All notes are saved offline and included in your cross-device backups.'
  },
  {
    target: 'pwa-install',
    title: 'Install as Native App',
    description: 'Install BunkBuddy directly to your phone or desktop. Tap your browser menu and choose Add to Home Screen or Install App.',
    tip: 'Runs completely offline with zero latency.'
  }
];

export const OnboardingTour: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Mode selection state inside Welcome card
  const [chosenMode, setChosenMode] = useState<'calendar' | 'classic'>('calendar');

  // Check if first-time user
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('bunkbuddy_tutorial_seen');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for replay requests from Profile or Notifications
  useEffect(() => {
    const handleReplay = () => {
      setShowWelcome(false);
      setCurrentStepIndex(0);
      setIsTourActive(true);
    };

    window.addEventListener('start-bunkbuddy-tour', handleReplay);
    return () => window.removeEventListener('start-bunkbuddy-tour', handleReplay);
  }, []);

  // Update spotlight bounding rect whenever step or resize changes
  const updateSpotlight = useCallback(() => {
    if (!isTourActive) return;

    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${step.target}"]`));
    const visibleElement = elements.find((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
    }) || elements[0];

    if (visibleElement) {
      const rect = visibleElement.getBoundingClientRect();
      const inView =
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth;

      if (!inView) {
        visibleElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }

      setTargetRect(visibleElement.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [isTourActive, currentStepIndex]);

  useEffect(() => {
    updateSpotlight();

    const handleResize = () => updateSpotlight();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [updateSpotlight]);

  const saveSelectedMode = (mode: 'calendar' | 'classic') => {
    const existing = db.getSync('timetable_settings', {
      mode: 'calendar',
      weeklyHolidays: ['Saturday', 'Sunday'],
      startDate: new Date().toISOString().split('T')[0],
      semesterEndDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    const updated = { ...existing, mode };
    db.set('timetable_settings', updated);
    db.set('bunkbuddy_mode_selected', true);
    setChosenMode(mode);
    window.dispatchEvent(new CustomEvent('timetable-settings-updated', { detail: updated }));
  };

  const handleStartTour = () => {
    saveSelectedMode(chosenMode);
    setShowWelcome(false);
    setCurrentStepIndex(0);
    setIsTourActive(true);
  };

  const handleSkipWelcome = () => {
    saveSelectedMode(chosenMode);
    setShowWelcome(false);
    localStorage.setItem('bunkbuddy_tutorial_seen', 'true');
    localStorage.setItem('bunkbuddy_install_header_seen', 'true');
    window.dispatchEvent(new CustomEvent('install-header-hide'));
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    setIsTourActive(false);
    localStorage.setItem('bunkbuddy_tutorial_seen', 'true');
    localStorage.setItem('bunkbuddy_install_header_seen', 'true');
    window.dispatchEvent(new CustomEvent('install-header-hide'));
    toast.success('Tour complete! You can now start managing your semester.');
  };

  // Safe viewport calculation preventing clipping on mobile/tablet/desktop
  const getCardStyle = () => {
    if (!targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '380px',
        width: 'calc(100vw - 32px)'
      };
    }

    const cardWidth = Math.min(380, window.innerWidth - 32);
    const isTargetInLowerHalf = targetRect.top > window.innerHeight / 2;

    let left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
    if (left < 16) left = 16;
    if (left + cardWidth > window.innerWidth - 16) {
      left = window.innerWidth - cardWidth - 16;
    }

    if (isTargetInLowerHalf) {
      const bottom = Math.max(16, window.innerHeight - targetRect.top + 14);
      return {
        position: 'fixed' as const,
        left: `${left}px`,
        bottom: `${bottom}px`,
        width: `${cardWidth}px`,
        maxHeight: `${Math.max(200, targetRect.top - 28)}px`
      };
    } else {
      const top = Math.max(16, targetRect.bottom + 14);
      return {
        position: 'fixed' as const,
        left: `${left}px`,
        top: `${top}px`,
        width: `${cardWidth}px`,
        maxHeight: `${Math.max(200, window.innerHeight - targetRect.bottom - 28)}px`
      };
    }
  };

  return (
    <>
      {/* 1. First-Time Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 select-none overflow-y-auto">
            {/* Frosted Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleSkipWelcome}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Welcome Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 360 }}
              className="relative z-10 w-full max-w-md rounded-[32px] p-6 sm:p-7 bg-white/95 dark:bg-[#161824]/95 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_24px_50px_rgba(116,103,232,0.18),0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_28px_60px_rgba(0,0,0,0.7)] text-foreground space-y-4 my-auto"
            >
              {/* Logo in dark container */}
              <div className="mx-auto h-14 w-14 rounded-2xl bg-[#111218] p-2 flex items-center justify-center shadow-md border border-black/10 dark:border-white/10">
                <img src="/logo.png" alt="BunkBuddy Logo" className="w-full h-full object-contain" />
              </div>

              <div className="text-center space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7467E8] dark:text-[#A59BFF] font-display">
                  Welcome to BunkBuddy
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-foreground">
                  Your Semester Attendance Suite
                </h3>
                <p className="text-xs text-[#666675] dark:text-[#9292A2] leading-relaxed font-medium">
                  Take full control of your academic schedule, bunk safely within university limits, and keep your data backed up.
                </p>
              </div>

              {/* Mode Selection Feature */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[#666675] dark:text-[#9292A2]">
                  <span>Choose Initial Tracking Mode:</span>
                  <span className="text-[10px] text-[#7467E8] font-bold uppercase">Required</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setChosenMode('calendar')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      chosenMode === 'calendar'
                        ? 'bg-[#7467E8] text-white border-[#7467E8] shadow-sm'
                        : 'bg-[#F6F6FA] dark:bg-[#15161F] text-foreground border-[#E8E7EF] dark:border-white/10'
                    }`}
                  >
                    <span className="block text-xs font-bold font-display">Calendar Mode</span>
                    <span className={`block text-[10px] mt-0.5 ${chosenMode === 'calendar' ? 'text-white/80' : 'text-[#666675] dark:text-[#9292A2]'}`}>
                      Month calendar grid & leaves
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChosenMode('classic')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      chosenMode === 'classic'
                        ? 'bg-[#7467E8] text-white border-[#7467E8] shadow-sm'
                        : 'bg-[#F6F6FA] dark:bg-[#15161F] text-foreground border-[#E8E7EF] dark:border-white/10'
                    }`}
                  >
                    <span className="block text-xs font-bold font-display">Classic Mode</span>
                    <span className={`block text-[10px] mt-0.5 ${chosenMode === 'classic' ? 'text-white/80' : 'text-[#666675] dark:text-[#9292A2]'}`}>
                      Standard weekly schedule
                    </span>
                  </button>
                </div>
              </div>

              {/* Backup & Import Explanation Card */}
              <div className="p-3.5 rounded-2xl bg-[#F6F6FA] dark:bg-[#15161F] border border-[#E8E7EF] dark:border-white/[0.08] space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <DownloadCloud size={15} className="text-[#7467E8] flex-shrink-0" />
                  <span className="text-xs font-bold text-foreground">
                    Cross-Device Backup & Restore
                  </span>
                </div>
                <p className="text-[11px] text-[#666675] dark:text-[#9292A2] leading-relaxed">
                  All data is kept private in local storage. Use Export Backup to download your JSON file, then Import it on your phone, tablet, or laptop anytime to transfer your records instantly.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleStartTour}
                  className="w-full py-3 px-6 rounded-full text-xs font-bold text-white bg-[#7467E8] hover:bg-[#6658DF] shadow-[0_4px_16px_rgba(116,103,232,0.4)] transition-all cursor-pointer active:scale-98"
                >
                  Start Feature Walkthrough
                </button>

                <button
                  type="button"
                  onClick={handleSkipWelcome}
                  className="w-full py-2 text-xs font-semibold text-[#666675] dark:text-[#9292A2] hover:text-foreground transition-colors cursor-pointer"
                >
                  Go Straight to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Interactive Spotlight Tour Overlay */}
      <AnimatePresence>
        {isTourActive && (
          <div className="fixed inset-0 z-[130] pointer-events-auto select-none">
            {/* Dimmed Screen with SVG Cutout Mask */}
            <svg className="fixed inset-0 w-full h-full pointer-events-none transition-all duration-300">
              <defs>
                <mask id="tour-spotlight-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {targetRect && (
                    <rect
                      x={targetRect.left - 6}
                      y={targetRect.top - 6}
                      width={targetRect.width + 12}
                      height={targetRect.height + 12}
                      rx={20}
                      ry={20}
                      fill="black"
                    />
                  )}
                </mask>
              </defs>

              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="currentColor"
                className="text-black/65 dark:text-black/75 backdrop-blur-[2px]"
                mask="url(#tour-spotlight-mask)"
              />
            </svg>

            {/* Glowing Accent Border around Target Element */}
            {targetRect && (
              <motion.div
                initial={false}
                animate={{
                  top: targetRect.top - 6,
                  left: targetRect.left - 6,
                  width: targetRect.width + 12,
                  height: targetRect.height + 12
                }}
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                className="fixed pointer-events-none rounded-[20px] ring-2 ring-[#7467E8] shadow-[0_0_24px_rgba(116,103,232,0.5)] z-[131]"
              />
            )}

            {/* Floating Explanation Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ duration: 0.2 }}
              style={getCardStyle()}
              className="z-[132] rounded-[26px] p-5 sm:p-6 bg-white/95 dark:bg-[#161824]/95 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_20px_48px_rgba(0,0,0,0.22),0_4px_16px_rgba(116,103,232,0.15)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.65)] text-foreground space-y-3.5 overflow-y-auto custom-scrollbar"
            >
              {/* Header with Step indicator */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase font-display bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] dark:text-[#A59BFF]">
                  Step {currentStepIndex + 1} of {TOUR_STEPS.length}
                </span>

                <button
                  type="button"
                  onClick={handleFinish}
                  className="text-xs font-semibold text-[#666675] dark:text-[#9292A2] hover:text-foreground transition-colors cursor-pointer outline-none"
                >
                  Skip Tour
                </button>
              </div>

              {/* Title & Copy */}
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold font-display tracking-tight text-foreground">
                  {TOUR_STEPS[currentStepIndex].title}
                </h4>
                <p className="text-xs sm:text-sm text-[#666675] dark:text-[#B9BBC7] leading-relaxed font-medium">
                  {TOUR_STEPS[currentStepIndex].description}
                </p>
                {TOUR_STEPS[currentStepIndex].tip && (
                  <p className="text-[11px] text-[#7467E8] dark:text-[#A59BFF] font-semibold pt-1">
                    Pro Tip: {TOUR_STEPS[currentStepIndex].tip}
                  </p>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-1 border-t border-[#E8E7EF] dark:border-white/[0.08]">
                {currentStepIndex > 0 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-[#666675] dark:text-[#B9BBC7] hover:text-foreground transition-colors cursor-pointer outline-none"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#7467E8] hover:bg-[#6658DF] shadow-[0_4px_14px_rgba(116,103,232,0.35)] transition-all cursor-pointer outline-none active:scale-95"
                >
                  {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OnboardingTour;
