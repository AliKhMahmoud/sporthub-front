function Toast({ message, type = "success" }) {
  if (!message) return null;

  const styles = {
    success: "bg-emerald-500 text-white",
    error: "bg-red-500 text-white",
  };

  return (
    <div
      className={`
        fixed top-6 right-6 z-[999]
        px-5 py-4 rounded-2xl
        shadow-lg font-semibold
        ${styles[type]}
     ` }
    >
      {message}
    </div>
  );
}

export default Toast;