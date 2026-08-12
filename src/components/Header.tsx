import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, X, LayoutTemplate } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Profile from '@/components/Profile';
import Notifications from '@/components/Notifications';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { userData } = useUser();
  const [activePopover, setActivePopover] = useState<string | null>(null);

  return (
    <header className="glass-header text-slate-100 py-3.5 px-4 sm:px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="BunkBuddy Logo" className="h-8 w-8 rounded-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform" />
          <div>
            <h1 className="text-xl font-display font-black tracking-tight bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              BunkBuddy
            </h1>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Smart Academic & Attendance Manager
            </p>
          </div>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick link to Landing Page */}
          <Link
            to="/landing"
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-all"
            title="View Landing Page"
          >
            <LayoutTemplate size={15} strokeWidth={1.5} className="text-indigo-400" />
            <span className="hidden sm:inline">Landing Page</span>
          </Link>

          {/* Notifications Popover */}
          <Popover 
            open={activePopover === 'notifications'} 
            onOpenChange={(open) => setActivePopover(open ? 'notifications' : null)}
          >
            <PopoverTrigger asChild>
              <button 
                className="text-slate-300 hover:text-white p-2.5 rounded-xl hover:bg-slate-800/60 relative transition-all"
                title="Notifications"
              >
                <Bell size={18} strokeWidth={1.5} />
                <span className="notification-badge"></span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 p-0 bg-slate-900 border-slate-800 rounded-2xl shadow-2xl z-[100] text-slate-100">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-sm flex items-center gap-2 text-slate-200 font-display">
                  <Bell size={16} strokeWidth={1.5} className="text-indigo-400" />
                  Notifications & Insights
                </h3>
                <button 
                  onClick={() => setActivePopover(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto p-2">
                <Notifications />
              </div>
            </PopoverContent>
          </Popover>

          {/* Profile Drawer */}
          <Popover 
            open={activePopover === 'profile'} 
            onOpenChange={(open) => setActivePopover(open ? 'profile' : null)}
          >
            <PopoverTrigger asChild>
              <button 
                className="bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 p-2.5 rounded-xl transition-all flex items-center gap-2"
                title="Profile Settings"
              >
                <User size={18} strokeWidth={1.5} />
                <span className="text-xs font-semibold hidden md:inline">{userData?.name || 'Profile'}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 p-0 bg-slate-900 border-slate-800 rounded-2xl shadow-2xl z-[100] text-slate-100">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-sm flex items-center gap-2 text-slate-200 font-display">
                  <User size={16} strokeWidth={1.5} className="text-indigo-400" />
                  Student Profile & Settings
                </h3>
                <button 
                  onClick={() => setActivePopover(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              <div className="max-h-[75vh] overflow-y-auto p-2">
                <Profile />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};

export default Header;
