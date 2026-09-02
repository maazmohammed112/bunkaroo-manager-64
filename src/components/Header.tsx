import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, X, Download, Smartphone } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Profile from '@/components/Profile';
import Notifications from '@/components/Notifications';
import { db } from '@/utils/storageDB';

interface HeaderProps {
  onSelectTab?: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSelectTab }) => {
  const { userData } = useUser();
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    } else {
      setIsInstallModalOpen(true);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSelectTab) {
      onSelectTab('timetable');
    }
    db.set('active_tab', 'timetable');
    window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'timetable' }));
  };

  return (
    <header className="glass-header text-foreground py-3 sm:py-4 px-4 sm:px-6">
      <div className="container mx-auto flex justify-between items-center max-w-7xl">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-3 group text-left outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#7467E8] rounded-2xl"
          title="Switch to Timetable"
        >
          <div className="h-10 w-10 rounded-2xl bg-[#111218] p-1.5 flex items-center justify-center shadow-sm border border-black/10 dark:border-white/10 group-hover:scale-105 transition-transform flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="BunkBuddy Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-foreground">
              BunkBuddy
            </h1>
            <p className="text-[11px] text-[#666675] dark:text-[#9292A2] font-medium hidden sm:block">
              Smart Academic & Attendance Manager
            </p>
          </div>
        </button>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* PWA Install Button */}
          <button 
            onClick={handleInstallClick}
            data-tour="pwa-install"
            className="h-10 px-3 sm:px-3.5 rounded-full bg-white dark:bg-[#181A22] border border-[#E8E7EF] dark:border-white/10 text-[#666675] dark:text-[#B9BBC7] hover:text-[#7467E8] hover:border-[#7467E8]/30 flex items-center gap-1.5 transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer text-xs font-semibold select-none"
            title="Install BunkBuddy as App"
            aria-label="Install BunkBuddy as App"
          >
            <Download size={14} strokeWidth={2.2} className="text-[#7467E8]" />
            <span className="hidden md:inline">Install App</span>
          </button>

          {/* Notifications Popover */}
          <Popover 
            open={activePopover === 'notifications'} 
            onOpenChange={(open) => setActivePopover(open ? 'notifications' : null)}
          >
            <PopoverTrigger asChild>
              <button 
                className="h-10 w-10 rounded-full bg-white dark:bg-[#181A22] border border-[#E8E7EF] dark:border-white/10 text-[#666675] dark:text-[#B9BBC7] hover:text-[#15151C] dark:hover:text-white flex items-center justify-center relative transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell size={18} strokeWidth={1.75} />
                <span className="notification-badge"></span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 p-0 bg-white dark:bg-[#181A22] border border-[#E8E7EF] dark:border-white/10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-[100] text-foreground overflow-hidden">
              <div className="p-4 border-b border-[#E8E7EF] dark:border-white/[0.08] flex justify-between items-center bg-[#F6F6FA]/60 dark:bg-[#15161F]">
                <h3 className="font-bold text-xs sm:text-sm flex items-center gap-2 text-foreground font-display">
                  <span className="h-6 w-6 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] flex items-center justify-center">
                    <Bell size={13} strokeWidth={2} />
                  </span>
                  Notifications & Insights
                </h3>
                <button 
                  onClick={() => setActivePopover(null)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <X size={15} strokeWidth={2} />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto p-2">
                <Notifications />
              </div>
            </PopoverContent>
          </Popover>

          {/* Profile Trigger Button */}
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="h-10 px-3 sm:px-3.5 rounded-full bg-white dark:bg-[#181A22] border border-[#E8E7EF] dark:border-white/10 text-foreground hover:bg-[#F1F0F8] dark:hover:bg-[#20222C] transition-all flex items-center gap-2 shadow-sm hover:shadow active:scale-95 cursor-pointer"
            title="Profile Settings"
            aria-label="Open Profile"
          >
            {userData?.profileImage ? (
              <img 
                src={userData.profileImage} 
                alt={userData.name || 'Profile'} 
                className="w-6 h-6 rounded-full object-cover ring-2 ring-[#7467E8]/30" 
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] flex items-center justify-center">
                <User size={14} strokeWidth={2} />
              </div>
            )}
            <span className="text-xs font-semibold text-foreground hidden sm:inline">{userData?.name || 'Profile'}</span>
          </button>

          {/* Profile Slide-Over Sheet */}
          <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <SheetContent 
              side="right" 
              className="w-full sm:max-w-md p-0 border-l border-[#E8E7EF] dark:border-white/10 bg-[#F6F6FA] dark:bg-[#111218] text-foreground shadow-2xl z-[100] [&>button]:hidden focus:outline-none"
            >
              <Profile onClose={() => setIsProfileOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* PWA Install Guide Dialog */}
      <Dialog open={isInstallModalOpen} onOpenChange={setIsInstallModalOpen}>
        <DialogContent className="max-w-md rounded-[28px]">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Smartphone size={18} className="text-[#7467E8]" />
              Install BunkBuddy
            </DialogTitle>
            <DialogDescription className="text-xs text-[#666675] dark:text-[#9292A2]">
              Use BunkBuddy offline like a native app on your phone or laptop with instant access.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#F6F6FA] dark:bg-[#15161F] border border-[#E8E7EF] dark:border-white/[0.08] space-y-1">
              <span className="font-bold text-foreground">Chrome / Edge (Desktop & Android):</span>
              <p className="text-[#666675] dark:text-[#9292A2] leading-relaxed">
                Click the three dots (⋮) at the top right of your browser, then click <strong>"Install BunkBuddy"</strong> or <strong>"Add to Home Screen"</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F6F6FA] dark:bg-[#15161F] border border-[#E8E7EF] dark:border-white/[0.08] space-y-1">
              <span className="font-bold text-foreground">Safari (iPhone & iPad):</span>
              <p className="text-[#666675] dark:text-[#9292A2] leading-relaxed">
                Tap the <strong>Share</strong> button at the bottom of the screen, scroll down, and tap <strong>"Add to Home Screen"</strong>.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
