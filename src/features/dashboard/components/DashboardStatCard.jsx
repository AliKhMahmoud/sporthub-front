function DashboardStatCard({ stat }) {
  return (
    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 hover:border-red-500/40 transition">
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-400">
          {stat.title}
        </p>

        <span className="text-emerald-400 text-sm font-semibold">
          {stat.change}
        </span>
      </div>

      <h2 className="text-4xl font-extrabold text-white">
        {stat.value}
      </h2>
    </div>
  );
}

export default DashboardStatCard;