import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Users,
  Bot,
  Plus,
} from "lucide-react";
import { getCoachDashboardOverview } from "../services/dashboardService"; // تأكد من اسم ومسار ملف الـ service لديك

function CoachDashboardOverview() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await getCoachDashboardOverview();
        const data = response?.data || response;
        setDashboardData(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen text-white flex items-center justify-center">
        <p className="text-xl text-slate-400">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-950 min-h-screen text-white flex items-center justify-center">
        <p className="text-xl text-red-400">{error}</p>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentRequests = dashboardData?.recentRequests || [];
  const recentAIPlans = dashboardData?.recentAIPlans || [];

  const performanceCards = [
    {
      title: "Pending Requests",
      value: stats.pendingRequests ?? 0,
      change: "Action Required",
      icon: <CalendarCheck size={24} />,
    },
    {
      title: "Total Trainees",
      value: stats.totalTrainees ?? 0,
      change: "Active",
      icon: <Users size={24} />,
    },
    {
      title: "Pending AI Plans",
      value: stats.pendingAIPlans ?? 0,
      change: "Review Needed",
      icon: <Bot size={24} />,
    },
  ];

  return (
    <main className="bg-slate-950 min-h-screen text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <span className="bg-red-500/10 text-red-400 px-4 py-2 rounded-full font-semibold">
            Coach Dashboard
          </span>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mt-6">
            <div>
              <h1 className="text-5xl font-extrabold mb-4">
                Dashboard Overview
              </h1>

              <p className="text-slate-400 text-lg max-w-2xl">
                Manage your trainees, review AI training plans, and handle incoming requests.
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard/pending-ai-plans")}
              className="bg-red-500 hover:bg-red-600 px-6 py-4 rounded-xl font-semibold transition flex items-center gap-2 w-fit"
            >
              <Plus size={20} />
              Review AI Plans
            </button>
          </div>
        </motion.div>

        {/* الكروت الإحصائية الحقيقية المسترجعة من الـ Backend */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {performanceCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-red-500/50 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-5">
                {card.icon}
              </div>

              <p className="text-slate-400 mb-2">{card.title}</p>

              <div className="flex items-end justify-between">
                <h2 className="text-4xl font-extrabold">{card.value}</h2>
                <span className="text-emerald-400 text-sm font-semibold">
                  {card.change}
                </span>
              </div>
            </motion.div>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            {/* آخر طلبات التدريب الحقيقية */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Recent Training Requests</h2>
                <button
                  onClick={() => navigate("/dashboard/athletes")}
                  className="text-red-400 hover:text-red-300 text-sm font-semibold"
                >
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {recentRequests.length === 0 ? (
                  <p className="text-slate-400 text-sm">No recent requests found.</p>
                ) : (
                  recentRequests.map((req) => (
                    <div
                      key={req._id}
                      className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-bold text-lg">
                          {req.athlete?.name || "Unknown Athlete"}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                          {req.message || "No message provided."}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          req.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse" // أضفنا border و animate-pulse
                            : req.status === "accepted"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {req.status === "pending" ? "Action Required" : req.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            {/* الأقسام السريعة */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 h-fit"
            >
              <h2 className="text-3xl font-bold mb-6">Quick Actions</h2>

              <div className="space-y-4">
                <button
                  onClick={() => navigate("/dashboard/trainees")}
                  className="w-full bg-red-500 hover:bg-red-600 py-4 rounded-xl font-semibold transition"
                >
                  Manage My Trainees
                </button>

                <button
                  onClick={() => navigate("/dashboard/ai-plans")}
                  className="w-full border border-slate-700 hover:border-red-500 py-4 rounded-xl font-semibold transition"
                >
                  Review Pending AI Plans
                </button>
              </div>
            </motion.div>

            {/* خطط الـ AI المعلقة الحديثة الحقيقية */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6">Pending AI Plans</h2>

              <div className="space-y-4">
                {recentAIPlans.length === 0 ? (
                  <p className="text-slate-400 text-sm">No pending AI plans.</p>
                ) : (
                  recentAIPlans.map((plan) => (
                    <div
                      key={plan._id}
                      className="border-l-2 border-red-500 pl-4 py-2"
                    >
                      <h3 className="font-bold">
                        {plan.athlete?.name || "Athlete"}
                      </h3>
                      <p className="text-slate-400 text-xs mt-1">
                        Goal: {plan.goal} | Level: {plan.level}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default CoachDashboardOverview;