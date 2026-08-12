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
  Sparkles, 
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="glass-header border-b border-slate-800/80 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="BunkBuddy" className="h-9 w-9 rounded-xl shadow-md shadow-indigo-500/20" />
            <span className="text-xl font-display font-black tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              BunkBuddy
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://maazprofile.tech" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors hidden sm:flex font-medium"
            >
              <Globe size={16} strokeWidth={1.5} className="text-indigo-400" />
              <span>Portfolio</span>
            </a>

            <a 
              href="mailto:maazmohammed112@gmail.com" 
              className="text-xs sm:text-sm text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors hidden sm:flex font-medium"
            >
              <Mail size={16} strokeWidth={1.5} className="text-cyan-400" />
              <span>Feedback</span>
            </a>

            <Button 
              onClick={handleStart}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-display font-bold shadow-lg shadow-indigo-600/30 rounded-xl px-5 transition-all hover:scale-105"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
              <ArrowRight size={16} strokeWidth={1.5} className="ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto max-w-5xl text-center relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles size={14} strokeWidth={1.5} className="text-indigo-400" />
            <span>Smart Academic & Attendance Engine</span>
            <span className="font-handwriting text-base lowercase text-cyan-300 ml-1 font-bold">handcrafted for students</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-7xl font-display font-black text-slate-100 tracking-tight leading-[1.1]"
          >
            Never Guess Your Attendance.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Bunk Smartly.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Calculates exact bunk limits, projects required recovery lectures, manages weekly timetables, tracks study productivity with Pomodoro intervals, and secures notes locally.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button 
              onClick={handleStart}
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-base font-display font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              Launch Dashboard Now
              <ArrowRight size={18} strokeWidth={1.5} className="ml-2" />
            </Button>

            <a 
              href="https://maazprofile.tech" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-900/60 rounded-xl transition-all"
            >
              Developer Profile
              <Globe size={16} strokeWidth={1.5} className="ml-2 text-indigo-400" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights & Advanced Real-Time Insights */}
      <section className="py-20 px-6 bg-slate-950/60 relative border-t border-slate-900">
        <div className="container mx-auto max-w-6xl space-y-16">
          <div className="text-center">
            <h2 className="text-3xl sm:text-5xl font-display font-black text-slate-100 tracking-tight">
              Designed for Effortless Academic Control
            </h2>
            <p className="text-sm text-slate-400 mt-3 font-handwriting text-xl text-indigo-300 font-bold">
              real-time math insights & attendance intelligence at your fingertips
            </p>
          </div>

          {/* Premium Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ y: -8, scale: 1.01 }}
              className="glass-card p-7 border-slate-800/90 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
                <Calculator size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-100 mb-2">Bunk Math Engine</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Calculates maximum safe bunkable classes and exact consecutive recovery lectures required to reach your target percentage.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Math Precision</span>
                <span className="text-indigo-400 font-bold font-mono">100% Exact</span>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8, scale: 1.01 }}
              className="glass-card p-7 border-slate-800/90 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                <CalendarDays size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-100 mb-2">Interactive Timetable</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Organize weekly schedules with 1-click attendance logging (Attended / Missed) and visual status color codes.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Daily Logging</span>
                <span className="text-cyan-400 font-bold font-mono">Instant 1-Click</span>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8, scale: 1.01 }}
              className="glass-card p-7 border-slate-800/90 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-100 mb-2">Visual Analytics</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Explore attendance trends with Bar, Line, Pie, Area, and Radar charts alongside individual subject breakdowns.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Interactive Charts</span>
                <span className="text-emerald-400 font-bold font-mono">5 Custom Views</span>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8, scale: 1.01 }}
              className="glass-card p-7 border-slate-800/90 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/10 transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5 group-hover:scale-110 transition-transform">
                <Timer size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-100 mb-2">Pomodoro Study Timer</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Stay focused with integrated 25-minute study intervals, break reminders, and subject-wise study tracking.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-violet-500/5 border border-violet-500/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Focus Cycles</span>
                <span className="text-violet-400 font-bold font-mono">25m / 5m / 15m</span>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8, scale: 1.01 }}
              className="glass-card p-7 border-slate-800/90 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-100 mb-2">PIN & IndexedDB</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Optional 4-digit security PIN. High-performance offline IndexedDB storage keeps your data strictly private on your device.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Privacy</span>
                <span className="text-amber-400 font-bold font-mono">Local Only</span>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8, scale: 1.01 }}
              className="glass-card p-7 border-slate-800/90 hover:border-rose-500/40 hover:shadow-2xl hover:shadow-rose-500/10 transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-5 group-hover:scale-110 transition-transform">
                <Smartphone size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-100 mb-2">PWA App Support</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Installable as a Progressive Web App on Android, iOS, and Desktop for native app convenience and lightning-fast speed.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Platform</span>
                <span className="text-rose-400 font-bold font-mono">Cross-Platform</span>
              </div>
            </motion.div>
          </div>

          {/* Real-time Insights Preview Showcase */}
          <div className="glass-card p-8 border-indigo-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-slate-800 pb-6">
              <div>
                <span className="text-xs font-handwriting text-cyan-300 text-lg font-bold">real-time intelligence engine</span>
                <h3 className="text-2xl font-display font-extrabold text-slate-100 flex items-center gap-2">
                  <Zap size={22} strokeWidth={1.5} className="text-indigo-400" />
                  Automated In-Built Insights & Risk Alerts
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold font-mono">
                LIVE DEMO PREVIEW
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-display">
                    <CheckCircle2 size={16} strokeWidth={1.5} />
                    Safe Bunk Budget
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-500/10 rounded-md">82% ATTENDANCE</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  "You have 4 safe bunkable lectures in Advanced Physics while remaining comfortably above your 75% target limit."
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between text-rose-400">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-display">
                    <AlertCircle size={16} strokeWidth={1.5} />
                    Critical Recovery Alert
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-rose-500/10 rounded-md">68% ATTENDANCE</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  "Mathematics attendance dropped below 75%. You must attend 5 consecutive lectures to recover into the safe zone."
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between text-indigo-400">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-display">
                    <Brain size={16} strokeWidth={1.5} />
                    Study Focus Metric
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-indigo-500/10 rounded-md">3 POMODOROS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  "You logged 75 minutes of uninterrupted focus time today. Great momentum before your upcoming lab assessments!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-6 bg-slate-950">
        <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-sans">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="BunkBuddy Logo" className="h-6 w-6 rounded-md" />
            <span>BunkBuddy by Mohammed Maaz. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a 
              href="https://maazprofile.tech" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 transition-colors font-medium"
            >
              <Globe size={14} strokeWidth={1.5} />
              maazprofile.tech
            </a>

            <a 
              href="mailto:maazmohammed112@gmail.com" 
              className="hover:text-white flex items-center gap-1 transition-colors font-medium"
            >
              <Mail size={14} strokeWidth={1.5} />
              maazmohammed112@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
