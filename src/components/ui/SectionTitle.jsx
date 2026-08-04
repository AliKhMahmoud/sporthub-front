function SectionTitle({
  title,
  subtitle,
  center = false,
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <h2 className="text-4xl font-bold mb-4 text-slate-950 dark:text-white">
        {title}
      </h2>

      {subtitle && (
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionTitle;