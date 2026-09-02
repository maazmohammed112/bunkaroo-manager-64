import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Subject',
  description = 'Do you really want to delete this subject? This action cannot be undone and will remove its attendance records.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 select-none">
          {/* Liquid Frosted Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Liquid Glass Confirmation Card (Zero Icons, Zero Emojis) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            className="relative z-10 w-full max-w-sm rounded-[28px] p-6 sm:p-7 bg-white/90 dark:bg-[#161824]/90 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_24px_50px_rgba(116,103,232,0.16),0_8px_24px_rgba(0,0,0,0.06),inset_0_1.5px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_28px_60px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.18)] text-foreground space-y-4"
          >
            {/* Confirmation Header */}
            <div className="space-y-2 text-center sm:text-left">
              <h3 
                id="confirm-dialog-title" 
                className="text-base sm:text-lg font-bold font-display tracking-tight text-foreground"
              >
                {title}
              </h3>
              <p 
                id="confirm-dialog-description" 
                className="text-xs sm:text-sm text-[#666675] dark:text-[#9292A2] font-medium leading-relaxed"
              >
                {description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#666675] dark:text-[#B9BBC7] hover:text-foreground bg-[#F1F0F8]/80 dark:bg-white/5 hover:bg-[#E8E7EF] dark:hover:bg-white/10 transition-colors cursor-pointer outline-none focus:outline-none"
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-bold text-white transition-all cursor-pointer outline-none focus:outline-none active:scale-95 ${
                  isDestructive
                    ? 'bg-rose-500 hover:bg-rose-600 dark:bg-rose-500 dark:hover:bg-rose-600 shadow-[0_4px_16px_rgba(244,63,94,0.35)]'
                    : 'bg-[#7467E8] hover:bg-[#6658DF] shadow-[0_4px_16px_rgba(116,103,232,0.35)]'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default ConfirmDialog;
