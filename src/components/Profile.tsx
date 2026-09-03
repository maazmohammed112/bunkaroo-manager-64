import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useUser } from '@/contexts/UserContext';
import { 
  User, 
  School, 
  Building, 
  LogOut, 
  Lock, 
  ShieldCheck, 
  Mail, 
  Globe, 
  Pencil, 
  ChevronRight, 
  ChevronDown, 
  ArrowLeft, 
  X, 
  Upload, 
  Trash2, 
  PieChart, 
  GraduationCap, 
  Check, 
  ExternalLink,
  Sun,
  Moon,
  Palette,
  Compass,
  DownloadCloud,
  UploadCloud,
  FileJson
} from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Switch } from "@/components/ui/switch";
import { toast } from '@/hooks/use-toast';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/utils/storageDB';

interface ProfileProps {
  onClose?: () => void;
}

type SectionKey = 'editProfile' | 'appearance' | 'security' | 'stats' | 'backup' | 'developer' | 'logout' | 'photo' | null;

const Profile: React.FC<ProfileProps> = ({ onClose }) => {
  const { 
    userData, 
    logout, 
    calculateOverallAttendance, 
    changePin, 
    togglePinProtection, 
    updateUserData,
    theme,
    setTheme
  } = useUser();
  const navigate = useNavigate();

  // Active accordion section
  const [activeSection, setActiveSection] = useState<SectionKey>(null);

  // Edit details state
  const [editName, setEditName] = useState(userData?.name || '');
  const [editUsn, setEditUsn] = useState(userData?.usn || '');
  const [editCollege, setEditCollege] = useState(userData?.collegeName || '');
  const [editCourse, setEditCourse] = useState(userData?.course || '');

  // PIN state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  // File input ref for avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backup state & refs
  const [profileImportText, setProfileImportText] = useState('');
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileExport = () => {
    const backup = {
      app: 'BunkBuddy',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      subjects: db.getSync('subjects', []),
      notes: db.getSync('notes', []),
      userData: db.getSync('userData', null),
      timetable_settings: db.getSync('timetable_settings', null),
      attendance_daily_logs: db.getSync('attendance_daily_logs', {})
    };
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bunkbuddy-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Backup Downloaded",
      description: "Your academic backup JSON file has been downloaded safely."
    });
  };

  const handleProfileImport = (dataString: string) => {
    if (!dataString.trim()) {
      toast({
        title: "Empty Backup",
        description: "Please provide a valid backup JSON string or choose a file.",
        variant: "destructive"
      });
      return;
    }
    try {
      const parsed = JSON.parse(dataString);
      let count = 0;
      if (Array.isArray(parsed)) {
        db.set('subjects', parsed);
        count = parsed.length;
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.subjects)) {
          db.set('subjects', parsed.subjects);
          count = parsed.subjects.length;
        }
        if (Array.isArray(parsed.notes)) db.set('notes', parsed.notes);
        if (parsed.userData) db.set('userData', parsed.userData);
        if (parsed.timetable_settings) {
          db.set('timetable_settings', parsed.timetable_settings);
          db.set('bunkbuddy_mode_selected', true);
          window.dispatchEvent(new CustomEvent('timetable-settings-updated', { detail: parsed.timetable_settings }));
        }
        if (parsed.attendance_daily_logs) db.set('attendance_daily_logs', parsed.attendance_daily_logs);
      }
      toast({
        title: "Backup Restored Successfully",
        description: `Restored ${count} subjects and your attendance logs.`
      });
      setProfileImportText('');
      setActiveSection(null);
      setTimeout(() => window.location.reload(), 700);
    } catch (err) {
      toast({
        title: "Invalid Backup Format",
        description: "Failed to parse JSON backup. Please check the file formatting.",
        variant: "destructive"
      });
    }
  };

  const handleBackupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleProfileImport(content);
      }
    };
    reader.readAsText(file);
    if (backupFileInputRef.current) {
      backupFileInputRef.current.value = '';
    }
  };

  if (!userData) return null;

  const overallAttendance = calculateOverallAttendance();

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return '#10b981';
    if (percentage >= 65) return '#f59e0b';
    return '#f43f5e';
  };

  const toggleSection = (section: SectionKey) => {
    setActiveSection(prev => prev === section ? null : section);
    setPinError('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserData({
      name: editName.trim(),
      usn: editUsn.trim(),
      collegeName: editCollege.trim(),
      course: editCourse.trim()
    });
    setActiveSection(null);
    toast({
      title: "Profile Updated",
      description: "Your academic details have been successfully updated.",
    });
  };

  const handlePinChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (userData.isPinEnabled && !currentPin) {
      setPinError('Current PIN is required');
      return;
    }
    if (newPin.length < 4) {
      setPinError('New PIN must be at least 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }

    try {
      changePin(currentPin, newPin);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setActiveSection(null);
    } catch (error) {
      setPinError(error instanceof Error ? error.message : 'Failed to change PIN');
    }
  };

  // Profile Image Handler with client-side canvas downsampling for optimal local storage
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please choose an image file (PNG, JPG, WebP).",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          updateUserData({ profileImage: compressedDataUrl });
          toast({
            title: "Profile Photo Saved",
            description: "Your profile photo is stored safely in local storage.",
          });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    updateUserData({ profileImage: '' });
    toast({
      title: "Photo Removed",
      description: "Profile photo has been reset to default.",
    });
  };

  const handleLogoutConfirm = () => {
    logout();
    if (onClose) onClose();
    toast({
      title: "Logged Out",
      description: "You have been logged out of your session.",
    });
    navigate('/');
  };

  // Fallback initial
  const userInitial = userData.name ? userData.name.trim().charAt(0).toUpperCase() : 'S';

  return (
    <div className="flex flex-col h-full bg-background text-foreground font-sans select-none overflow-y-auto custom-scrollbar">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 border-b border-[#E8E7EF] dark:border-white/10 bg-white/80 dark:bg-[#181A22]/80 backdrop-blur-md">
        <button
          onClick={onClose}
          className="h-9 w-9 rounded-full bg-[#F1F0F8] dark:bg-[#20222C] text-[#666675] dark:text-[#B9BBC7] hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
          title="Go Back"
          aria-label="Back"
        >
          <ArrowLeft size={17} strokeWidth={2} />
        </button>

        <h2 className="text-base font-bold text-foreground font-display tracking-tight">
          Profile Settings
        </h2>

        {onClose ? (
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-[#F1F0F8] dark:bg-[#20222C] text-[#666675] dark:text-[#B9BBC7] hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            title="Close Profile"
            aria-label="Close"
          >
            <X size={17} strokeWidth={2} />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>

      <div className="p-5 space-y-6 flex-1 pb-10">
        {/* Profile Avatar Section */}
        <div className="flex flex-col items-center text-center pt-5 sm:pt-7 pb-2">
          <div className="relative group">
            {/* Avatar Circle */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white dark:border-[#282B37] bg-white dark:bg-[#181A22] shadow-xl flex items-center justify-center ring-4 ring-[#7467E8]/20">
              {userData.profileImage ? (
                <img
                  src={userData.profileImage}
                  alt={userData.name || 'User Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7467E8] to-[#5848DF] text-white font-display font-bold text-3xl sm:text-4xl">
                  {userInitial}
                </div>
              )}
            </div>

            {/* Circular Purple Edit Pencil Badge */}
            <button
              onClick={() => toggleSection('photo')}
              type="button"
              className="absolute bottom-0 right-0 bg-[#7467E8] hover:bg-[#6658DF] text-white p-2 rounded-full shadow-md shadow-[#7467E8]/30 border-2 border-white dark:border-[#181A22] transition-transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
              title="Change Profile Photo"
              aria-label="Change Profile Photo"
            >
              <Pencil size={14} strokeWidth={2.5} className="text-white" />
            </button>
          </div>

          {/* User Name & Info */}
          <div className="mt-3.5 space-y-1">
            <h3 className="text-xl font-bold font-display text-foreground tracking-tight">
              {userData.name || 'Student'}
            </h3>
            <p className="text-xs text-[#666675] dark:text-[#9292A2] font-medium">
              {userData.usn ? userData.usn : 'No USN'}
              {userData.collegeName ? ` • ${userData.collegeName}` : ''}
            </p>
            {userData.course && (
              <p className="text-[11px] text-[#7467E8] dark:text-[#A59BFF] font-medium">
                {userData.course}
              </p>
            )}
          </div>

          {/* Purple Pill "Edit Profile" Button */}
          <div className="mt-4 w-full max-w-[220px]">
            <button
              onClick={() => toggleSection('editProfile')}
              className="w-full py-2.5 px-6 rounded-full bg-[#7467E8] hover:bg-[#6658DF] text-white font-semibold text-xs sm:text-sm tracking-tight shadow-md shadow-[#7467E8]/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              {activeSection === 'editProfile' ? 'Close Editor' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Hidden File Input for Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Inline Photo Upload & Privacy Card */}
        <AnimatePresence>
          {activeSection === 'photo' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-[22px] bg-white dark:bg-[#181A22] border border-[#E8E7EF] dark:border-white/10 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground font-display tracking-wide uppercase">
                    Profile Photo
                  </span>
                  <button
                    onClick={() => setActiveSection(null)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="p-3 bg-[#F1F0F8]/80 dark:bg-[#20222C]/80 border border-[#E8E7EF] dark:border-white/10 rounded-[14px] text-[11px] text-[#666675] dark:text-[#B9BBC7] leading-relaxed font-sans">
                  This image will be stored in your local storage. BunkBuddy does not store or watch your data, messages, or text.
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 font-semibold text-xs h-9 rounded-[14px] gap-1.5 cursor-pointer"
                  >
                    <Upload size={14} strokeWidth={2} />
                    {userData.profileImage ? 'Change Image' : 'Upload Image'}
                  </Button>

                  {userData.profileImage && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleRemovePhoto}
                      className="border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs h-9 rounded-[14px] gap-1 cursor-pointer"
                    >
                      <Trash2 size={14} />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu Items List */}
        <div className="space-y-3.5">
          {/* Item 1: Personal & Academic Details (Edit Profile) */}
          <div className="rounded-[22px] border border-[#E8E7EF] dark:border-white/10 bg-white dark:bg-[#181A22] overflow-hidden transition-all shadow-xs hover:border-[#7467E8]/40">
            <button
              type="button"
              onClick={() => toggleSection('editProfile')}
              className="w-full flex items-center justify-between p-4 text-left cursor-pointer transition-colors outline-none focus:outline-none select-none hover:bg-black/[0.015] dark:hover:bg-white/[0.015]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E8E4FF] text-[#7467E8] dark:bg-[#7467E8]/20 dark:text-[#A59BFF] flex items-center justify-center flex-shrink-0">
                  <User size={18} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground font-display">
                    Personal & Academic Info
                  </h4>
                  <p className="text-[11px] text-[#666675] dark:text-[#9292A2]">
                    {userData.name || 'Set details'} • {userData.usn || 'No USN'}
                  </p>
                </div>
              </div>
              <div className="text-muted-foreground pl-2">
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${
                    activeSection === 'editProfile' ? 'rotate-180 text-[#7467E8]' : ''
                  }`}
                />
              </div>
            </button>

            {/* Inline Edit Form */}
            <AnimatePresence>
              {activeSection === 'editProfile' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-[#E8E7EF] dark:border-white/[0.08] bg-[#F8F8FC] dark:bg-[#15161F] p-5 sm:p-6"
                >
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <Label className="text-xs text-[#666675] dark:text-[#9292A2] font-semibold mb-1.5 block">Full Name</Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter full name"
                        className="text-xs h-10"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-[#666675] dark:text-[#9292A2] font-semibold mb-1.5 block">USN / Roll Number</Label>
                      <Input
                        value={editUsn}
                        onChange={(e) => setEditUsn(e.target.value)}
                        placeholder="e.g. 1MS21CS001"
                        className="text-xs h-10"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-[#666675] dark:text-[#9292A2] font-semibold mb-1.5 block">College Name</Label>
                      <Input
                        value={editCollege}
                        onChange={(e) => setEditCollege(e.target.value)}
                        placeholder="e.g. Ramaiah Institute of Technology"
                        className="text-xs h-10"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-[#666675] dark:text-[#9292A2] font-semibold mb-1.5 block">Course / Stream</Label>
                      <Input
                        value={editCourse}
                        onChange={(e) => setEditCourse(e.target.value)}
                        placeholder="e.g. Computer Science Engineering"
                        className="text-xs h-10"
                      />
                    </div>

                    <div className="flex justify-end gap-2.5 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveSection(null)}
                        className="text-xs h-9 cursor-pointer rounded-full"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="text-xs h-9 cursor-pointer font-bold rounded-full px-5"
                      >
                        Save Details
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Item 2: Appearance & Theme Settings (Light / Dark Mode) */}
          <div className="rounded-[22px] border border-[#E8E7EF] dark:border-white/10 bg-white dark:bg-[#181A22] overflow-hidden transition-all shadow-xs hover:border-[#7467E8]/40">
            <button
              type="button"
              onClick={() => toggleSection('appearance')}
              className="w-full flex items-center justify-between p-4 text-left cursor-pointer transition-colors outline-none focus:outline-none select-none hover:bg-black/[0.015] dark:hover:bg-white/[0.015]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E8E4FF] text-[#7467E8] dark:bg-[#7467E8]/20 dark:text-[#A59BFF] flex items-center justify-center flex-shrink-0">
                  <Palette size={18} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground font-display">
                    Appearance & Theme
                  </h4>
                  <p className="text-[11px] text-[#666675] dark:text-[#9292A2]">
                    {theme === 'light' ? 'Light Theme (Default)' : 'Dark Theme'}
                  </p>
                </div>
              </div>
              <div className="text-muted-foreground pl-2">
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${
                    activeSection === 'appearance' ? 'rotate-180 text-[#7467E8]' : ''
                  }`}
                />
              </div>
            </button>

            {/* Inline Appearance Selector */}
            <AnimatePresence>
              {activeSection === 'appearance' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-[#E8E7EF] dark:border-white/[0.08] bg-[#F8F8FC] dark:bg-[#15161F] p-5 sm:p-6 space-y-4"
                >
                  <p className="text-xs text-[#666675] dark:text-[#9292A2] font-medium leading-relaxed">
                    Choose your interface theme. Preferences are saved automatically to your device.
                  </p>

                  <div className="grid grid-cols-2 gap-3.5">
                    {/* Light Mode Option Card */}
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`p-4 rounded-[20px] border text-left cursor-pointer transition-all select-none outline-none focus:outline-none w-full ${
                        theme === 'light'
                          ? 'border-[#7467E8] bg-[#E8E4FF]/60 dark:bg-[#7467E8]/20 text-[#7467E8] dark:text-[#A59BFF] ring-2 ring-[#7467E8]/30 shadow-xs'
                          : 'border-[#E8E7EF] dark:border-white/10 bg-white dark:bg-[#181A22] text-foreground hover:border-[#7467E8]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                          <Sun size={17} strokeWidth={2.5} />
                        </div>
                        {theme === 'light' && (
                          <span className="h-5 w-5 rounded-full bg-[#7467E8] text-white flex items-center justify-center">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-xs text-foreground">Light Mode</h5>
                      <p className="text-[10px] text-[#666675] dark:text-[#9292A2] mt-0.5">Clean lilac & soft white (Default)</p>
                    </button>

                    {/* Dark Mode Option Card */}
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`p-4 rounded-[20px] border text-left cursor-pointer transition-all select-none outline-none focus:outline-none w-full ${
                        theme === 'dark'
                          ? 'border-[#7467E8] bg-[#E8E4FF]/60 dark:bg-[#7467E8]/20 text-[#7467E8] dark:text-[#A59BFF] ring-2 ring-[#7467E8]/30 shadow-xs'
                          : 'border-[#E8E7EF] dark:border-white/10 bg-white dark:bg-[#181A22] text-foreground hover:border-[#7467E8]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="h-9 w-9 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/30 text-[#7467E8] dark:text-[#A59BFF] flex items-center justify-center">
                          <Moon size={17} strokeWidth={2.5} />
                        </div>
                        {theme === 'dark' && (
                          <span className="h-5 w-5 rounded-full bg-[#7467E8] text-white flex items-center justify-center">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-xs text-foreground">Dark Mode</h5>
                      <p className="text-[10px] text-[#666675] dark:text-[#9292A2] mt-0.5">Deep violet & slate surfaces</p>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Item 3: Security & PIN Settings */}
          <div className="rounded-[22px] border border-[#E8E7EF] dark:border-white/10 bg-white dark:bg-[#181A22] overflow-hidden transition-all shadow-xs hover:border-[#7467E8]/40">
            <button
              type="button"
              onClick={() => toggleSection('security')}
              className="w-full flex items-center justify-between p-4 text-left cursor-pointer transition-colors outline-none focus:outline-none select-none hover:bg-black/[0.015] dark:hover:bg-white/[0.015]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#DDEDEA] text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={18} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground font-display">
                    Security & PIN Protection
                  </h4>
                  <p className="text-[11px] text-[#666675] dark:text-[#9292A2]">
                    {userData.isPinEnabled ? 'PIN Security Enabled' : 'PIN Security Disabled'}
                  </p>
                </div>
              </div>
              <div className="text-muted-foreground pl-2">
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${
                    activeSection === 'security' ? 'rotate-180 text-emerald-500' : ''
                  }`}
                />
              </div>
            </button>

            {/* Inline Security & PIN Form */}
            <AnimatePresence>
              {activeSection === 'security' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-[#E8E7EF] dark:border-white/[0.08] bg-[#F8F8FC] dark:bg-[#15161F] p-5 sm:p-6 space-y-4"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-[#E8E7EF] dark:border-white/[0.08]">
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        Require 4-Digit PIN to open app
                      </span>
                      <span className="text-[11px] text-[#666675] dark:text-[#9292A2]">
                        Locks dashboard upon app launch
                      </span>
                    </div>
                    <Switch
                      checked={userData.isPinEnabled}
                      onCheckedChange={(checked) => togglePinProtection(checked, '1234')}
                    />
                  </div>

                  <form onSubmit={handlePinChange} className="space-y-3.5 pt-1">
                    <p className="text-[11px] font-bold text-[#666675] dark:text-[#9292A2] uppercase tracking-wider font-display">
                      Change PIN Code
                    </p>

                    {userData.isPinEnabled && (
                      <div>
                        <Label className="text-xs text-[#666675] dark:text-[#9292A2] font-semibold mb-1.5 block">Current PIN</Label>
                        <Input
                          type="password"
                          maxLength={4}
                          value={currentPin}
                          onChange={(e) => setCurrentPin(e.target.value)}
                          placeholder="••••"
                          className="text-xs h-10 tracking-widest font-mono"
                        />
                      </div>
                    )}

                    <div>
                      <Label className="text-xs text-[#666675] dark:text-[#9292A2] font-semibold mb-1.5 block">New 4-Digit PIN</Label>
                      <Input
                        type="password"
                        maxLength={4}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="••••"
                        className="text-xs h-10 tracking-widest font-mono"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-[#666675] dark:text-[#9292A2] font-semibold mb-1.5 block">Confirm New PIN</Label>
                      <Input
                        type="password"
                        maxLength={4}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        placeholder="••••"
                        className="text-xs h-10 tracking-widest font-mono"
                      />
                    </div>

                    {pinError && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-[14px]">
                        {pinError}
                      </p>
                    )}

                    <div className="flex justify-end gap-2.5 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveSection(null)}
                        className="text-xs h-9 cursor-pointer rounded-full"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        className="text-xs h-9 cursor-pointer font-bold rounded-full px-5"
                      >
                        Update PIN
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Item 4: Attendance & Academic Stats */}
          <div className="rounded-[22px] border border-[#E8E7EF] dark:border-white/10 bg-white dark:bg-[#181A22] overflow-hidden transition-all shadow-xs hover:border-[#7467E8]/40">
            <button
              type="button"
              onClick={() => toggleSection('stats')}
              className="w-full flex items-center justify-between p-4 text-left cursor-pointer transition-colors outline-none focus:outline-none select-none hover:bg-black/[0.015] dark:hover:bg-white/[0.015]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#DEE7F6] text-blue-600 dark:bg-blue-500/20 dark:text-blue-300 flex items-center justify-center flex-shrink-0">
                  <PieChart size={18} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground font-display">
                    Attendance Overview
                  </h4>
                  <p className="text-[11px] text-[#666675] dark:text-[#9292A2]">
                    Current overall: {overallAttendance}%
                  </p>
                </div>
              </div>
              <div className="text-muted-foreground pl-2">
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${
                    activeSection === 'stats' ? 'rotate-180 text-blue-500' : ''
                  }`}
                />
              </div>
            </button>

            {/* Inline Stats Overview */}
            <AnimatePresence>
              {activeSection === 'stats' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-[#E8E7EF] dark:border-white/[0.08] bg-[#F8F8FC] dark:bg-[#15161F] p-5 sm:p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 flex-shrink-0">
                      <CircularProgressbar
                        value={overallAttendance}
                        text={`${overallAttendance}%`}
                        styles={buildStyles({
                          textSize: '20px',
                          pathColor: overallAttendance >= 75 ? '#10B981' : overallAttendance >= 65 ? '#F59E0B' : '#F43F5E',
                          textColor: 'var(--foreground)',
                          trailColor: '#E8E7EF',
                        })}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-foreground font-display">
                        Overall Academic Attendance
                      </p>
                      <p className="text-xs text-[#666675] dark:text-[#9292A2] leading-relaxed font-medium">
                        {overallAttendance >= 75 ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                            Attendance is in safe zone (≥75%). You are in good standing.
                          </span>
                        ) : overallAttendance >= 65 ? (
                          <span className="text-amber-700 dark:text-amber-400 font-semibold">
                            Attendance is close to threshold. Avoid unnecessary bunks.
                          </span>
                        ) : (
                          <span className="text-rose-700 dark:text-rose-400 font-semibold">
                            Attendance is below required criteria. Attend next classes!
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Item: Cross-Device Backup & Restore */}
          <div className="rounded-[22px] border border-[#E8E7EF] dark:border-white/10 bg-white dark:bg-[#181A22] overflow-hidden transition-all shadow-xs hover:border-[#7467E8]/40">
            <button
              type="button"
              onClick={() => toggleSection('backup')}
              className="w-full flex items-center justify-between p-4 text-left cursor-pointer transition-colors outline-none focus:outline-none select-none hover:bg-black/[0.015] dark:hover:bg-white/[0.015]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E8E4FF] text-[#7467E8] dark:bg-[#7467E8]/20 dark:text-[#A59BFF] flex items-center justify-center flex-shrink-0">
                  <DownloadCloud size={18} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground font-display">
                    Cross-Device Backup & Restore
                  </h4>
                  <p className="text-[11px] text-[#666675] dark:text-[#9292A2]">
                    Export JSON backup or transfer to another device
                  </p>
                </div>
              </div>
              <div className="text-muted-foreground pl-2">
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${
                    activeSection === 'backup' ? 'rotate-180 text-[#7467E8]' : ''
                  }`}
                />
              </div>
            </button>

            {/* Inline Backup Section */}
            <AnimatePresence>
              {activeSection === 'backup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-[#E8E7EF] dark:border-white/[0.08] bg-[#F8F8FC] dark:bg-[#15161F] p-5 sm:p-6 space-y-4"
                >
                  <div className="p-3.5 rounded-[18px] bg-white dark:bg-[#181A22] border border-[#E8E7EF] dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Export Backup</span>
                      <Button
                        size="sm"
                        onClick={handleProfileExport}
                        className="rounded-full text-xs font-bold bg-[#7467E8] hover:bg-[#6658DF] text-white gap-1.5 h-8 px-3.5 cursor-pointer"
                      >
                        <DownloadCloud size={13} strokeWidth={2.2} />
                        Download JSON
                      </Button>
                    </div>
                    <p className="text-[11px] text-[#666675] dark:text-[#9292A2] leading-relaxed">
                      Download a single JSON file containing all your subjects, attendance logs, notes, and profile data.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-[18px] bg-white dark:bg-[#181A22] border border-[#E8E7EF] dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Restore From Backup</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => backupFileInputRef.current?.click()}
                        className="rounded-full text-xs font-semibold gap-1.5 h-8 px-3 cursor-pointer"
                      >
                        <UploadCloud size={13} strokeWidth={2.2} />
                        Upload File
                      </Button>
                    </div>
                    <input
                      ref={backupFileInputRef}
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={handleBackupFileSelect}
                    />

                    <div className="space-y-2">
                      <textarea
                        value={profileImportText}
                        onChange={(e) => setProfileImportText(e.target.value)}
                        placeholder="Or paste backup JSON code here..."
                        rows={2}
                        className="w-full text-xs p-2.5 rounded-xl border border-[#E8E7EF] dark:border-white/10 bg-[#F6F6FA] dark:bg-[#111218] text-foreground focus:outline-none focus:ring-1 focus:ring-[#7467E8] font-mono resize-none"
                      />
                      {profileImportText.trim() && (
                        <Button
                          size="sm"
                          onClick={() => handleProfileImport(profileImportText)}
                          className="w-full rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer h-8"
                        >
                          Restore Pasted Backup
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Item 5: Developer Support & Feedback */}
          <div className="rounded-[22px] border border-[#E8E7EF] dark:border-white/10 bg-white dark:bg-[#181A22] overflow-hidden transition-all shadow-xs hover:border-[#7467E8]/40">
            <button
              type="button"
              onClick={() => toggleSection('developer')}
              className="w-full flex items-center justify-between p-4 text-left cursor-pointer transition-colors outline-none focus:outline-none select-none hover:bg-black/[0.015] dark:hover:bg-white/[0.015]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E8E4FF] text-[#7467E8] dark:bg-[#7467E8]/20 dark:text-[#A59BFF] flex items-center justify-center flex-shrink-0">
                  <Globe size={18} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground font-display">
                    Developer Support
                  </h4>
                  <p className="text-[11px] text-[#666675] dark:text-[#9292A2]">
                    Portfolio & Direct Feedback
                  </p>
                </div>
              </div>
              <div className="text-muted-foreground pl-2">
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${
                    activeSection === 'developer' ? 'rotate-180 text-[#7467E8]' : ''
                  }`}
                />
              </div>
            </button>

            {/* Inline Developer Links */}
            <AnimatePresence>
              {activeSection === 'developer' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-[#E8E7EF] dark:border-white/[0.08] bg-[#F8F8FC] dark:bg-[#15161F] p-5 sm:p-6 space-y-3"
                >
                  <a
                    href="https://maazprofile.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-[16px] bg-white dark:bg-[#181A22] border border-[#E8E7EF] dark:border-white/10 text-xs text-foreground hover:text-[#7467E8] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Globe size={15} className="text-[#7467E8]" />
                      Developer Portfolio (maazprofile.tech)
                    </span>
                    <ExternalLink size={13} className="text-muted-foreground" />
                  </a>

                  <a
                    href="mailto:maazmohammed112@gmail.com"
                    className="flex items-center justify-between p-3.5 rounded-[16px] bg-white dark:bg-[#181A22] border border-[#E8E7EF] dark:border-white/10 text-xs text-foreground hover:text-[#7467E8] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Mail size={15} className="text-[#7467E8]" />
                      Feedback: maazmohammed112@gmail.com
                    </span>
                    <ExternalLink size={13} className="text-muted-foreground" />
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Item 6: View App Tutorial & Walkthrough */}
          <div className="rounded-[22px] border border-[#E8E7EF] dark:border-white/10 bg-white dark:bg-[#181A22] overflow-hidden transition-all shadow-xs hover:border-[#7467E8]/40">
            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
                window.dispatchEvent(new CustomEvent('start-bunkbuddy-tour'));
              }}
              className="w-full flex items-center justify-between p-4 text-left cursor-pointer transition-colors outline-none focus:outline-none select-none hover:bg-black/[0.015] dark:hover:bg-white/[0.015]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E8E4FF] text-[#7467E8] dark:bg-[#7467E8]/20 dark:text-[#A59BFF] flex items-center justify-center flex-shrink-0">
                  <Compass size={18} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground font-display">
                    View App Tutorial
                  </h4>
                  <p className="text-[11px] text-[#666675] dark:text-[#9292A2]">
                    Replay interface walkthrough & guide
                  </p>
                </div>
              </div>
              <div className="text-[#7467E8] pr-1">
                <ChevronRight size={18} />
              </div>
            </button>
          </div>

          {/* Item 7: Logout Session */}
          <div className="rounded-[22px] border border-rose-500/20 bg-white dark:bg-[#181A22] overflow-hidden transition-all shadow-xs hover:border-rose-500/30">
            <button
              type="button"
              onClick={() => toggleSection('logout')}
              className="w-full flex items-center justify-between p-4 text-left cursor-pointer transition-colors outline-none focus:outline-none select-none hover:bg-rose-500/[0.03]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                  <LogOut size={18} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 font-display">
                    Log Out Session
                  </h4>
                  <p className="text-[11px] text-[#666675] dark:text-[#9292A2]">
                    Exit current device session
                  </p>
                </div>
              </div>
              <div className="text-muted-foreground pl-2">
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${
                    activeSection === 'logout' ? 'rotate-180 text-rose-500' : ''
                  }`}
                />
              </div>
            </button>

            {/* Inline Logout Confirmation */}
            <AnimatePresence>
              {activeSection === 'logout' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-rose-500/20 bg-[#F8F8FC] dark:bg-[#15161F] p-5 sm:p-6 space-y-4"
                >
                  <h5 className="text-sm font-bold text-foreground font-display">
                    Confirm Session Logout
                  </h5>
                  <div className="text-xs text-[#666675] dark:text-[#B9BBC7] leading-relaxed space-y-2 font-sans">
                    <p>
                      Your data will remain safely stored on this device in local storage.
                    </p>
                    <p className="text-[#9292A2]">
                      Please remember to export your data backup periodically for safety, as all records are kept on your device.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveSection(null)}
                      className="text-xs h-9 cursor-pointer rounded-full"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={handleLogoutConfirm}
                      className="text-xs h-9 cursor-pointer font-bold rounded-full px-5"
                    >
                      Log Out
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Brand & City Signature below Logout */}
        <div className="pt-8 pb-4 text-center select-none space-y-0.5">
          <p className="text-sm font-bold font-display tracking-tight text-foreground/80">
            BunkBuddy
          </p>
          <p className="text-xl font-handwriting text-[#7467E8] dark:text-[#A59BFF] -rotate-1 tracking-wide font-semibold">
            Bangalore
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
