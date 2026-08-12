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
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-950">
      <Card className="w-full max-w-lg glass-card border-slate-800">
        <CardHeader className="text-center relative">
          <div className="flex justify-end mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={skipAll}
              className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 flex items-center gap-1"
            >
              Skip Setup
              <SkipForward size={14} />
            </Button>
          </div>

          <div className="mx-auto mb-3 flex justify-center">
            <img src="/logo.png" alt="BunkBuddy Logo" className="h-16 w-16 rounded-xl" />
          </div>

          <CardTitle className="text-2xl font-bold text-slate-100">Setup BunkBuddy Profile</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Personalize your workspace (all questions are optional)
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <User size={16} className="text-indigo-400" />
                  Your Name
                </label>
                <Input
                  placeholder="Enter your name (e.g. Alex)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-slate-100"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-400" />
                  Academic USN / Roll Number
                </label>
                <Input
                  placeholder="Enter your USN or student ID"
                  value={usn}
                  onChange={(e) => setUsn(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-slate-100"
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <Building size={16} className="text-indigo-400" />
                  College & Course Details
                </label>
                <Input
                  placeholder="College Name"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-slate-100 mb-3"
                />
                <Input
                  placeholder="Course / Branch (e.g. Computer Science)"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-slate-100"
                />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-indigo-400" />
                  <span className="text-sm font-medium text-slate-200">Enable 4-Digit Security PIN</span>
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
                    className="bg-slate-900 border-slate-700 text-center text-lg tracking-widest text-slate-100"
                  />
                  <Input
                    type="password"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="Confirm 4-Digit PIN"
                    value={confirmPin}
                    onChange={(e) => /^\d*$/.test(e.target.value) && setConfirmPin(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-center text-lg tracking-widest text-slate-100"
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
              className="border-slate-700 text-slate-400 hover:text-slate-200"
            >
              Skip Step
            </Button>

            <Button
              onClick={nextStep}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
            >
              {step < 4 ? 'Next' : 'Complete Setup'}
              <ArrowRight size={16} />
            </Button>
          </div>
        </CardContent>

        <CardFooter className="justify-center border-t border-slate-800/60 pt-4">
          <span className="text-xs text-slate-500 font-medium">Step {step} of 4</span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Welcome;
