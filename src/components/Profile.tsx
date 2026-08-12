import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useUser } from '@/contexts/UserContext';
import { User, School, Building, LogOut, Lock, ShieldCheck, Mail, Globe, Edit2 } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Switch } from "@/components/ui/switch";
import { toast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Profile: React.FC = () => {
  const { userData, logout, calculateOverallAttendance, changePin, togglePinProtection, updateUserData } = useUser();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [editName, setEditName] = useState(userData?.name || '');
  const [editUsn, setEditUsn] = useState(userData?.usn || '');
  const [editCollege, setEditCollege] = useState(userData?.collegeName || '');
  const [editCourse, setEditCourse] = useState(userData?.course || '');

  if (!userData) return null;
  const overallAttendance = calculateOverallAttendance();

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return '#10b981';
    if (percentage >= 65) return '#f59e0b';
    return '#f43f5e';
  };

  const handleSaveProfile = () => {
    updateUserData({
      name: editName,
      usn: editUsn,
      collegeName: editCollege,
      course: editCourse
    });
    setIsEditingProfile(false);
    toast({
      title: "Profile Updated",
      description: "Your academic profile details have been saved.",
    });
  };

  const handlePinChange = () => {
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
    } catch (error) {
      setPinError(error instanceof Error ? error.message : 'Failed to change PIN');
    }
  };

  return (
    <div className="p-3 space-y-4 text-slate-100 font-sans">
      {/* Attendance & User Card */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-20 h-20 flex-shrink-0">
          <CircularProgressbar
            value={overallAttendance}
            text={`${overallAttendance}%`}
            styles={buildStyles({
              textSize: '18px',
              pathColor: getAttendanceColor(overallAttendance),
              textColor: getAttendanceColor(overallAttendance),
              trailColor: 'rgba(255,255,255,0.08)',
            })}
          />
        </div>

        <div className="flex-1 space-y-1 text-center sm:text-left w-full">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-indigo-400 font-semibold">{userData.course || 'Student Profile'}</p>
              <h4 className="font-bold text-base text-slate-100 font-display">{userData.name || 'Not Specified'}</h4>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7 px-2 border-slate-700 text-slate-300 hover:bg-slate-800 gap-1"
              onClick={() => setIsEditingProfile(true)}
            >
              <Edit2 size={12} strokeWidth={1.5} />
              Edit
            </Button>
          </div>

          <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
            <School size={12} strokeWidth={1.5} className="text-slate-500" />
            {userData.usn || 'No USN'}
          </p>

          <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
            <Building size={12} strokeWidth={1.5} className="text-slate-500" />
            {userData.collegeName || 'No College Specified'}
          </p>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Student Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs">Full Name</Label>
              <Input 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                className="bg-slate-950 border-slate-700" 
              />
            </div>
            <div>
              <Label className="text-xs">USN / Roll Number</Label>
              <Input 
                value={editUsn} 
                onChange={(e) => setEditUsn(e.target.value)} 
                className="bg-slate-950 border-slate-700" 
              />
            </div>
            <div>
              <Label className="text-xs">College Name</Label>
              <Input 
                value={editCollege} 
                onChange={(e) => setEditCollege(e.target.value)} 
                className="bg-slate-950 border-slate-700" 
              />
            </div>
            <div>
              <Label className="text-xs">Course / Stream</Label>
              <Input 
                value={editCourse} 
                onChange={(e) => setEditCourse(e.target.value)} 
                className="bg-slate-950 border-slate-700" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingProfile(false)} className="border-slate-700">Cancel</Button>
            <Button onClick={handleSaveProfile} className="bg-indigo-600">Save Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Security Settings Section */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">Security Settings</h4>

        <div className="flex items-center justify-between py-1">
          <span className="text-xs font-medium text-slate-200 flex items-center gap-2">
            <ShieldCheck size={14} strokeWidth={1.5} className="text-emerald-400" />
            4-Digit PIN Security
          </span>
          <Switch 
            checked={userData.isPinEnabled} 
            onCheckedChange={(checked) => togglePinProtection(checked, '1234')}
          />
        </div>

        {/* Change PIN Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full text-xs border-slate-700 hover:bg-slate-800 justify-center">
              <Lock size={14} strokeWidth={1.5} className="mr-1.5" />
              Change PIN Code
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
            <DialogHeader>
              <DialogTitle className="font-display">Update Security PIN</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              {userData.isPinEnabled && (
                <div>
                  <Label className="text-xs">Current PIN</Label>
                  <Input 
                    type="password" 
                    maxLength={4} 
                    value={currentPin} 
                    onChange={(e) => setCurrentPin(e.target.value)} 
                    className="bg-slate-950 border-slate-700" 
                  />
                </div>
              )}
              <div>
                <Label className="text-xs">New 4-Digit PIN</Label>
                <Input 
                  type="password" 
                  maxLength={4} 
                  value={newPin} 
                  onChange={(e) => setNewPin(e.target.value)} 
                  className="bg-slate-950 border-slate-700" 
                />
              </div>
              <div>
                <Label className="text-xs">Confirm New PIN</Label>
                <Input 
                  type="password" 
                  maxLength={4} 
                  value={confirmPin} 
                  onChange={(e) => setConfirmPin(e.target.value)} 
                  className="bg-slate-950 border-slate-700" 
                />
              </div>
              {pinError && <p className="text-xs text-rose-400">{pinError}</p>}
            </div>
            <DialogFooter>
              <Button onClick={handlePinChange} className="bg-indigo-600">Update PIN</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Developer Support & Feedback */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">Developer Support</h4>

        <a 
          href="https://maazprofile.tech" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-slate-300 hover:text-indigo-400 py-1 transition-colors font-medium"
        >
          <Globe size={14} strokeWidth={1.5} className="text-indigo-400" />
          Developer Portfolio (maazprofile.tech)
        </a>

        <a 
          href="mailto:maazmohammed112@gmail.com" 
          className="flex items-center gap-2 text-xs text-slate-300 hover:text-cyan-400 py-1 transition-colors font-medium"
        >
          <Mail size={14} strokeWidth={1.5} className="text-cyan-400" />
          Feedback: maazmohammed112@gmail.com
        </a>
      </div>

      {/* Logout */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={logout} 
        className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10 justify-center text-xs"
      >
        <LogOut size={14} strokeWidth={1.5} className="mr-1.5" />
        Log Out Session
      </Button>
    </div>
  );
};

export default Profile;
