import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  icon,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  isDangerous = false
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden border border-stone-100">
              {/* Header */}
              <div className={`px-8 py-6 ${isDangerous ? 'bg-gradient-to-r from-red-50 to-orange-50' : 'bg-gradient-to-r from-stone-50 to-stone-100'}`}>
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    isDangerous ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'
                  }`}>
                    {icon || <AlertCircle size={24} />}
                  </div>
                  <div className="flex-1">
                    <h2 className={`text-lg font-black uppercase tracking-tight ${
                      isDangerous ? 'text-red-900' : 'text-stone-900'
                    }`}>
                      {title}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-6">
                <p className="text-sm font-medium text-stone-600 leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="px-8 py-6 bg-stone-50 border-t border-stone-100 flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 rounded-xl bg-white border border-stone-200 font-black text-xs uppercase tracking-widest text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all ${
                    isDangerous
                      ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'
                      : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
