import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  Check,
  Eye,
  MessageCircle,
  Search,
  Trophy,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  acceptTrainingRequest,
  rejectTrainingRequest,
} from "../services/trainingRequestService";

import { getDashboardTrainingRequests, getMyTrainees } from "../services/dashboardService"; // افترضت أن دالة جلب المتدربين موجودة هنا أو في ملف الـ dashboard


function CoachTraineesManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("All");
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  
  const [pendingRequests, setPendingRequests] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب البيانات عند تحميل الصفحة
  const loadDashboardData = async () => {
  try {
    setLoading(true);

    // جلب جميع طلبات التدريب الخاصة بالمدرب من الداشبورد
    const response = await getDashboardTrainingRequests();
    const allRequests = response.data || response || [];

    // فلترة الطلبات المعلقة لعرضها في الأعلى
    const pending = allRequests.filter(req => req.status === "pending");

    setPendingRequests(pending);

    // جلب المتدربين النشطين
    const traineesData = await getMyTrainees();
    setTrainees(traineesData.data || traineesData || []);
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // فلترة المتدربين النشطين حسب البحث والرياضة
  const filteredTrainees = trainees.filter((trainee) => {
    const traineeName = trainee.name || "";
    const traineeSport = trainee.sport?.name || "";

    const matchesSearch = traineeName
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesSport =
      sportFilter === "All" || traineeSport === sportFilter;

    return matchesSearch && matchesSport;
  });

  // تحديث حالة الطلب (قبول أو رفض)
  const updateRequestStatus = async (requestId, status, athleteId) => {
    try {
      let updatedRequest;
      if (status === "accepted") {
        updatedRequest = await acceptTrainingRequest(requestId);
      } else {
        updatedRequest = await rejectTrainingRequest(requestId);
      }

      if (!updatedRequest) return;

      // إرسال إشعار للمتدرب
      // await createNotification({
      //   type: "training_request_status",
      //   title:
      //     status === "accepted"
      //       ? "Training Request Accepted"
      //       : "Training Request Rejected",
      //   message:
      //     status === "accepted"
      //       ? `${user?.name || "Coach"} accepted your training request.`
      //       : `${user?.name || "Coach"} rejected your training request.`,
      //   userId: athleteId,
      //   senderId: user?.id || user?._id,
      //   requestId,
      //   link: "/coaches",
      // });

      // إعادة تحميل البيانات لتحديث القوائم فوراً
      await loadDashboardData();
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  return (
    <>
      <main className="p-10 text-white">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <span className="bg-red-500/10 text-red-400 px-4 py-2 rounded-full font-semibold">
            Coach Management
          </span>

          <h1 className="text-5xl font-extrabold mt-6 mb-4">
            Athletes & Requests
          </h1>

          <p className="text-slate-400 text-lg">
            Manage incoming training requests and monitor your active trainees.
          </p>
        </motion.div>

        {/* إحصائيات سريعة */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <Users className="text-red-400 mb-4" size={28} />
            <p className="text-slate-400 mb-2">Accepted Trainees</p>
            <h2 className="text-4xl font-bold">{trainees.length}</h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <UserCheck className="text-red-400 mb-4" size={28} />
            <p className="text-slate-400 mb-2">Pending Requests</p>
            <h2 className="text-4xl font-bold">{pendingRequests.length}</h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <Trophy className="text-red-400 mb-4" size={28} />
            <p className="text-slate-400 mb-2">Coach Sport</p>
            <h2 className="text-3xl font-bold">
              {user?.coachSport || user?.sport?.name || "Sport"}
            </h2>
          </div>
        </section>

        {/* قسم طلبات التدريب المعلقة */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-10">
          <h2 className="text-3xl font-bold mb-2">Training Requests</h2>
          <p className="text-slate-400 mb-8">
            Accept or reject athletes who requested training with you.
          </p>

          {pendingRequests.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-slate-400 text-center">
              No pending training requests.
            </div>
          ) : (
            <div className="space-y-5">
              {pendingRequests.map((request) => {
                const requestId = request.id || request._id;
                const athlete = request.athlete || {};
                const athleteName = athlete.name || "Athlete";
                const athleteEmail = athlete.email || "No email";
                const sportName = request.sport?.name || "Sport";
                const athleteId = athlete._id || athlete.id;

                return (
                  <div
                    key={requestId}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-5"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                      <div>
                        <h3 className="text-2xl font-bold">{athleteName}</h3>
                        <p className="text-slate-400 mt-2">{athleteEmail}</p>
                        <p className="text-red-400 mt-2 font-semibold">
                          Wants training in {sportName}
                        </p>
                        <p className="text-slate-400 mt-3">
                          {request.message || "No message provided."}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateRequestStatus(requestId, "accepted", athleteId)
                          }
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition"
                        >
                          <Check size={18} />
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateRequestStatus(requestId, "rejected", athleteId)
                          }
                          className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition"
                        >
                          <X size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* قسم المتدربين النشطين */}
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
                  className="bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <select
                value={sportFilter}
                onChange={(event) => setSportFilter(event.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
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
                const name = trainee.name;
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
                          className="w-10 h-10 rounded-xl border border-slate-600 flex items-center justify-center hover:border-red-500 transition"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/messages/${traineeId}`)}
                          className="w-10 h-10 rounded-xl border border-slate-600 flex items-center justify-center hover:border-blue-500 transition"
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
      </main>

      {/* مودال تفاصيل المتدرب */}
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
                  {selectedAthlete.name}
                </h2>
                <p className="text-slate-400 mt-2">
                  {selectedAthlete.email || "No email"}
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
                onClick={() =>
                  navigate(
                    `/messages/${selectedAthlete.id || selectedAthlete._id}`
                  )
                }
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
    </>
  );
}

export default CoachTraineesManagement;