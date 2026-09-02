import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent border-t border-[#E8E7EF] dark:border-white/10 text-[#666675] dark:text-[#9292A2] text-xs py-4 transition-colors">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <p className="font-semibold text-foreground/80">
          &copy; {new Date().getFullYear()} BunkBuddy by Mohammed Maaz
        </p>
        <p className="text-[11px] text-[#666675] dark:text-[#9292A2] font-medium">
          Smart Academic Tracker
        </p>
      </div>
    </footer>
  );
};

export default Footer;
