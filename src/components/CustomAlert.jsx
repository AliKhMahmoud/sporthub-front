import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { AlertTriangle, CheckCircle2, HelpCircle, Edit3 } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { CustomButton } from './CustomButton';
import { CustomDialog } from './CustomDialog';

// ─── مكون داخلي مخصص للدايالوج الذي يحتوي على حقل إدخال ───
function PromptDialogContent({ title, text, defaultValue, placeholder, confirmText, onConfirm, onCancel }) {
  const [value, setValue] = useState(defaultValue || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(value);
  };

  return (
    <CustomDialog isOpen={true} onClose={onCancel} maxWidth="sm">
      <form onSubmit={handleSubmit} className="flex flex-col items-center text-center space-y-4 py-2" dir="ltr">
        {/* Status Icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-red-500/10 dark:bg-red-500/20">
          <Edit3 className="w-8 h-8 text-red-500" />
        </div>

        {/* Content */}
        <div className="space-y-1.5 w-full">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          {text && (
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
              {text}
            </p>
          )}
        </div>

        {/* Input Field */}
        <div className="w-full pt-1">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder || 'Enter value...'}
            autoFocus
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-200"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full pt-2">
          <CustomButton 
            type="button"
            variant="secondary" 
            fullWidth 
            onClick={onCancel}
            className="!bg-slate-100 hover:!bg-slate-200 dark:!bg-slate-800 dark:hover:!bg-slate-700 !text-slate-700 dark:!text-slate-200 !border-slate-200 dark:!border-slate-700 transition-all duration-200"
          >
            Cancel
          </CustomButton>

          <CustomButton 
            type="submit"
            variant="primary" 
            fullWidth 
          >
            {confirmText || 'Save'}
          </CustomButton>
        </div>
      </form>
    </CustomDialog>
  );
}

export class CustomAlert {
  // ─── 1. Quick Toasts (using SweetAlert2) ───────────────────

  static commonToastOptions = {
    timer: 3000,
    showConfirmButton: false,
    showCloseButton: true,
    timerProgressBar: true,
    toast: true,
    position: 'top-end',
    customClass: {
      popup: 'rounded-2xl font-sans shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white relative z-[10000]',
      title: 'text-slate-900 dark:text-white text-sm font-bold pl-3',
      closeButton: 'focus:shadow-none focus:outline-none text-slate-400 hover:text-slate-600 dark:hover:text-slate-200',
    },
  };

  static success(title, text) {
    Swal.fire({
      ...this.commonToastOptions,
      title,
      text,
      icon: 'success',
    });
  }

  static error(error, title = 'Operation Failed') {
    let message = 'Please check the provided data and try again.';

    if (axios.isAxiosError && axios.isAxiosError(error)) {
      message = error.response?.data?.message || error.message || message;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    Swal.fire({
      ...this.commonToastOptions,
      title,
      text: message,
      icon: 'error',
      timer: 4500,
    });
  }

  static warning(title, text) {
    Swal.fire({
      ...this.commonToastOptions,
      title,
      text: text || 'Important warning, please pay attention.',
      icon: 'warning',
      timer: 4000,
    });
  }

  static info(title, text) {
    Swal.fire({
      ...this.commonToastOptions,
      title,
      text,
      icon: 'info',
      timer: 3000,
    });
  }

  // ─── 2. Professional Confirmation Dialogs ──────────────────────────────────────────

  static showConfirmDialog(title, text, confirmText, type) {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      const cleanup = () => {
        root.unmount();
        if (container.parentNode) {
          document.body.removeChild(container);
        }
      };

      const handleConfirm = () => {
        cleanup();
        resolve({ isConfirmed: true });
      };

      const handleCancel = () => {
        cleanup();
        resolve({ isConfirmed: false });
      };

      const typeConfig = {
        danger: {
          icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
          iconCls: 'bg-red-500/10 dark:bg-red-500/20',
          btnVariant: 'danger',
        },
        success: {
          icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
          iconCls: 'bg-emerald-500/10 dark:bg-emerald-500/20',
          btnVariant: 'success',
        },
        warning: {
          icon: <HelpCircle className="w-8 h-8 text-amber-500" />,
          iconCls: 'bg-amber-500/10 dark:bg-amber-500/20',
          btnVariant: 'primary',
        },
      };

      const config = typeConfig[type] || typeConfig.warning;

      root.render(
        <CustomDialog isOpen={true} onClose={handleCancel} maxWidth="sm">
          <div className="flex flex-col items-center text-center space-y-4 py-2" dir="ltr">
            {/* Status Icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${config.iconCls}`}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="space-y-1.5 w-full">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                {text}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full pt-4">
              <CustomButton 
                variant="secondary" 
                fullWidth 
                onClick={handleCancel}
                className="!bg-slate-100 hover:!bg-slate-200 dark:!bg-slate-800 dark:hover:!bg-slate-700 !text-slate-700 dark:!text-slate-200 !border-slate-200 dark:!border-slate-700 transition-all duration-200"
              >
                Cancel
              </CustomButton>

              <CustomButton 
                variant={config.btnVariant} 
                fullWidth 
                onClick={handleConfirm}
              >
                {confirmText}
              </CustomButton>
            </div>
          </div>
        </CustomDialog>
      );
    });
  }

  // ─── 3. Single Input Prompt Dialog ────────────────────────────────────────────────

  static prompt(title = 'Edit', text = '', defaultValue = '', placeholder = '', confirmText = 'Save') {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      const cleanup = () => {
        root.unmount();
        if (container.parentNode) {
          document.body.removeChild(container);
        }
      };

      const handleConfirm = (inputValue) => {
        cleanup();
        resolve(inputValue);
      };

      const handleCancel = () => {
        cleanup();
        resolve(null);
      };

      root.render(
        <PromptDialogContent
          title={title}
          text={text}
          defaultValue={defaultValue}
          placeholder={placeholder}
          confirmText={confirmText}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );
    });
  }

  // Confirm Delete Dialog
  static async confirmDelete(
    title = 'Confirm Deletion', 
    text = 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmButtonText = 'Yes, Delete'
  ) {
    const res = await this.showConfirmDialog(title, text, confirmButtonText, 'danger');
    return res.isConfirmed;
  }

  // Confirm Add Dialog
  static async confirmAdd(
    title = 'Confirm Addition', 
    text = 'Are you sure you want to save and add this data to the system?'
  ) {
    const res = await this.showConfirmDialog(title, text, 'Yes, Add', 'success');
    return res.isConfirmed;
  }

  // Confirm Update Dialog
  static async confirmUpdate(
    title = 'Confirm Update', 
    text = 'Are you sure you want to save these changes?'
  ) {
    const res = await this.showConfirmDialog(title, text, 'Yes, Save Changes', 'success');
    return res.isConfirmed;
  }

  // Confirm Warning Dialog
  static async confirmWarning(title, text) {
    const res = await this.showConfirmDialog(title, text, 'Continue', 'warning');
    return res.isConfirmed;
  }
}