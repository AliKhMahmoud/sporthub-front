import { Loader2 } from 'lucide-react';

export const CustomButton = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText = 'Loading...',
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  type = 'button',
  ...props
}) => {
  // Define styles based on Variant using Tailwind colors matching SportsHub theme
  const variantStyles = {
    primary: 'bg-red-600 hover:bg-red-700 text-white shadow-sm active:scale-[0.98]',
    secondary: 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98]',
    outline: 'border border-red-500 text-red-600 dark:text-red-400 hover:bg-red-500/10 active:scale-[0.98]',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm active:scale-[0.98]',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-[0.98]',
    ghost: 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98]',
  };

  // Define size variants
  const sizeStyles = {
    sm: 'py-2 px-3 text-xs rounded-lg gap-1.5',
    md: 'py-2.5 px-4 text-sm rounded-xl gap-2',
    lg: 'py-3.5 px-6 text-base rounded-2xl gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`
        font-medium transition-all duration-200 flex items-center justify-center select-none cursor-pointer
        disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
        ${fullWidth ? 'w-full' : 'w-auto'}
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      {...props}
    >
      {/* Loading state */}
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="animate-spin" />
          <span>{loadingText}</span>
        </span>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span className="truncate">{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};