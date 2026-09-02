import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddSubjectForm from '@/components/AddSubjectForm';
import Timetable from '@/components/Timetable';
import Statistics from '@/components/Statistics';
import Notes from '@/components/Notes';
import PomodoroTimer from '@/components/PomodoroTimer';
import Header from '@/components/Header';
import LoadingScreen from '@/components/LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, PlusCircle, PieChart, StickyNote, WifiOff, Timer } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import Welcome from '@/components/Welcome';
import Login from '@/components/Login';
import OnboardingTour from '@/components/OnboardingTour';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import { db } from '@/utils/storageDB';
import { useNavigate } from 'react-router-dom';

const Index: React.FC = () => {
  const { userData, isLoggedIn, isOffline } = useUser();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timetable');
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    const savedTab = db.getSync<string>('active_tab', 'timetable');
    if (savedTab) {
      setActiveTab(savedTab);
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('switch-tab', handleSwitchTab as EventListener);
    return () => window.removeEventListener('switch-tab', handleSwitchTab as EventListener);
  }, []);

  useEffect(() => {
    db.set('active_tab', activeTab);
  }, [activeTab]);

  if (loading) {
    return <LoadingScreen />;
  }

  // If first time or not onboarded, show Welcome screen
  if (!userData || (!userData.isOnboarded && userData.isFirstTime)) {
    return <Welcome />;
  }

  // If PIN protection enabled and not logged in, show Login PIN screen
  if (userData.isPinEnabled && !isLoggedIn) {
    return <Login />;
  }

  const tabsConfig = [
    { value: 'timetable', icon: CalendarDays, label: 'Timetable', shortLabel: 'Timetable' },
    { value: 'add', icon: PlusCircle, label: 'Add Subject', shortLabel: 'Add' },
    { value: 'statistics', icon: PieChart, label: 'Bunk Math & Stats', shortLabel: 'Bunk Math' },
    { value: 'pomodoro', icon: Timer, label: 'Pomodoro', shortLabel: 'Focus' },
    { value: 'notes', icon: StickyNote, label: 'Notes', shortLabel: 'Notes' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pb-28 lg:pb-10 transition-colors duration-200">
      <Header onSelectTab={setActiveTab} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl pb-24 lg:pb-8">
        {isOffline && (
          <div className="mb-5 px-4 py-3 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-[20px] flex items-center gap-2.5 text-xs font-medium shadow-sm">
            <WifiOff size={15} className="flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Offline Mode: All attendance and notes are saved locally in IndexedDB.</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          {/* Desktop Segmented Navigation Bar */}
          <TabsList className="hidden lg:grid grid-cols-5 w-full h-auto p-1.5 liquid-glass-nav rounded-[24px] items-center gap-1.5 border-none">
            {tabsConfig.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  data-tour={tab.value}
                  className={`flex items-center justify-center gap-2 h-11 px-4 rounded-[16px] font-semibold text-xs transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#7467E8] text-white shadow-[0_4px_16px_rgba(116,103,232,0.35)]'
                      : 'text-[#666675] dark:text-[#9093A4] hover:text-[#15151C] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <tab.icon size={16} strokeWidth={isActive ? 2 : 1.75} />
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <TabsContent value="timetable" className="m-0 outline-none">
                <Timetable />
              </TabsContent>

              <TabsContent value="add" className="m-0 outline-none">
                <AddSubjectForm />
              </TabsContent>

              <TabsContent value="statistics" className="m-0 outline-none">
                <Statistics />
              </TabsContent>

              <TabsContent value="pomodoro" className="m-0 outline-none">
                <PomodoroTimer />
              </TabsContent>

              <TabsContent value="notes" className="m-0 outline-none">
                <Notes />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>

      {/* Floating Capsule Bottom Navigation (Mobile & Tablet) - Liquid Glass Reference Style */}
      <div className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md sm:max-w-lg pointer-events-none">
        <nav 
          aria-label="Mobile & Tablet Navigation"
          className="pointer-events-auto liquid-glass-nav p-1.5 sm:p-2 rounded-full flex items-center justify-between gap-1 transition-all duration-300"
        >
          {tabsConfig.map((tab) => {
            const isActive = activeTab === tab.value;
            const Icon = tab.icon;

            return (
              <motion.button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                data-tour={tab.value}
                layout
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
                className={`relative flex items-center justify-center gap-1.5 rounded-full transition-all cursor-pointer outline-none select-none ${
                  isActive
                    ? 'bg-[#7467E8] text-white shadow-[0_4px_16px_rgba(116,103,232,0.45)] px-4 sm:px-5 py-2.5'
                    : 'text-[#666675] dark:text-[#9093A4] hover:text-[#15151C] dark:hover:text-white p-2.5 sm:p-3 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95'
                }`}
                title={tab.label}
              >
                <Icon size={18} strokeWidth={isActive ? 2.25 : 1.75} className="flex-shrink-0" />
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, width: 0, scale: 0.85 }}
                    animate={{ opacity: 1, width: "auto", scale: 1 }}
                    exit={{ opacity: 0, width: 0, scale: 0.85 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden whitespace-nowrap text-xs font-bold tracking-tight font-display pr-0.5"
                  >
                    {tab.shortLabel}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Onboarding Tour Spotlight & Welcome Card */}
      <OnboardingTour />
    </div>
  );
};

export default Index;