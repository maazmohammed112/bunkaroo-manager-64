import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TourStep {
  target: string; // matches data-tour attribute
  title: string;
  description: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'pwa-install',
    title: 'Install as Mobile & Desktop App',
    description: "Install BunkBuddy to your phone or laptop! Tap your browser menu (⋮ on Android/Chrome or Share on Safari) and choose 'Add to Home Screen' or 'Install App' for instant offline access."
  },
  {
    target: 'timetable',
    title: 'Weekly Schedule & Attendance',
    description: 'Your weekly game plan lives here. See classes, track attendance, and know what’s coming up.'
  },
  {
    target: 'add',
    title: 'Add New Subject',
    description: 'Need to add a subject? This is where the semester starts getting organised.'
  },
  {
    target: 'statistics',
    title: 'Bunk Math & Cross-Device Backup',
    description: 'Bunk Math calculates safe bunk limits and recovery classes. Plus, use Export & Import here to transfer your data across your phone, tablet, and laptop anytime.'
  },
  {
    target: 'pomodoro',
    title: 'Pomodoro Focus Timer',
    description: 'Lock in. Start a focus session and get some actual studying done.'
  },
  {
    target: 'notes',
    title: 'Academic Notes Vault',
    description: 'Notes stay here when your brain decides not to.'
  }
];

export const OnboardingTour: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Check if first-time user
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('bunkbuddy_tutorial_seen');
    if (!hasSeenTour) {
      // Short delay so interface renders cleanly before welcome card pops
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 700);
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

    // Search for element with matching data-tour
    // Check visible elements (desktop tab or mobile button)
    const elements = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${step.target}"]`));
    const visibleElement = elements.find((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
    }) || elements[0];

    if (visibleElement) {
      // Scroll into view if off-screen
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

  const handleStartTour = () => {
    setShowWelcome(false);
    setCurrentStepIndex(0);
    setIsTourActive(true);
  };

  const handleSkipWelcome = () => {
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
  };

  // Calculate card position so it never overflows or clips
  const getCardStyle = () => {
    if (!targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '360px',
        width: 'calc(100vw - 32px)'
      };
    }

    const cardWidth = Math.min(360, window.innerWidth - 32);
    const isTargetInLowerHalf = targetRect.top > window.innerHeight / 2;

    // Horizontal alignment clamped within viewport
    let left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
    if (left < 16) left = 16;
    if (left + cardWidth > window.innerWidth - 16) {
      left = window.innerWidth - cardWidth - 16;
    }

    if (isTargetInLowerHalf) {
      // Place above target
      const bottom = window.innerHeight - targetRect.top + 16;
      return {
        position: 'fixed' as const,
        left: `${left}px`,
        bottom: `${bottom}px`,
        width: `${cardWidth}px`,
        maxHeight: `${targetRect.top - 32}px`
      };
    } else {
      // Place below target
      const top = targetRect.bottom + 16;
      return {
        position: 'fixed' as const,
        left: `${left}px`,
        top: `${top}px`,
        width: `${cardWidth}px`,
        maxHeight: `${window.innerHeight - targetRect.bottom - 32}px`
      };
    }
  };

  return (
    <>
      {/* 1. First-Time Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 select-none">
            {/* Dark Frosted Backdrop */}
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
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 360 }}
              className="relative z-10 w-full max-w-sm rounded-[28px] p-6 sm:p-7 bg-white/95 dark:bg-[#161824]/95 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_24px_50px_rgba(116,103,232,0.18),0_8px_24px_rgba(0,0,0,0.08),inset_0_1.5px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_28px_60px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.18)] text-foreground space-y-4 text-center"
            >
              {/* Logo in dark container */}
              <div className="mx-auto h-14 w-14 rounded-2xl bg-[#111218] p-2 flex items-center justify-center shadow-md border border-black/10 dark:border-white/10">
                <img src="/logo.png" alt="BunkBuddy Logo" className="w-full h-full object-contain" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7467E8] dark:text-[#A59BFF] font-display">
                  BunkBuddy by Discuss
                </span>
                <h3 className="text-xl font-bold font-display tracking-tight text-foreground">
                  Your Semester Game Plan
                </h3>
                <p className="text-xs text-[#666675] dark:text-[#9292A2] leading-relaxed font-medium">
                  Master your attendance criteria, calculate bunk limits safely, and take control of your schedule.
                </p>
              </div>

              {/* Cross-Device & PWA Callout Cards */}
              <div className="space-y-2 text-left pt-1">
                <div className="p-3 rounded-2xl bg-[#F6F6FA] dark:bg-[#15161F] border border-[#E8E7EF] dark:border-white/[0.08] space-y-0.5">
                  <span className="text-[11px] font-bold text-foreground block">
                    Cross-Device Freedom
                  </span>
                  <p className="text-[11px] text-[#666675] dark:text-[#9292A2] leading-relaxed">
                    Export your data backup from one device and import it on another phone or laptop anytime.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#F6F6FA] dark:bg-[#15161F] border border-[#E8E7EF] dark:border-white/[0.08] space-y-0.5">
                  <span className="text-[11px] font-bold text-foreground block">
                    Install to Home Screen (PWA)
                  </span>
                  <p className="text-[11px] text-[#666675] dark:text-[#9292A2] leading-relaxed">
                    Tap your browser menu (⋮ or Share) and click "Add to Home Screen" for instant offline access.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleStartTour}
                  className="w-full py-3 px-6 rounded-full text-xs font-bold text-white bg-[#7467E8] hover:bg-[#6658DF] shadow-[0_4px_16px_rgba(116,103,232,0.4)] transition-all cursor-pointer active:scale-98"
                >
                  Start Quick Tour
                </button>

                <button
                  type="button"
                  onClick={handleSkipWelcome}
                  className="w-full py-2 text-xs font-semibold text-[#666675] dark:text-[#9292A2] hover:text-foreground transition-colors cursor-pointer"
                >
                  Maybe Later
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
                  {/* White background means fully opaque / dimmed */}
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {/* Black cutout means fully transparent / spotlight */}
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

              {/* The Dimmed Backdrop Rect */}
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
              className="z-[132] rounded-[24px] p-5 sm:p-6 bg-white/95 dark:bg-[#161824]/95 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_20px_48px_rgba(0,0,0,0.22),0_4px_16px_rgba(116,103,232,0.15),inset_0_1.5px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.18)] text-foreground space-y-3.5"
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
