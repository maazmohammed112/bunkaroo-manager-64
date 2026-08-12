import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddSubjectForm from '@/components/AddSubjectForm';
import Timetable from '@/components/Timetable';
import Statistics from '@/components/Statistics';
import Notes from '@/components/Notes';
import PomodoroTimer from '@/components/PomodoroTimer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, PlusCircle, PieChart, StickyNote, WifiOff, Timer } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import Welcome from '@/components/Welcome';
import Login from '@/components/Login';
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
    { value: 'timetable', icon: CalendarDays, label: 'Timetable' },
    { value: 'add', icon: PlusCircle, label: 'Add Subject' },
    { value: 'statistics', icon: PieChart, label: 'Bunk Math & Stats' },
    { value: 'pomodoro', icon: Timer, label: 'Pomodoro' },
    { value: 'notes', icon: StickyNote, label: 'Notes' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 md:pb-6">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        {isOffline && (
          <div className="mb-4 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl flex items-center gap-2 text-xs">
            <WifiOff size={14} />
            <span>Offline Mode: All attendance and notes are saved locally in IndexedDB.</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          {/* Desktop & Tablet Navigation */}
          <TabsList className="hidden md:grid grid-cols-5 w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-1.5 rounded-2xl">
            {tabsConfig.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  activeTab === tab.value
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
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

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 px-2 py-2">
        <div className="flex justify-around items-center">
          {tabsConfig.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition-all ${
                activeTab === tab.value
                  ? 'text-indigo-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.value ? 'text-indigo-400 scale-110' : ''} />
              <span>{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;