import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';
import { BookOpen, User, Building, Lock, ArrowRight, SkipForward, ShieldCheck } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { useNavigate } from 'react-router-dom';

const Welcome: React.FC = () => {
  const { completeOnboarding } = useUser();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [course, setCourse] = useState('');
  const [enablePin, setEnablePin] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const nextStep = () => {
    if (step === 4 && enablePin) {
      if (pin.length !== 4 || !/^\d+$/.test(pin)) {
        toast({
          title: "Invalid PIN",
          description: "PIN must be 4 digits",
          variant: "destructive"
        });
        return;
      }
      if (pin !== confirmPin) {
        toast({
          title: "PIN Mismatch",
          description: "Confirmation PIN does not match",
          variant: "destructive"
        });
        return;
      }
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      finishSetup();
    }
  };

  const skipCurrentStep = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      finishSetup();
    }
  };

  const skipAll = () => {
    finishSetup();
  };

  const finishSetup = () => {
    completeOnboarding({
      name: name.trim() || 'Student',
      usn: usn.trim(),
      collegeName: collegeName.trim(),
      course: course.trim(),
      pin: enablePin ? pin : '',
      isPinEnabled: enablePin
    });

    toast({
      title: "Welcome to BunkBuddy",
      description: "Setup complete! Jump into tracking your attendance.",
    });

    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background text-foreground transition-colors">
      <Card className="w-full max-w-lg glass-card p-4 sm:p-6 rounded-[28px]">
        <CardHeader className="text-center relative">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-[#7467E8] bg-[#E8E4FF] dark:bg-[#7467E8]/20 px-3 py-1 rounded-full">
              Step {step} of 4
            </span>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={skipAll}
              className="text-xs text-[#666675] dark:text-[#9292A2] hover:text-foreground flex items-center gap-1 rounded-full"
            >
              Skip Setup
              <SkipForward size={13} />
            </Button>
          </div>

          <div className="mx-auto mb-3 flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-[#111218] p-2 flex items-center justify-center shadow-sm border border-black/10 dark:border-white/10">
              <img 
                src="/logo.png" 
                alt="BunkBuddy Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold font-display text-foreground">
            Setup BunkBuddy Profile
          </CardTitle>
          <CardDescription className="text-xs text-[#666675] dark:text-[#9292A2] mt-1">
            Personalize your workspace (all questions are optional)
          </CardDescription>

          {/* Stepper Dots */}
          <div className="flex justify-center gap-1.5 pt-2">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 bg-[#7467E8]' : s < step ? 'w-2 bg-[#7467E8]/50' : 'w-2 bg-[#E8E7EF] dark:bg-white/10'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2] flex items-center gap-2">
                  <User size={15} className="text-[#7467E8]" />
                  Your Full Name
                </label>
                <Input
                  placeholder="Enter your name (e.g. Alex Smith)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2] flex items-center gap-2">
                  <BookOpen size={15} className="text-[#7467E8]" />
                  Academic USN / Roll Number
                </label>
                <Input
                  placeholder="e.g. 1MS21CS001"
                  value={usn}
                  onChange={(e) => setUsn(e.target.value)}
                  autoFocus
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#666675] dark:text-[#9292A2] flex items-center gap-2">
                  <Building size={15} className="text-[#7467E8]" />
                  College & Course Details
                </label>
                <Input
                  placeholder="College / University Name"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="mb-3"
                  autoFocus
                />
                <Input
                  placeholder="Course / Branch (e.g. Computer Science Engineering)"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#F1F0F8]/70 dark:bg-[#20222C]/70 rounded-[18px] border border-[#E8E7EF] dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] flex items-center justify-center">
                    <Lock size={15} strokeWidth={2} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Enable 4-Digit Security PIN</span>
                    <span className="text-[11px] text-[#666675] dark:text-[#9292A2]">Protect academic dashboard from others</span>
                  </div>
                </div>
                <Switch checked={enablePin} onCheckedChange={setEnablePin} />
              </div>

              {enablePin && (
                <div className="space-y-3 pt-2">
                  <Input
                    type="password"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="Create 4-Digit PIN"
                    value={pin}
                    onChange={(e) => /^\d*$/.test(e.target.value) && setPin(e.target.value)}
                    className="text-center text-lg tracking-widest font-mono"
                    autoFocus
                  />
                  <Input
                    type="password"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="Confirm 4-Digit PIN"
                    value={confirmPin}
                    onChange={(e) => /^\d*$/.test(e.target.value) && setConfirmPin(e.target.value)}
                    className="text-center text-lg tracking-widest font-mono"
                  />
                </div>
              )}
            </motion.div>
          )}

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={skipCurrentStep}
              className="rounded-full text-xs"
            >
              Skip Step
            </Button>

            <Button
              onClick={nextStep}
              className="rounded-full font-bold gap-2 px-6"
            >
              {step < 4 ? 'Next' : 'Complete Setup'}
              <ArrowRight size={15} strokeWidth={2.5} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Welcome;
