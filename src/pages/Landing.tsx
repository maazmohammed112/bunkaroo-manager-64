import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { 
  BarChart3, 
  CalendarDays, 
  ShieldCheck, 
  Timer, 
  ArrowRight, 
  Mail, 
  Globe, 
  Calculator, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Zap,
  Flame,
  Brain,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { userData, isLoggedIn } = useUser();

  const handleStart = () => {
    if (userData?.isOnboarded || !userData?.isFirstTime) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-[100dvh] flex-1 bg-background text-foreground flex flex-col font-sans selection:bg-[#7467E8]/20 transition-colors overflow-x-clip">
      {/* Navigation */}
      <nav className="glass-header border-b border-[#E8E7EF] dark:border-white/10 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between max-w-7xl">
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="Scroll to top"
          >
            <div className="h-10 w-10 rounded-2xl bg-[#111218] p-1.5 flex items-center justify-center shadow-sm border border-black/10 dark:border-white/10 group-hover:scale-105 transition-transform flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="BunkBuddy Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-foreground">
              BunkBuddy
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://maazprofile.tech" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-[#666675] dark:text-[#B9BBC7] hover:text-foreground flex items-center gap-1.5 transition-colors hidden sm:flex font-semibold"
            >
              <Globe size={16} strokeWidth={1.8} className="text-[#7467E8]" />
              <span>Portfolio</span>
            </a>

            <a 
              href="mailto:maazmohammed112@gmail.com" 
              className="text-xs sm:text-sm text-[#666675] dark:text-[#B9BBC7] hover:text-foreground flex items-center gap-1.5 transition-colors hidden sm:flex font-semibold"
            >
              <Mail size={16} strokeWidth={1.8} className="text-[#7467E8]" />
              <span>Feedback</span>
            </a>

            <Button 
              onClick={handleStart}
              className="bg-[#7467E8] hover:bg-[#6658DF] text-white font-display font-bold shadow-md shadow-[#7467E8]/25 rounded-full px-5 transition-all hover:scale-105"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
              <ArrowRight size={15} strokeWidth={2} className="ml-1.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-[#7467E8]/10 rounded-full blur-[130px] pointer-events-none"></div>

        <div className="container mx-auto max-w-5xl text-center relative z-10 space-y-7">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/20 border border-[#7467E8]/30 text-[#7467E8] dark:text-[#A59BFF] text-xs font-bold uppercase tracking-wider"
          >
            <span>Smart Academic Engine</span>
            <span className="text-muted-foreground">•</span>
            <span className="lowercase font-semibold">crafted for college students</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-display font-black text-foreground tracking-tight leading-[1.1]"
          >
            Never Guess Your Attendance.{' '}
            <span className="text-[#7467E8]">
              Bunk Smartly.
            </span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-sm sm:text-base text-[#666675] dark:text-[#9292A2] max-w-2xl mx-auto font-medium leading-relaxed space-y-2"
          >
            <p className="text-foreground font-semibold">
              No mandatory accounts. 100% on-device private local storage. Installable directly to your home screen as a mobile app. Completely free with zero ads.
            </p>
            <p>
              Calculates exact safe bunk limits, recovery classes, weekly timetable schedules, focus pomodoros, and secured notes.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
          >
            <Button 
              onClick={handleStart}
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-sm sm:text-base font-display font-bold bg-[#7467E8] hover:bg-[#6658DF] text-white rounded-full shadow-lg shadow-[#7467E8]/25 transition-all hover:scale-105"
            >
              Launch Dashboard
              <ArrowRight size={17} strokeWidth={2} className="ml-2" />
            </Button>

            <a 
              href="https://maazprofile.tech" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-xs sm:text-sm font-bold text-foreground border border-[#E8E7EF] dark:border-white/10 bg-white dark:bg-[#181A22] rounded-full transition-all hover:border-[#7467E8]/40 shadow-xs"
            >
              Developer Profile
              <Globe size={15} strokeWidth={2} className="ml-2 text-[#7467E8]" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 px-6 bg-[#F1F0F8]/40 dark:bg-[#15161F]/40 border-t border-[#E8E7EF] dark:border-white/[0.08]">
        <div className="container mx-auto max-w-6xl space-y-16">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-display font-black text-foreground tracking-tight">
              Designed for Effortless Academic Control
            </h2>
            <p className="text-xs sm:text-sm text-[#666675] dark:text-[#9292A2] font-semibold">
              Real-time attendance math & focus intelligence at your fingertips
            </p>
          </div>

          {/* Reference Style Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ y: -6 }}
              className="glass-card p-7 space-y-4 hover:border-[#7467E8]/40 transition-all group"
            >
              <div className="h-12 w-12 rounded-2xl bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calculator size={22} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-display font-bold text-foreground">Bunk Math Engine</h3>
              <p className="text-xs text-[#666675] dark:text-[#9292A2] leading-relaxed">
                Calculates maximum safe bunkable classes and exact consecutive recovery lectures required to reach your target threshold.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-bold text-[#7467E8] dark:text-[#A59BFF] bg-[#E8E4FF] dark:bg-[#7467E8]/20 px-3 py-1 rounded-full">
                  100% Exact Math
                </span>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -6 }}
              className="glass-card p-7 space-y-4 hover:border-[#7467E8]/40 transition-all group"
            >
              <div className="h-12 w-12 rounded-2xl bg-[#DDEDEA] dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CalendarDays size={22} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-display font-bold text-foreground">Interactive Timetable</h3>
              <p className="text-xs text-[#666675] dark:text-[#9292A2] leading-relaxed">
                Organize weekly schedules with 1-click attendance logging (Attended / Missed) and visual status color codes.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-[#DDEDEA] dark:bg-emerald-500/20 px-3 py-1 rounded-full">
                  Instant 1-Click Action
                </span>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -6 }}
              className="glass-card p-7 space-y-4 hover:border-[#7467E8]/40 transition-all group"
            >
              <div className="h-12 w-12 rounded-2xl bg-[#DEE7F6] dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 size={22} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-display font-bold text-foreground">Visual Analytics</h3>
              <p className="text-xs text-[#666675] dark:text-[#9292A2] leading-relaxed">
                Explore attendance trends with Bar, Line, Pie, Area, and Radar charts alongside individual subject breakdowns.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-300 bg-[#DEE7F6] dark:bg-blue-500/20 px-3 py-1 rounded-full">
                  5 Custom Chart Views
                </span>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -6 }}
              className="glass-card p-7 space-y-4 hover:border-[#7467E8]/40 transition-all group"
            >
              <div className="h-12 w-12 rounded-2xl bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Timer size={22} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-display font-bold text-foreground">Pomodoro Study Timer</h3>
              <p className="text-xs text-[#666675] dark:text-[#9292A2] leading-relaxed">
                Stay focused with integrated 25-minute study intervals, break reminders, and subject-wise study tracking.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-bold text-[#7467E8] dark:text-[#A59BFF] bg-[#E8E4FF] dark:bg-[#7467E8]/20 px-3 py-1 rounded-full">
                  25m / 5m / 15m Intervals
                </span>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -6 }}
              className="glass-card p-7 space-y-4 hover:border-[#7467E8]/40 transition-all group"
            >
              <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck size={22} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-display font-bold text-foreground">PIN & IndexedDB</h3>
              <p className="text-xs text-[#666675] dark:text-[#9292A2] leading-relaxed">
                Optional 4-digit security PIN. High-performance offline IndexedDB storage keeps your data strictly private on your device.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 px-3 py-1 rounded-full">
                  100% Private & Local
                </span>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -6 }}
              className="glass-card p-7 space-y-4 hover:border-[#7467E8]/40 transition-all group"
            >
              <div className="h-12 w-12 rounded-2xl bg-[#F7DDE9] dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smartphone size={22} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-display font-bold text-foreground">PWA Mobile Experience</h3>
              <p className="text-xs text-[#666675] dark:text-[#9292A2] leading-relaxed">
                Installable as a Progressive Web App on Android, iOS, and Desktop for native app convenience and lightning-fast speed.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 bg-[#F7DDE9] dark:bg-rose-500/20 px-3 py-1 rounded-full">
                  Installable PWA
                </span>
              </div>
            </motion.div>
          </div>

          {/* Real-time Insights Preview Showcase */}
          <div className="glass-card p-8 rounded-[28px] border-[#7467E8]/20 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#E8E7EF] dark:border-white/[0.08]">
              <div>
                <span className="text-xs font-bold text-[#7467E8] uppercase tracking-wider block mb-1">
                  Real-Time Intelligence
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground flex items-center gap-2">
                  <Zap size={20} strokeWidth={2} className="text-[#7467E8]" />
                  Automated In-Built Insights & Risk Alerts
                </h3>
              </div>
              <span className="px-3.5 py-1 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] dark:text-[#A59BFF] text-xs font-bold">
                LIVE INSIGHTS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-[22px] bg-[#DDEDEA]/50 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-display">
                    <CheckCircle2 size={15} strokeWidth={2.5} />
                    Safe Bunk Budget
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#DDEDEA] dark:bg-emerald-500/20 rounded-full">82%</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                  "You have 4 safe bunkable lectures in Advanced Physics while remaining comfortably above your 75% target limit."
                </p>
              </div>

              <div className="p-5 rounded-[22px] bg-[#F7DDE9]/50 dark:bg-rose-500/10 border border-rose-500/20 space-y-2">
                <div className="flex items-center justify-between text-rose-800 dark:text-rose-300">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-display">
                    <AlertCircle size={15} strokeWidth={2.5} />
                    Critical Recovery
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#F7DDE9] dark:bg-rose-500/20 rounded-full">68%</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                  "Mathematics attendance dropped below 75%. You must attend 5 consecutive lectures to recover into safe zone."
                </p>
              </div>

              <div className="p-5 rounded-[22px] bg-[#E8E4FF]/50 dark:bg-[#7467E8]/10 border border-[#7467E8]/20 space-y-2">
                <div className="flex items-center justify-between text-[#7467E8] dark:text-[#A59BFF]">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-display">
                    <Brain size={15} strokeWidth={2.5} />
                    Study Focus Metric
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#E8E4FF] dark:bg-[#7467E8]/20 rounded-full">3 SESSIONS</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                  "You logged 75 minutes of uninterrupted focus time today. Great momentum before your upcoming lab assessments!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E8E7EF] dark:border-white/10 py-6 px-6 bg-white/50 dark:bg-[#181A22]/50 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666675] dark:text-[#9292A2] font-sans">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-[#111218] p-1 flex items-center justify-center shadow-xs border border-black/10 dark:border-white/10 flex-shrink-0">
              <img src="/logo.png" alt="BunkBuddy Logo" className="w-full h-full object-contain" />
            </div>
            <span>
              BunkBuddy by{' '}
              <a
                href="https://discussit.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#7467E8] hover:underline transition-colors"
              >
                Discuss
              </a>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <a 
              href="https://maazprofile.tech" 
              target="_blank" 
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-full bg-white dark:bg-[#181A22] border border-[#E8E7EF] dark:border-white/10 text-[#666675] dark:text-[#9292A2] hover:text-[#7467E8] hover:border-[#7467E8]/40 flex items-center justify-center transition-all shadow-xs"
              title="Developer Portfolio (maazprofile.tech)"
              aria-label="Developer Portfolio"
            >
              <Globe size={15} strokeWidth={2} />
            </a>

            <a 
              href="mailto:maazmohammed112@gmail.com" 
              className="h-8 w-8 rounded-full bg-white dark:bg-[#181A22] border border-[#E8E7EF] dark:border-white/10 text-[#666675] dark:text-[#9292A2] hover:text-[#7467E8] hover:border-[#7467E8]/40 flex items-center justify-center transition-all shadow-xs"
              title="Feedback & Support (maazmohammed112@gmail.com)"
              aria-label="Contact Email"
            >
              <Mail size={15} strokeWidth={2} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
