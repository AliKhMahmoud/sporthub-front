import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export const CustomDialog = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  minHeight = '',
  // Brand Header Bar Gradient
  headerGradient = 'from-red-600 via-red-500 to-rose-600',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm min-w-[300px]',
    md: 'max-w-md min-w-[340px] sm:min-w-[500px]',
    lg: 'max-w-lg min-w-[340px] sm:min-w-[600px]',
    xl: 'max-w-xl min-w-[340px] sm:min-w-[700px]',
    '2xl': 'max-w-2xl min-w-[340px] sm:min-w-[780px]',
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="ltr">
      {/* 1. Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* 2. Main Dialog Box */}
      <div 
        className={`
          relative w-full ${maxWidthClasses[maxWidth] || maxWidthClasses.md} ${minHeight} 
          bg-white dark:bg-slate-900 
          border border-slate-200 dark:border-slate-800 
          rounded-2xl shadow-2xl z-10 flex flex-col max-h-[85vh] animate-scale-up
        `}
      >
        {/* Brand Colored Top Bar */}
        <div className={`h-2 w-full bg-gradient-to-r ${headerGradient} shrink-0 rounded-t-2xl`} />

        {/* 3. Dialog Header */}
        {title && (
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shrink-0 shadow-sm shadow-red-500/40" />
              <span>{title}</span>
            </h3>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-xl transition-all duration-200 cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* 4. Dialog Body */}
        <div className="p-6 sm:p-7 overflow-y-auto custom-scrollbar rounded-b-2xl flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};