function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-red-500 hover:bg-red-600 text-white",

    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700",

    outline:
      "border border-slate-300 text-slate-900 hover:border-red-400 hover:text-red-500 dark:border-slate-600 dark:text-white dark:hover:border-red-400 dark:hover:text-red-400",
  };

  return (
    <button
      type={type}
      className={`
        px-6 py-3 rounded-xl font-semibold transition
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;