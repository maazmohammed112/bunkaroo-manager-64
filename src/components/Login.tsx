import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Lock, LogIn, KeyRound, AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Login: React.FC = () => {
  const { login, userData, resetAllData } = useUser();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) return;

    setIsLoading(true);
    setTimeout(() => {
      const success = login(pin);
      if (success) {
        toast({
          title: "Access Granted",
          description: `Welcome back, ${userData?.name || 'Student'}!`,
        });
      } else {
        toast({
          title: "Access Denied",
          description: "Incorrect PIN. Please try again.",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-950">
      <Card className="w-full max-w-md glass-card border-slate-800">
        <CardHeader className="text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-3"
          >
            <img src="/logo.png" alt="BunkBuddy Logo" className="h-16 w-16 mx-auto rounded-xl shadow-lg" />
          </motion.div>

          <CardTitle className="text-2xl font-bold text-slate-100 flex items-center justify-center gap-2">
            <Lock className="h-5 w-5 text-indigo-400" />
            Unlock BunkBuddy
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 mt-1">
            Enter your 4-digit PIN to access your academic dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) setPin(val);
                }}
                className="text-center text-2xl py-6 tracking-[0.5em] bg-slate-900 border-slate-700 text-slate-100 font-mono"
                autoFocus
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-5 rounded-xl gap-2"
              disabled={pin.length !== 4 || isLoading}
            >
              <LogIn size={18} />
              {isLoading ? 'Verifying PIN...' : 'Unlock Dashboard'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-slate-800/60 pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="link" size="sm" className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1">
                <KeyRound size={14} />
                Forgot PIN? Reset Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-rose-400">
                  <AlertTriangle size={18} />
                  Reset Application Data?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400 text-xs">
                  This action will erase your locally stored subjects, timetable, and notes. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetAllData} className="bg-rose-600 hover:bg-rose-500 text-white">
                  Reset Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
