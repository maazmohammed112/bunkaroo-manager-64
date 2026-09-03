import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { 
  Check, 
  Copy, 
  Share, 
  MoreVertical, 
  PlusSquare, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  Smartphone,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Hardcoded official production URL
const APP_URL = 'https://bunkbuddy.vercel.app/';

// Stylized profile avatar icons (clean vector profiles, no external photos)
const PROFILE_ICONS = [
  { bg: 'bg-[#E8E4FF] dark:bg-[#7467E8]/20', text: 'text-[#7467E8] dark:text-[#A59BFF]' },
  { bg: 'bg-[#DDEDEA] dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300' },
  { bg: 'bg-[#DEE7F6] dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-300' },
  { bg: 'bg-[#F7DDE9] dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-300' },
];

export const AppPreviewSection: React.FC = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [activeModalPlatform, setActiveModalPlatform] = useState<'ios' | 'android' | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [userPlatform, setUserPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');

  // Detect platform & listen for PWA install prompt
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setUserPlatform('ios');
    } else if (/android/i.test(userAgent)) {
      setUserPlatform('android');
    } else {
      setUserPlatform('desktop');
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Generate real dynamic scannable QR code hardcoded to https://bunkbuddy.vercel.app/
  useEffect(() => {
    QRCode.toDataURL(APP_URL, {
      width: 320,
      margin: 1,
      color: {
        dark: '#111218',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(APP_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleAndroidInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    } else {
      setActiveModalPlatform('android');
    }
  };

  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden bg-[#FAFAFC] dark:bg-[#111218] border-t border-[#E8E7EF] dark:border-white/[0.08]">
      {/* Precision blueprint grid pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(116, 103, 232, 0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(116, 103, 232, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px'
        }}
      />

      {/* Radiant ambient gradient backdrop glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[850px] h-[450px] bg-gradient-to-tr from-[#7467E8]/20 via-[#9E7AFF]/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-[#5848DF]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10 space-y-12 sm:space-y-16">
        
        {/* Top Header & Social Proof Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
          
          {/* Left: Eyebrow + Main Title + Subheading */}
          <div className="space-y-4 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/20 border border-[#7467E8]/30 text-[#7467E8] dark:text-[#A59BFF] text-xs font-bold uppercase tracking-wider">
              <span>— Real Native Mobile Experience</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-foreground tracking-tight leading-[1.1]">
              Your Ultimate Academic{' '}
              <span className="relative inline-block text-[#7467E8]">
                Attendance App!
                <svg 
                  className="absolute -bottom-2 left-0 w-full text-[#7467E8]/40 overflow-visible" 
                  height="8" 
                  viewBox="0 0 100 8" 
                  preserveAspectRatio="none"
                >
                  <path d="M0 5 Q 50 8, 100 5" stroke="currentColor" strokeWidth="3" fill="transparent" strokeLinecap="round" />
                </svg>
              </span>
            </h2>

            <p className="text-sm sm:text-base text-[#666675] dark:text-[#9292A2] font-medium leading-relaxed max-w-xl">
              Engineered as an ultra-responsive Progressive Web App (PWA). Experience silky-smooth native performance on both iOS and Android with zero App Store friction, 100% offline persistence, and zero tracking.
            </p>
          </div>

          {/* Right: Active Users Social Proof + Circular Stamp Badge */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-5 sm:gap-7 self-start md:self-end">
            
            {/* 10+ Active Students Profile Icons Stack (Clean vector user icons, no face photos) */}
            <div className="flex items-center gap-3.5 bg-white dark:bg-[#181A22] border border-[#E8E7EF] dark:border-white/10 px-4 py-3 rounded-2xl shadow-sm">
              <div className="flex -space-x-2 overflow-hidden">
                {PROFILE_ICONS.map((profile, i) => (
                  <div
                    key={i}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-white dark:ring-[#181A22] ${profile.bg} ${profile.text} shadow-xs`}
                  >
                    <User size={15} strokeWidth={2.2} />
                  </div>
                ))}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7467E8] text-white text-xs font-bold ring-2 ring-white dark:ring-[#181A22] shadow-xs">
                  +6
                </div>
              </div>
              <div className="text-left">
                <div className="text-base font-black font-display text-foreground tracking-tight flex items-center gap-1.5">
                  10+
                  <span className="text-[11px] font-bold text-[#7467E8] dark:text-[#A59BFF] bg-[#E8E4FF] dark:bg-[#7467E8]/20 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-[#666675] dark:text-[#9292A2]">
                  College Students
                </div>
              </div>
            </div>

            {/* Circular Stamp / Seal Badge */}
            <div className="relative group select-none hidden sm:block">
              <div className="w-24 h-24 rounded-full border border-dashed border-[#7467E8]/40 dark:border-[#7467E8]/50 flex items-center justify-center p-1 bg-white/70 dark:bg-[#181A22]/70 backdrop-blur-md shadow-xs animate-[spin_25s_linear_infinite]">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <path
                    id="circlePath"
                    d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    fill="none"
                  />
                  <text className="text-[9px] uppercase font-bold tracking-[0.24em] fill-[#5848DF] dark:fill-[#A59BFF]">
                    <textPath href="#circlePath" startOffset="0%">
                      • PWA NATIVE • 100% PRIVATE • ZERO ADS •
                    </textPath>
                  </text>
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-9 h-9 rounded-full bg-[#7467E8] text-white flex items-center justify-center shadow-md">
                  <Sparkles size={16} strokeWidth={2.2} />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Center Mockup Stage: The 5-Phone Transparent Image Showcase */}
        <div className="relative mx-auto max-w-5xl">
          
          {/* Subtle Figma-like decorative corner crosshairs */}
          <span className="absolute -top-3 -left-3 text-[#7467E8]/40 font-mono text-base font-light select-none">+</span>
          <span className="absolute -top-3 -right-3 text-[#7467E8]/40 font-mono text-base font-light select-none">+</span>
          <span className="absolute -bottom-3 -left-3 text-[#7467E8]/40 font-mono text-base font-light select-none">+</span>
          <span className="absolute -bottom-3 -right-3 text-[#7467E8]/40 font-mono text-base font-light select-none">+</span>

          {/* Main Phones Graphic Container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="relative flex items-center justify-center py-2 sm:py-6"
          >
            {/* The Transparent 5-Phone Mockup Image provided by user */}
            <div className="relative w-full max-w-4xl mx-auto group">
              <img
                src="/bunkbuddy-preview.png"
                alt="BunkBuddy Native App Interface Preview on Mobile"
                className="w-full h-auto object-contain select-none drop-shadow-[0_24px_48px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)] group-hover:scale-[1.01] transition-transform duration-500"
                draggable={false}
              />

              {/* Desktop Floating Feature Spotlight Badges */}
              <motion.div 
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="hidden md:flex absolute top-12 -left-4 lg:-left-8 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-[#181A22]/95 backdrop-blur-xl border border-[#E8E7EF] dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div className="text-left">
                  <div className="text-xs font-bold font-display text-foreground">100% Offline Engine</div>
                  <div className="text-[10px] text-[#666675] dark:text-[#9292A2] font-semibold">IndexedDB local storage</div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="hidden md:flex absolute top-16 -right-4 lg:-right-8 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-[#181A22]/95 backdrop-blur-xl border border-[#E8E7EF] dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20"
              >
                <div className="w-7 h-7 rounded-xl bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] flex items-center justify-center font-bold text-xs">
                  <Zap size={14} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold font-display text-foreground">1-Tap Quick Logging</div>
                  <div className="text-[10px] text-[#666675] dark:text-[#9292A2] font-semibold">Attended vs Missed status</div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="hidden md:flex absolute bottom-8 left-6 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-[#181A22]/95 backdrop-blur-xl border border-[#E8E7EF] dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                  <ShieldCheck size={14} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold font-display text-foreground">Biometric & PIN Lock</div>
                  <div className="text-[10px] text-[#666675] dark:text-[#9292A2] font-semibold">Total device-level privacy</div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="hidden md:flex absolute bottom-12 right-8 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-[#181A22]/95 backdrop-blur-xl border border-[#E8E7EF] dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20"
              >
                <div className="w-7 h-7 rounded-xl bg-[#DDEDEA] dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                  <CheckCircle2 size={14} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold font-display text-foreground">Exact Bunk Forecast</div>
                  <div className="text-[10px] text-[#666675] dark:text-[#9292A2] font-semibold">Safe skip limits & recovery</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Mobile Spotlight Chips (for screens < 768px) */}
          <div className="grid grid-cols-2 gap-2.5 pt-4 md:hidden">
            <div className="p-3 rounded-2xl bg-white dark:bg-[#181A22] border border-[#E8E7EF] dark:border-white/10 text-left">
              <div className="text-xs font-bold text-foreground">100% Offline</div>
              <div className="text-[10px] text-[#666675] dark:text-[#9292A2]">IndexedDB Engine</div>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-[#181A22] border border-[#E8E7EF] dark:border-white/10 text-left">
              <div className="text-xs font-bold text-foreground">1-Tap Logging</div>
              <div className="text-[10px] text-[#666675] dark:text-[#9292A2]">Zero Latency Log</div>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-[#181A22] border border-[#E8E7EF] dark:border-white/10 text-left">
              <div className="text-xs font-bold text-foreground">PIN & Biometric</div>
              <div className="text-[10px] text-[#666675] dark:text-[#9292A2]">Private & Secure</div>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-[#181A22] border border-[#E8E7EF] dark:border-white/10 text-left">
              <div className="text-xs font-bold text-foreground">Bunk Math</div>
              <div className="text-[10px] text-[#666675] dark:text-[#9292A2]">Exact Limits Math</div>
            </div>
          </div>

        </div>

        {/* Bottom Dark Card: Direct PWA Installation Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[32px] bg-[#0E1017] dark:bg-[#0A0B10] text-white p-7 sm:p-10 lg:p-12 border border-white/[0.12] shadow-2xl overflow-hidden"
        >
          {/* Atmospheric gradient orb inside dark card */}
          <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-[#7467E8]/15 rounded-full blur-[110px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Heading + Description + Live Statistics */}
            <div className="lg:col-span-6 space-y-6 text-left">
              
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-[11px] font-bold text-[#A59BFF] tracking-wider uppercase bg-[#7467E8]/20 px-3 py-1 rounded-full border border-[#7467E8]/30">
                  <span>Direct Mobile Installation</span>
                </div>
                
                <h3 className="text-2xl sm:text-4xl font-display font-black tracking-tight text-white leading-tight">
                  Download <span className="text-[#A59BFF]">BunkBuddy</span> Mobile App Now
                </h3>

                <p className="text-xs sm:text-sm text-[#9292A2] leading-relaxed font-medium">
                  Zero App Store download friction. Add BunkBuddy directly to your smartphone home screen for full offline attendance tracking, biometric protection, and lightning-fast load times.
                </p>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div className="space-y-1">
                  <div className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
                    10+
                  </div>
                  <div className="text-[11px] font-semibold text-[#888B98] leading-tight">
                    Active Students
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xl sm:text-2xl font-display font-black text-[#A59BFF] tracking-tight">
                    100%
                  </div>
                  <div className="text-[11px] font-semibold text-[#888B98] leading-tight">
                    On-Device Private
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xl sm:text-2xl font-display font-black text-emerald-400 tracking-tight">
                    0 MB
                  </div>
                  <div className="text-[11px] font-semibold text-[#888B98] leading-tight">
                    Storage Wasted
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Platform Cards for iOS & Android */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              
              {/* iOS Platform Card */}
              <div className="p-5 rounded-[24px] bg-[#161822] border border-white/10 space-y-4 hover:border-[#7467E8]/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-bold font-display text-white">For iOS</div>
                      <div className="text-[11px] text-[#888B98] font-medium">iOS 15.0+ · Safari</div>
                    </div>
                    {userPlatform === 'ios' && (
                      <span className="text-[10px] font-bold bg-[#7467E8] text-white px-2 py-0.5 rounded-full">
                        Your Device
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => setActiveModalPlatform('ios')}
                    className="w-full bg-[#7467E8] hover:bg-[#6658DF] text-white text-xs font-display font-bold rounded-xl py-2.5 h-auto transition-all shadow-sm group-hover:scale-[1.02]"
                  >
                    Install on iOS
                  </Button>
                </div>

                {/* QR Code and Apple Logo Row */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                  <div className="p-1.5 bg-white rounded-xl shadow-xs">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="Scan QR code for iOS installation"
                        className="w-14 h-14 object-contain rounded-md"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-200 animate-pulse rounded-md" />
                    )}
                  </div>

                  {/* Perfect Official Apple Logo SVG (ViewBox 0 0 24 24) */}
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/90 group-hover:text-white group-hover:bg-[#7467E8]/20 transition-all">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.61 1.34-.55.63-.97 1.66-.84 2.67 1.01.08 2.02-.51 2.52-1.16z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Android Platform Card */}
              <div className="p-5 rounded-[24px] bg-[#161822] border border-white/10 space-y-4 hover:border-[#7467E8]/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-bold font-display text-white">For Android</div>
                      <div className="text-[11px] text-[#888B98] font-medium">Android 8.0+ · Chrome</div>
                    </div>
                    {userPlatform === 'android' && (
                      <span className="text-[10px] font-bold bg-[#7467E8] text-white px-2 py-0.5 rounded-full">
                        Your Device
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={handleAndroidInstallClick}
                    className="w-full bg-[#7467E8] hover:bg-[#6658DF] text-white text-xs font-display font-bold rounded-xl py-2.5 h-auto transition-all shadow-sm group-hover:scale-[1.02]"
                  >
                    Install on Android
                  </Button>
                </div>

                {/* QR Code and Android Logo Row */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                  <div className="p-1.5 bg-white rounded-xl shadow-xs">
                    {qrCodeUrl ? (
                      <img
                        src={qrCodeUrl}
                        alt="Scan QR code for Android installation"
                        className="w-14 h-14 object-contain rounded-md"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-200 animate-pulse rounded-md" />
                    )}
                  </div>

                  {/* Clean Android Robot Logo SVG */}
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/90 group-hover:text-white group-hover:bg-[#7467E8]/20 transition-all">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4114 13.8563 8 12 8s-3.5902.4114-5.1367 1.0504L4.841 5.5474a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </motion.div>

      </div>

      {/* Interactive Platform Installation Guide Modal */}
      <Dialog 
        open={activeModalPlatform !== null} 
        onOpenChange={(open) => !open && setActiveModalPlatform(null)}
      >
        <DialogContent className="max-w-md rounded-[28px] p-6 bg-white dark:bg-[#161822] border border-[#E8E7EF] dark:border-white/10 text-foreground">
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="text-xl font-display font-bold flex items-center gap-2 text-foreground">
              <Smartphone size={20} className="text-[#7467E8]" />
              {activeModalPlatform === 'ios' ? 'Install on iPhone & iPad' : 'Install on Android'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#666675] dark:text-[#9292A2]">
              {activeModalPlatform === 'ios'
                ? 'Follow these 3 quick steps in Safari to add BunkBuddy as a native app on your home screen.'
                : 'Add BunkBuddy to your Android home screen via Chrome with complete offline support.'}
            </DialogDescription>
          </DialogHeader>

          {activeModalPlatform === 'ios' ? (
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#F6F6FA] dark:bg-[#1E202C] border border-[#E8E7EF] dark:border-white/[0.08] flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs space-y-1 text-left">
                  <div className="font-bold text-foreground">Open in Safari</div>
                  <div className="text-[#666675] dark:text-[#9292A2]">
                    Make sure <strong>bunkbuddy.vercel.app</strong> is open in Safari on your iOS device.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F6F6FA] dark:bg-[#1E202C] border border-[#E8E7EF] dark:border-white/[0.08] flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs space-y-1 text-left">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    Tap the Share Button
                    <Share size={13} className="text-[#7467E8]" />
                  </div>
                  <div className="text-[#666675] dark:text-[#9292A2]">
                    Tap the rectangular Share icon located at the bottom toolbar of Safari.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F6F6FA] dark:bg-[#1E202C] border border-[#E8E7EF] dark:border-white/[0.08] flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs space-y-1 text-left">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    Select "Add to Home Screen"
                    <PlusSquare size={13} className="text-[#7467E8]" />
                  </div>
                  <div className="text-[#666675] dark:text-[#9292A2]">
                    Scroll down in the share sheet and tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#F6F6FA] dark:bg-[#1E202C] border border-[#E8E7EF] dark:border-white/[0.08] flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs space-y-1 text-left">
                  <div className="font-bold text-foreground">Open in Google Chrome</div>
                  <div className="text-[#666675] dark:text-[#9292A2]">
                    Ensure you are browsing on Google Chrome or any Chromium Android browser.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F6F6FA] dark:bg-[#1E202C] border border-[#E8E7EF] dark:border-white/[0.08] flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs space-y-1 text-left">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    Tap the Three Dots Menu
                    <MoreVertical size={13} className="text-[#7467E8]" />
                  </div>
                  <div className="text-[#666675] dark:text-[#9292A2]">
                    Tap the vertical 3-dot menu icon in the top right corner of Chrome.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F6F6FA] dark:bg-[#1E202C] border border-[#E8E7EF] dark:border-white/[0.08] flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs space-y-1 text-left">
                  <div className="font-bold text-foreground">Tap "Install App" or "Add to Home Screen"</div>
                  <div className="text-[#666675] dark:text-[#9292A2]">
                    Confirm installation. BunkBuddy will now launch as a dedicated standalone app!
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-[#E8E7EF] dark:border-white/10 flex items-center justify-between gap-3">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7467E8] hover:text-[#5848DF] transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check size={14} className="text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">bunkbuddy.vercel.app Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Web App Link</span>
                </>
              )}
            </button>

            <Button
              onClick={() => setActiveModalPlatform(null)}
              className="bg-[#7467E8] hover:bg-[#6658DF] text-white text-xs font-display font-bold rounded-xl px-4 py-2 h-auto"
            >
              Got It
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
