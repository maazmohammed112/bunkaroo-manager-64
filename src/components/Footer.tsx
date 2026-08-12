import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/60 text-slate-500 text-xs py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <p className="font-medium text-slate-400">
          &copy; {new Date().getFullYear()} BunkBuddy by Mohammed Maaz
        </p>
        <p className="text-[11px] text-slate-500">
          Smart Academic Tracker
        </p>
      </div>
    </footer>
  );
};

export default Footer;
