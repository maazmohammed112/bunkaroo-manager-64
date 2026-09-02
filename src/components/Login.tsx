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
    <div className="flex items-center justify-center min-h-screen p-4 bg-background text-foreground transition-colors">
      <Card className="w-full max-w-md glass-card p-4 sm:p-6 rounded-[28px]">
        <CardHeader className="text-center">
          <motion.div 
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-3"
          >
            <div className="h-16 w-16 mx-auto rounded-2xl bg-[#111218] p-2 flex items-center justify-center shadow-sm border border-black/10 dark:border-white/10">
              <img 
                src="/logo.png" 
                alt="BunkBuddy Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
          </motion.div>

          <CardTitle className="text-2xl font-bold text-foreground font-display flex items-center justify-center gap-2">
            <span className="h-7 w-7 rounded-full bg-[#E8E4FF] dark:bg-[#7467E8]/20 text-[#7467E8] flex items-center justify-center">
              <Lock className="h-4 w-4" strokeWidth={2.5} />
            </span>
            Unlock BunkBuddy
          </CardTitle>
          <CardDescription className="text-xs text-[#666675] dark:text-[#9292A2] mt-1">
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
                placeholder="••••"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) setPin(val);
                }}
                className="text-center text-2xl py-6 tracking-[0.5em] font-mono rounded-[18px]"
                autoFocus
              />
            </div>

            <Button 
              type="submit" 
              size="lg"
              className="w-full font-bold py-6 rounded-[18px] gap-2 text-sm sm:text-base"
              disabled={pin.length !== 4 || isLoading}
            >
              <LogIn size={18} strokeWidth={2} />
              {isLoading ? 'Verifying PIN...' : 'Unlock Dashboard'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-[#E8E7EF] dark:border-white/[0.08] pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="link" size="sm" className="text-xs text-[#666675] dark:text-[#9292A2] hover:text-foreground flex items-center gap-1">
                <KeyRound size={14} />
                Forgot PIN? Reset Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[28px] border-[#E8E7EF] dark:border-white/10 bg-white dark:bg-[#181A22] text-foreground p-6 sm:p-7 shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-display">
                  <AlertTriangle size={18} />
                  Reset Application Data?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[#666675] dark:text-[#9292A2] text-xs leading-relaxed">
                  This action will erase your locally stored subjects, timetable, and notes. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2 sm:gap-0 pt-2">
                <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetAllData} className="bg-rose-600 hover:bg-rose-700 text-white rounded-full">
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
