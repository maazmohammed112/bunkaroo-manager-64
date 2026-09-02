import React, { useEffect, useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, ShieldCheck, Download } from 'lucide-react';
import { db } from '@/utils/storageDB';

interface Subject {
  id: string;
  name: string;
  totalClasses: number;
  attendedClasses: number;
  requiredAttendance: number;
}

interface NotificationItem {
  id: string;
  type: 'critical' | 'bunkable' | 'info' | 'security';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const subjects = db.getSync<Subject[]>('subjects', []);
    const items: NotificationItem[] = [];
    const now = new Date().toISOString();

    // Welcome & Help notification from BunkBuddy by Discuss
    items.push({
      id: 'welcome-tour-notice',
      type: 'security',
      title: 'BunkBuddy by Discuss',
      message: "Welcome to your semester workspace. Need help or want to replay the interface walkthrough? Find me here anytime in notifications or in Profile settings.",
      date: now,
      read: false,
    });

    // PWA Install Notice in Notification Bar (permanent home after header)
    items.push({
      id: 'install-pwa-notice',
      type: 'security',
      title: 'Install BunkBuddy App',
      message: 'Add BunkBuddy to your home screen or desktop for 100% offline access and a fullscreen app experience.',
      date: now,
      read: false
    });

    // Witty user privacy & responsibility notification requested by user
    items.push({
      id: 'privacy-notice',
      type: 'security',
      title: 'Local Privacy & Responsibility',
      message: "All your data is safely stored in local IndexedDB on your device. You are 100% responsible for your attendance – BunkBuddy isn't watching you!",
      date: now,
      read: false
    });

    subjects.forEach((subj) => {
      if (subj.totalClasses > 0) {
        const pct = (subj.attendedClasses / subj.totalClasses) * 100;
        const req = subj.requiredAttendance || 75;

        if (pct < req) {
          items.push({
            id: `critical-${subj.id}`,
            type: 'critical',
            title: 'Critical Attendance Alert',
            message: `${subj.name} attendance is ${pct.toFixed(1)}% (below target ${req}%).`,
            date: now,
            read: false
          });
        } else if (pct >= req + 10) {
          items.push({
            id: `bunkable-${subj.id}`,
            type: 'bunkable',
            title: 'Safe Bunk Zone',
            message: `${subj.name} attendance is high (${pct.toFixed(1)}%). You have safe bunk margin.`,
            date: now,
            read: false
          });
        }
      }
    });

    setNotifications(items);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  return (
    <div className="p-3 space-y-3 text-foreground font-sans">
      {notifications.length === 0 ? (
        <div className="text-center py-8 text-[#9292A2] text-xs">
          <Bell strokeWidth={1.8} className="h-8 w-8 mx-auto mb-2 opacity-40 text-[#7467E8]" />
          No new notifications
        </div>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              className={`p-3.5 rounded-[18px] border text-xs cursor-pointer transition-all active:scale-[0.99] ${
                item.type === 'critical'
                  ? 'border-rose-500/20 bg-[#F7DDE9]/70 dark:bg-rose-500/15 text-rose-950 dark:text-rose-200'
                  : item.type === 'bunkable'
                  ? 'border-emerald-500/20 bg-[#DDEDEA]/70 dark:bg-emerald-500/15 text-emerald-950 dark:text-emerald-200'
                  : item.type === 'security'
                  ? 'border-[#7467E8]/20 bg-[#E8E4FF]/70 dark:bg-[#7467E8]/15 text-[#372b9a] dark:text-[#C4BCFF]'
                  : 'border-[#E8E7EF] dark:border-white/10 bg-[#F1F0F8]/80 dark:bg-[#20222C] text-foreground'
              }`}
            >
              <div className="flex items-start gap-3">
                {item.type === 'critical' && <AlertTriangle strokeWidth={2} className="h-4 w-4 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />}
                {item.type === 'bunkable' && <CheckCircle strokeWidth={2} className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />}
                {item.type === 'security' && <ShieldCheck strokeWidth={2} className="h-4 w-4 text-[#7467E8] dark:text-[#A59BFF] mt-0.5 flex-shrink-0" />}
                {item.type === 'info' && <Info strokeWidth={2} className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />}
                <div className="space-y-0.5 w-full">
                  <h4 className="font-bold text-xs font-display">{item.title}</h4>
                  <p className="text-[11px] opacity-80 leading-relaxed">{item.message}</p>
                  {item.id === 'welcome-tour-notice' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.dispatchEvent(new CustomEvent('start-bunkbuddy-tour'));
                      }}
                      className="mt-2.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold text-white bg-[#7467E8] hover:bg-[#6658DF] shadow-xs transition-transform active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                    >
                      Start App Tutorial
                    </button>
                  )}

                  {item.id === 'install-pwa-notice' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.dispatchEvent(new CustomEvent('open-pwa-install-modal'));
                      }}
                      className="mt-2.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold text-white bg-[#7467E8] hover:bg-[#6658DF] shadow-xs transition-transform active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Download size={11} strokeWidth={2.5} />
                      Install BunkBuddy App
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
