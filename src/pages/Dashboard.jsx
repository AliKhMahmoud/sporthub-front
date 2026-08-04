import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";
import {
  Activity,
  CalendarCheck,
  Flame,
  LineChart,
  MessageCircle,
  Plus,
  Users,
} from "lucide-react";

import DashboardStatCard from "../features/dashboard/components/DashboardStatCard";

import {
  dashboardStats,
  dashboardContent,
} from "../features/dashboard/data/dashboardData";

const performanceCards = [
  {
    title: "Weekly Workouts",
    value: "18",
    change: "+14%",
    icon: <CalendarCheck size={24} />,
  },
  {
    title: "Active Athletes",
    value: "342",
    change: "+21%",
    icon: <Users size={24} />,
  },
  {
    title: "Forum Engagement",
    value: "89%",
    change: "+9%",
    icon: <MessageCircle size={24} />,
  },
  {
    title: "Content Growth",
    value: "24%",
    change: "+6%",
    icon: <LineChart size={24} />,
  },
];

const activityTimeline = [
  {
    title: "New training plan published",
    text: "Advanced Karate Training was published successfully.",
    time: "10 min ago",
  },
  {
    title: "Forum activity increased",
    text: "Boxing discussions received new comments today.",
    time: "35 min ago",
  },
  {
    title: "New athlete joined",
    text: "A new member joined the Fitness community.",
    time: "1 hour ago",
  },
];
const performanceData = [
  { day: "Mon", activity: 40 },
  { day: "Tue", activity: 65 },
  { day: "Wed", activity: 55 },
  { day: "Thu", activity: 80 },
  { day: "Fri", activity: 72 },
  { day: "Sat", activity: 95 },
  { day: "Sun", activity: 88 },
];
function Dashboard() {
  const navigate = useNavigate();

  return (
    <main className="bg-slate-950 min-h-screen text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <span className="bg-red-500/10 text-red-400 px-4 py-2 rounded-full font-semibold">
            Publisher Dashboard
          </span>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mt-6">
            <div>
              <h1 className="text-5xl font-extrabold mb-4">
                Dashboard Overview
              </h1>

              <p className="text-slate-400 text-lg max-w-2xl">
                Manage your sports content, monitor community activity,
                and publish powerful training experiences.
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard/content")}
              className="bg-red-500 hover:bg-red-600 px-6 py-4 rounded-xl font-semibold transition flex items-center gap-2 w-fit"
            >
              <Plus size={20} />
              Create Content
            </button>
          </div>
        </motion.div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12 }}
            >
              <DashboardStatCard stat={stat} />
            </motion.div>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {performanceCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.1 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-red-500/50 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-5">
                {card.icon}
              </div>

              <p className="text-slate-400 mb-2">
                {card.title}
              </p>

              <div className="flex items-end justify-between">
                <h2 className="text-4xl font-extrabold">
                  {card.value}
                </h2>
<span className="text-emerald-400 text-sm font-semibold">
                  {card.change}
                </span>
              </div>
            </motion.div>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold">
                    Weekly Activity
                  </h2>

                  <p className="text-slate-400 mt-2">
                    A quick view of your community growth.
                  </p>
                  <div className="h-[300px] mt-10">
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={performanceData}>
      <defs>
        <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="5%"
            stopColor="#ef4444"
            stopOpacity={0.8}
          />
          <stop
            offset="95%"
            stopColor="#ef4444"
            stopOpacity={0}
          />
        </linearGradient>
      </defs>

      <XAxis
        dataKey="day"
        stroke="#94a3b8"
        tickLine={false}
        axisLine={false}
      />

      <Tooltip
        contentStyle={{
          backgroundColor: "#0f172a",
          border: "1px solid #334155",
          borderRadius: "16px",
          color: "#fff",
        }}
      />

      <Area
        type="monotone"
        dataKey="activity"
        stroke="#ef4444"
        strokeWidth={4}
        fillOpacity={1}
        fill="url(#colorActivity)"
      />
    </AreaChart>
  </ResponsiveContainer>
</div>
                </div>

                <div className="text-red-400">
                  <Activity size={28} />
                </div>
              </div>

              <div className="space-y-5">
                {[70, 45, 85, 60, 95].map((value, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                      <span>
                        Day {index + 1}
                      </span>

                      <span>{value}%</span>
                    </div>

                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${value}% `}}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: index * 0.1 }}
                        className="h-full bg-red-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold">
                    Latest Content
                  </h2>

                  <p className="text-slate-400 mt-2">
                    Recently created plans and posts.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/dashboard/content")}
                  className="bg-red-500 hover:bg-red-600 px-5 py-3 rounded-xl font-semibold transition"
                >
                  Create New
                </button>
              </div>

              <div className="space-y-5">
                {dashboardContent.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-red-500/40 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <span className="text-red-400 text-sm font-semibold">
                          {item.type}
                        </span>

                        <h3 className="text-2xl font-bold mt-2">
                          {item.title}
                        </h3>

                        <p className="text-slate-400 mt-2">
                          Sport: {item.sport}
                        </p>
                      </div>
<span
                        className={`px-4 py-2 rounded-full text-sm font-semibold w-fit ${
                          item.status === "Published"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 h-fit"
            >
              <h2 className="text-3xl font-bold mb-6">
                Quick Actions
              </h2>

              <div className="space-y-4">
                <button
                  onClick={() => navigate("/dashboard/content")}
                  className="w-full bg-red-500 hover:bg-red-600 py-4 rounded-xl font-semibold transition"
                >
                  Create Training Plan
                </button>

                <button
                  onClick={() => navigate("/dashboard/content")}
                  className="w-full border border-slate-700 hover:border-red-500 py-4 rounded-xl font-semibold transition"
                >
                  Create Forum Post
                </button>

                <button
                  onClick={() => navigate("/dashboard/athletes")}
                  className="w-full border border-slate-700 hover:border-red-500 py-4 rounded-xl font-semibold transition"
                >
                  Manage Athletes
                </button>
              </div>

              <div className="mt-10 bg-slate-800 rounded-2xl p-5 border border-slate-700">
                <div className="text-red-400 mb-3">
                  <Flame size={24} />
                </div>

                <h3 className="text-xl font-bold mb-3">
                  Weekly Growth
                </h3>

                <p className="text-slate-400 leading-7">
                  Your sports community activity increased by 24% this week.
                  Keep publishing high quality training content.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
            >
              <h2 className="text-3xl font-bold mb-6">
                Activity Timeline
              </h2>

              <div className="space-y-6">
                {activityTimeline.map((activity, index) => (
                  <div
                    key={index}
                    className="relative pl-7 border-l border-slate-700"
                  >
                    <span className="absolute -left-[7px] top-1 w-3 h-3 bg-red-500 rounded-full" />

                    <h3 className="font-bold mb-1">
                      {activity.title}
                    </h3>

                    <p className="text-slate-400 text-sm leading-6">
                      {activity.text}
                    </p>

                    <span className="text-red-400 text-xs mt-2 inline-block">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;