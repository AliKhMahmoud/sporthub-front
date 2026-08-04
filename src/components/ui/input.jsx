function Input({
  type = "text",
  placeholder = "",
  className = "",
  ...props
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`
        w-full
        bg-white
        border border-slate-300
        rounded-xl
        px-4 py-3
        outline-none
        focus:border-red-500
        text-slate-900
        placeholder:text-slate-400
        transition
        dark:bg-slate-800
        dark:border-slate-700
        dark:text-white
        dark:placeholder:text-slate-500
        ${className}
      `}
      {...props}
    />
  );
}

export default Input;