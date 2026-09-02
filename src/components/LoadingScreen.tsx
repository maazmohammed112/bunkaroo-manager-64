import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground transition-colors">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center"
      >
        <div className="w-20 h-20 mb-6 rounded-2xl bg-[#111218] p-2.5 flex items-center justify-center shadow-lg border border-black/10 dark:border-white/10">
          <img 
            src="/logo.png" 
            alt="BunkBuddy Logo" 
            className="w-full h-full object-contain" 
          />
        </div>
        
        <Loader2 size={32} className="animate-spin text-[#7467E8] mb-4" strokeWidth={2.5} />
        
        <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
          BunkBuddy
        </h1>

        <p className="text-xs text-[#666675] dark:text-[#9292A2] mt-2 font-medium">
          Initializing IndexedDB storage engine...
        </p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
