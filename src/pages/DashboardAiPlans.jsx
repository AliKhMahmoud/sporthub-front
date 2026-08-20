import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  Save,
  XCircle,
  Loader2,
  ChevronLeft,
} from "lucide-react";

import aiPlanService from "../services/aiPlanService";

function DashboardAiPlans() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const response = await aiPlanService.getPlans();
        const data = response.data || response || [];
        setPlans(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading AI plans:", error);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!selectedPlan) {
        try {
          const response = await aiPlanService.getPlans();
          const data = response.data || response || [];
          setPlans(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Auto-refresh error:", error);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedPlan]);

  const filteredPlans = plans.filter((plan) => {
    if (activeTab === "pending") return plan.status === "Pending Coach Review";
    if (activeTab === "approved") return plan.status === "Approved";
    if (activeTab === "rejected") return plan.status === "Rejected";
    return true;
  });

  const totalPlans = plans.length;
  const pendingPlans = plans.filter((plan) => plan.status === "Pending Coach Review").length;
  const approvedPlans = plans.filter((plan) => plan.status === "Approved").length;
  const rejectedPlans = plans.filter((plan) => plan.status === "Rejected").length;

  const stats = [
    { title: "Total Plans", value: totalPlans, icon: Brain, color: "text-red-400" },
    { title: "Pending", value: pendingPlans, icon: Clock, color: "text-yellow-400" },
    { title: "Approved", value: approvedPlans, icon: CheckCircle, color: "text-emerald-400" },
    { title: "Rejected", value: rejectedPlans, icon: XCircle, color: "text-red-400" },
  ];

  const tabs = [
    { id: "all", label: "All", count: totalPlans },
    { id: "pending", label: "Pending", count: pendingPlans },
    { id: "approved", label: "Approved", count: approvedPlans },
    { id: "rejected", label: "Rejected", count: rejectedPlans },
  ];

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      const updatedPlan = await aiPlanService.approvePlan(id);

      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan._id === id || plan.id === id 
            ? { ...plan, status: "Approved", ...updatedPlan } 
            : plan
        )
      );

      if (selectedPlan?._id === id || selectedPlan?.id === id) {
        setSelectedPlan((prev) => 
          prev ? { ...prev, status: "Approved", ...updatedPlan } : null
        );
      }
    } catch (error) {
      console.error("Error approving plan:", error);
      alert("Error approving plan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(true);
      const updatedPlan = await aiPlanService.rejectPlan(id);

      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan._id === id || plan.id === id 
            ? { ...plan, status: "Rejected", ...updatedPlan } 
            : plan
        )
      );

      if (selectedPlan?._id === id || selectedPlan?.id === id) {
        setSelectedPlan((prev) => 
          prev ? { ...prev, status: "Rejected", ...updatedPlan } : null
        );
      }
    } catch (error) {
      console.error("Error rejecting plan:", error);
      alert("Error rejecting plan");
    } finally {
      setActionLoading(false);
    }
  };

  const openPlan = (plan) => {
    setSelectedPlan(plan);
    setFeedback(plan.coachFeedback || "");
  };

  const saveFeedback = async () => {
    if (!selectedPlan) return;
    const planId = selectedPlan._id || selectedPlan.id;
    if (!planId) return;

    try {
      setActionLoading(true);
      const updatedPlan = await aiPlanService.addFeedback(planId, { coachFeedback: feedback });

      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan._id === planId || plan.id === planId
            ? { ...plan, coachFeedback: feedback, ...updatedPlan }
            : plan
        )
      );

      setSelectedPlan((prev) => 
        prev ? { ...prev, coachFeedback: feedback, ...updatedPlan } : null
      );
      
      alert("Feedback saved successfully");
    } catch (error) {
      console.error("Error saving feedback:", error);
      alert("Error saving feedback");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="p-2 sm:p-4 md:p-6 lg:p-10 text-white flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-red-500 mb-2" size={28} />
        <p className="text-slate-400 text-[10px] sm:text-xs">Loading AI Plans...</p>
      </main>
    );
  }

  return (
    <main className="p-2 sm:p-4 md:p-6 lg:p-10 text-white max-w-full overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 sm:mb-6 md:mb-10"
      >
        <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-semibold text-[9px] sm:text-xs md:text-sm inline-block">
          Coach Review
        </span>

        <h1 className="text-sm sm:text-2xl md:text-4xl lg:text-5xl font-extrabold mt-2 sm:mt-4 md:mt-6 mb-1 sm:mb-3 md:mb-4 break-words">
          AI Plans
        </h1>

        <p className="text-slate-400 text-[9px] sm:text-xs md:text-base lg:text-lg line-clamp-2">
          Review, approve, or add feedback to training plans.
        </p>
      </motion.div>

      {/* Stats Section - Grid أصغر للشاشات الصغيرة */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-3 md:gap-5 mb-3 sm:mb-6 md:mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6"
            >
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <p className="text-slate-400 text-[8px] sm:text-xs md:text-sm line-clamp-1">{stat.title}</p>
                <Icon size={16} className={`${stat.color} shrink-0`} />
              </div>
              <h2 className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-bold">{stat.value}</h2>
            </div>
          );
        })}
      </section>

      {/* Tabs Section */}
      <div className="mb-3 sm:mb-6 w-full overflow-hidden">
        <div className="flex gap-1 border-b border-slate-700 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-2 sm:px-4 md:px-6 font-semibold text-[8px] sm:text-xs md:text-sm whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? "border-red-500 text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
              <span className="ml-0.5 text-[7px] sm:text-[9px] bg-slate-800 px-1 py-0.5 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Plans List / Grid */}
      {filteredPlans.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-8 md:p-10 text-center">
          <Brain size={32} className="mx-auto text-red-400 mb-2" />
          <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1">No Plans</h2>
          <p className="text-slate-400 text-[9px] sm:text-xs md:text-sm line-clamp-2">
            {activeTab === "all"
              ? "AI-generated plans will appear here."
              : `No ${activeTab} plans available.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
          {filteredPlans.map((plan) => {
            const planId = plan._id || plan.id || "";
            const athleteName = plan.athlete?.name || plan.athleteName || "Unknown";
            const sportName = typeof plan.sport === "object" ? plan.sport?.name : plan.sport;

            return (
              <motion.div
                key={planId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 md:p-6 flex flex-col justify-between hover:border-slate-700 transition-colors w-full min-w-0"
              >
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-1.5 mb-2 sm:mb-3">
                    <h2 className="text-xs sm:text-base md:text-xl font-bold truncate min-w-0 flex-1">
                      {athleteName}
                    </h2>
                    <span
                      className={
                        "px-1.5 py-0.5 rounded-full text-[7px] sm:text-[9px] md:text-xs font-semibold whitespace-nowrap shrink-0 " +
                        (plan.status === "Approved"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : plan.status === "Rejected"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-yellow-500/10 text-yellow-400")
                      }
                    >
                      {plan.status === "Approved" 
                        ? "Approved" 
                        : plan.status === "Rejected" 
                        ? "Rejected" 
                        : "Pending"}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-[8px] sm:text-xs text-slate-400 mb-2 sm:mb-4 min-w-0">
                    <p className="truncate"><span className="text-slate-200 font-medium">Goal:</span> {plan.goal || "—"}</p>
                    <p className="truncate"><span className="text-slate-200 font-medium">Sport:</span> {sportName || "—"}</p>
                    <p className="truncate"><span className="text-slate-200 font-medium">Level:</span> {plan.level || "—"}</p>
                  </div>

                  {plan.coachFeedback && (
                    <p className="text-emerald-400 text-[7px] sm:text-[10px] flex items-center gap-1 mb-2 sm:mb-4 bg-emerald-500/5 p-1.5 sm:p-2 rounded-lg border border-emerald-500/10 min-w-0 line-clamp-1">
                      <MessageSquare size={10} className="shrink-0" />
                      <span className="truncate">Feedback added</span>
                    </p>
                  )}
                </div>

                {/* Actions: Responsive layout */}
                <div className="pt-2 sm:pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => openPlan(plan)}
                    className="w-full flex items-center justify-center gap-0.5 bg-slate-800 hover:bg-slate-700 py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg transition text-[7px] sm:text-xs font-medium cursor-pointer disabled:opacity-50"
                    disabled={actionLoading}
                  >
                    <Eye size={12} />
                    <span className="hidden sm:inline">View</span>
                  </button>

                  {plan.status === "Pending Coach Review" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(planId)}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-0.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg transition text-[7px] sm:text-xs font-medium cursor-pointer"
                      >
                        {actionLoading ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <CheckCircle size={12} />
                        )}
                        <span className="hidden sm:inline">Approve</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReject(planId)}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-0.5 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg transition text-[7px] sm:text-xs font-medium cursor-pointer"
                      >
                        {actionLoading ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <XCircle size={12} />
                        )}
                        <span className="hidden sm:inline">Reject</span>
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Plan Details Modal - محسّن للشاشات الصغيرة */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-1.5 sm:p-4 md:p-6 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-8 max-w-3xl w-full max-h-[95vh] overflow-y-auto min-w-0">
            {/* زر الإغلاق العلوي */}
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-bold mb-0.5 sm:mb-1 break-words">
                  {selectedPlan.level} - {selectedPlan.goal}
                </h2>

                <p className="text-slate-400 text-[8px] sm:text-xs md:text-sm mb-0.5 truncate">
                  {selectedPlan.athlete?.name || selectedPlan.athleteName || "Unknown"}
                </p>

                <p className="text-slate-400 text-[8px] sm:text-xs md:text-sm">
                  Status: {selectedPlan.status === "Approved" 
                    ? "Approved ✅" 
                    : selectedPlan.status === "Rejected" 
                    ? "Rejected ❌" 
                    : "Pending ⏳"}
                </p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-slate-400 hover:text-white p-1 shrink-0"
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            <div className="space-y-2 sm:space-y-4 mb-3 sm:mb-6">
              <div>
                <h3 className="text-xs sm:text-base md:text-lg font-bold mb-1.5 sm:mb-2">
                  Exercises ({selectedPlan.exercises?.length || 0})
                </h3>
                <div className="space-y-1 sm:space-y-2">
                  {(selectedPlan.exercises || []).map((exercise, idx) => (
                    <div 
                      key={exercise._id || idx} 
                      className="bg-slate-800 rounded-lg sm:rounded-xl p-1.5 sm:p-3 md:p-4 flex items-center justify-between gap-1.5 min-w-0"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold text-[8px] sm:text-xs md:text-base truncate">
                          {exercise.name}
                        </h4>
                        <p className="text-slate-400 text-[7px] sm:text-xs">
                          {exercise.sets}×{exercise.reps}
                        </p>
                      </div>
                      {exercise.completed && (
                        <span className="text-emerald-400 text-[7px] sm:text-xs bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                          ✓
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 sm:mt-5">
              <h3 className="text-xs sm:text-base md:text-lg font-bold mb-1.5 sm:mb-2">Coach Feedback</h3>

              <textarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Write your notes..."
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 outline-none focus:border-red-500 text-white placeholder-slate-500 text-[9px] sm:text-xs md:text-sm resize-none"
              />

              <button
                type="button"
                disabled={actionLoading}
                onClick={saveFeedback}
                className="mt-2 sm:mt-3 w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 py-1.5 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer text-[8px] sm:text-xs md:text-sm"
              >
                {actionLoading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Save size={14} />
                )}
                Save Feedback
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              className="mt-2 w-full bg-red-500 hover:bg-red-600 py-1.5 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-semibold transition cursor-pointer text-[8px] sm:text-xs md:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default DashboardAiPlans;