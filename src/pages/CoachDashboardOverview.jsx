import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Users,
  Bot,
  Check,
  X,
  Search,
  Eye,
  MessageCircle,
  Activity,
  Trophy,
  Calendar,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getCoachDashboardOverview,
  getDashboardTrainingRequests,
  getMyTrainees,
} from "../services/dashboardService";
import {
  acceptTrainingRequest,
  rejectTrainingRequest,
} from "../services/trainingRequestService";

function CoachDashboardOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // حالة البيانات الخاصة بالداشبورد والمتدربين والطلبات
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [trainees, setTrainees] = useState([]);

  // حالات الفلترة والبحث ومودال التفاصيل
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("All");
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // دالة موحدة للتوجيه إلى الشات بالمسار الصحيح المطابق لـ App.jsx (/chat/:recipientId)
  const handleOpenChat = (trainee) => {
    if (!trainee) return;

    // الحصول على الـ ID سواء كان مباشرة أو داخل user / athlete
    const targetId =
      trainee.user?._id ||
      trainee.user?.id ||
      trainee.athlete?._id ||
      trainee.athlete?.id ||
      trainee._id ||
      trainee.id;

    if (targetId) {
      navigate(`/chat/${targetId}`);
    } else {
      console.error("Could not find recipient ID for chat:", trainee);
    }
  };

  // جلب البيانات بالكامل
  const fetchAllDashboardData = async () => {
    try {
      setLoading(true);

      const [overviewRes, requestsRes, traineesRes] = await Promise.all([
        getCoachDashboardOverview(),
        getDashboardTrainingRequests(),
        getMyTrainees(),
      ]);

      // 1. بيانات النظرة العامة
      const overview = overviewRes?.data || overviewRes;
      setDashboardData(overview);

      // 2. طلبات التدريب المعلقة
      const allRequests = requestsRes?.data || requestsRes || [];
      const pending = allRequests.filter((req) => req.status === "pending");
      setPendingRequests(pending);

      // 3. قائمة المتدربين
      const activeTrainees = traineesRes?.data || traineesRes || [];
      setTrainees(activeTrainees);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  // فلترة المتدربين النشطين حسب البحث والرياضة
  const filteredTrainees = trainees.filter((trainee) => {
    const traineeName = trainee.name || trainee.user?.name || "";
    const traineeSport = trainee.sport?.name || "";

    const matchesSearch = traineeName
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesSport =
      sportFilter === "All" || traineeSport === sportFilter;

    return matchesSearch && matchesSport;
  });

  // قبول أو رفض الطلب
  const handleUpdateStatus = async (requestId, status) => {
    try {
      if (status === "accepted") {
        await acceptTrainingRequest(requestId);
      } else {
        await rejectTrainingRequest(requestId);
      }
      await fetchAllDashboardData();
    } catch (err) {
      console.error("Error updating request status:", err);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen text-white flex items-center justify-center">
        <p className="text-xl text-slate-400 animate-pulse">
          Loading Dashboard...
        </p>
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
  const recentAIPlans = dashboardData?.recentAIPlans || [];

  const performanceCards = [
    {
      title: "Pending Requests",
      value: pendingRequests.length || stats.pendingRequests || 0,
      change: "Action Required",
      icon: <CalendarCheck size={24} />,
    },
    {
      title: "Active Trainees",
      value: trainees.length || stats.totalTrainees || 0,
      change: "Currently Active",
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <span className="bg-red-500/10 text-red-400 px-4 py-2 rounded-full font-semibold text-sm">
            Coach Dashboard
          </span>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mt-6">
            <div>
              <h1 className="text-5xl font-extrabold mb-4">
                Dashboard & Management
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl">
                Manage your trainees, review AI training plans, and handle incoming requests.
              </p>
            </div>
          </div>
        </motion.div>

        {/* الإحصائيات (Stats Grid) */}
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

        {/* القسم الرئيسي للتفاصيل */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
          {/* العمود الأيسر: طلبات التدريب المعلقة */}
          <div className="xl:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Pending Training Requests</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Athletes waiting for your approval
                </p>
              </div>

              <div className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <div className="bg-slate-800/50 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
                    No pending training requests at the moment.
                  </div>
                ) : (
                  pendingRequests.map((req) => {
                    const reqId = req.id || req._id;
                    const athlete = req.athlete || {};
                    return (
                      <div
                        key={reqId}
                        className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <h3 className="font-bold text-lg">
                            {athlete.name || "Athlete"}
                          </h3>
                          <p className="text-slate-400 text-sm mt-1">
                            {athlete.email || "No email"}
                          </p>
                          <p className="text-slate-300 text-sm mt-2">
                            {req.message || "No message provided."}
                          </p>
                          <span className="text-xs text-red-400 font-medium mt-2 block">
                            Sport: {req.sport?.name || "General"}
                          </span>
                        </div>

                        {/* أزرار الإجراء السريع */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(reqId, "accepted")}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition"
                          >
                            <Check size={16} /> Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(reqId, "rejected")}
                            className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition"
                          >
                            <X size={16} /> Reject
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>

          {/* العمود الأيمن: الإجراءات السريعة والـ AI Plans */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 h-fit"
            >
              <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/ai-plans")}
                  className="w-full bg-red-500 hover:bg-red-600 py-4 rounded-xl font-semibold transition text-center"
                >
                  Review Pending AI Plans
                </button>
              </div>
            </motion.div>

            {/* Pending AI Plans */}
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

        {/* قسم إدارة المتدربين النشطين (My Trainees) مدمج بالكامل */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
            <div>
              <h2 className="text-3xl font-bold">My Trainees</h2>
              <p className="text-slate-400 mt-2">
                Athletes currently training under your supervision.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search trainee..."
                  className="bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-red-500 text-white"
                />
              </div>

              <select
                value={sportFilter}
                onChange={(event) => setSportFilter(event.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white"
              >
                <option>All</option>
                <option>Boxing</option>
                <option>Fitness</option>
                <option>Bodybuilding</option>
                <option>Karate</option>
                <option>Taekwondo</option>
              </select>
            </div>
          </div>

          <div className="space-y-5">
            {filteredTrainees.length === 0 ? (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center text-slate-400">
                No active trainees found.
              </div>
            ) : (
              filteredTrainees.map((trainee, index) => {
                const traineeId = trainee.id || trainee._id;
                const name = trainee.name || trainee.user?.name;
                const sportName = trainee.sport?.name || "General Sport";

                return (
                  <motion.div
                    key={traineeId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-red-500/50 transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                      <div>
                        <h3 className="text-2xl font-bold">{name}</h3>
                        <p className="text-slate-400 mt-2">
                          {sportName} • Level {trainee.level || 1} • XP: {trainee.xp || 0}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold">
                          Active
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedAthlete(trainee)}
                          className="w-10 h-10 rounded-xl border border-slate-600 flex items-center justify-center hover:border-red-500 transition text-white"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenChat(trainee)}
                          className="w-10 h-10 rounded-xl border border-slate-600 flex items-center justify-center hover:border-blue-500 transition text-white"
                        >
                          <MessageCircle size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* مودال تفاصيل المتدرب المدمج */}
      {selectedAthlete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-xl text-white"
          >
            <div className="flex items-start justify-between gap-6 mb-6">
              <div>
                <span className="text-red-400 font-semibold">Trainee Profile</span>
                <h2 className="text-4xl font-bold mt-3">
                  {selectedAthlete.name || selectedAthlete.user?.name}
                </h2>
                <p className="text-slate-400 mt-2">
                  {selectedAthlete.email || selectedAthlete.user?.email || "No email"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAthlete(null)}
                className="w-10 h-10 rounded-xl border border-slate-700 flex items-center justify-center hover:border-red-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <Activity className="text-red-400 mb-3" size={24} />
                <p className="text-slate-400 text-sm">Level & XP</p>
                <h3 className="text-xl font-bold mt-1">
                  Lvl {selectedAthlete.level || 1} ({selectedAthlete.xp || 0} XP)
                </h3>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <Trophy className="text-red-400 mb-3" size={24} />
                <p className="text-slate-400 text-sm">Sport</p>
                <h3 className="text-xl font-bold mt-1">
                  {selectedAthlete.sport?.name || "Sport"}
                </h3>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <Calendar className="text-red-400 mb-3" size={24} />
                <p className="text-slate-400 text-sm">Joined At</p>
                <h3 className="text-sm font-bold mt-1">
                  {selectedAthlete.createdAt
                    ? new Date(selectedAthlete.createdAt).toLocaleDateString()
                    : "Unknown"}
                </h3>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  handleOpenChat(selectedAthlete);
                  setSelectedAthlete(null);
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Message Trainee
              </button>

              <button
                type="button"
                onClick={() => setSelectedAthlete(null)}
                className="w-full bg-red-500 hover:bg-red-600 py-4 rounded-xl font-semibold transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}

export default CoachDashboardOverview;