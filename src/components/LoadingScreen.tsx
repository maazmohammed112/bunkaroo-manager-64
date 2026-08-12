import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center"
      >
        <img 
          src="/logo.png" 
          alt="BunkBuddy Logo" 
          className="w-20 h-20 mb-6 rounded-2xl shadow-xl shadow-indigo-500/20" 
        />
        
        <Loader2 size={32} className="animate-spin text-indigo-400 mb-4" />
        
        <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          BunkBuddy
        </h1>

        <p className="text-xs text-slate-400 mt-2 font-medium">
          Initializing IndexedDB storage engine...
        </p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
