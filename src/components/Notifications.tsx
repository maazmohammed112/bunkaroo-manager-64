import React, { useEffect, useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, ShieldCheck } from 'lucide-react';
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
    <div className="p-3 space-y-3 text-slate-100 font-sans">
      {notifications.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs">
          <Bell strokeWidth={1.5} className="h-8 w-8 mx-auto mb-2 opacity-50" />
          No new notifications
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                item.type === 'critical'
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
                  : item.type === 'bunkable'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : item.type === 'security'
                  ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-200'
                  : 'border-slate-800 bg-slate-950/60 text-slate-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {item.type === 'critical' && <AlertTriangle strokeWidth={1.5} className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />}
                {item.type === 'bunkable' && <CheckCircle strokeWidth={1.5} className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />}
                {item.type === 'security' && <ShieldCheck strokeWidth={1.5} className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />}
                {item.type === 'info' && <Info strokeWidth={1.5} className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />}
                <div>
                  <h4 className="font-bold text-xs font-display">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.message}</p>
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
