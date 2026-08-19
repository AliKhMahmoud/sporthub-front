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
} from "lucide-react";

import aiPlanService from "../services/aiPlanService";

function DashboardAiPlans() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // ✅ Tab state

  // ✅ Load plans on mount
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

  // ✅ Auto-refresh every 10 seconds (optional)
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

  // ✅ Filter plans based on active tab
  const filteredPlans = plans.filter((plan) => {
    if (activeTab === "pending") return plan.status === "Pending Coach Review";
    if (activeTab === "approved") return plan.status === "Approved";
    if (activeTab === "rejected") return plan.status === "Rejected";
    return true; // "all" tab
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
    { id: "all", label: "All Plans", count: totalPlans },
    { id: "pending", label: "Pending", count: pendingPlans },
    { id: "approved", label: "Approved", count: approvedPlans },
    { id: "rejected", label: "Rejected", count: rejectedPlans },
  ];

  // ✅ Approve plan
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

  // ✅ Reject plan
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

  // ✅ Open plan details
  const openPlan = (plan) => {
    setSelectedPlan(plan);
    setFeedback(plan.coachFeedback || "");
  };

  // ✅ Save feedback
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

  // ✅ Loading state
  if (loading) {
    return (
      <main className="p-10 text-white flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-red-500 mb-4" size={40} />
        <p className="text-slate-400">Loading AI Plans...</p>
      </main>
    );
  }

  return (
    <main className="p-10 text-white">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <span className="bg-red-500/10 text-red-400 px-4 py-2 rounded-full font-semibold">
          Coach Review
        </span>

        <h1 className="text-5xl font-extrabold mt-6 mb-4">
          AI Generated Plans
        </h1>

        <p className="text-slate-400 text-lg">
          Review, approve, reject, or add coach feedback to athlete training plans.
        </p>
      </motion.div>

      {/* ✅ Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6"
            >
              <Icon size={28} className={`${stat.color} mb-4`} />
              <p className="text-slate-400 mb-2">{stat.title}</p>
              <h2 className="text-4xl font-bold">{stat.value}</h2>
            </div>
          );
        })}
      </section>

      {/* ✅ Tabs Section */}
      <div className="mb-8">
        <div className="flex gap-2 border-b border-slate-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-6 font-semibold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-red-500 text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-sm bg-slate-800 px-2 py-1 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ✅ Empty State */}
      {filteredPlans.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">
          <Brain size={60} className="mx-auto text-red-400 mb-5" />
          <h2 className="text-3xl font-bold mb-3">No Plans Found</h2>
          <p className="text-slate-400">
            {activeTab === "all"
              ? "AI-generated plans will appear here when athletes create them."
              : `No ${activeTab} plans at the moment.`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPlans.map((plan) => {
            const planId = plan._id || plan.id || "";
            const athleteName = plan.athlete?.name || plan.athleteName || "Unknown Athlete";
            const sportName = typeof plan.sport === "object" ? plan.sport?.name : plan.sport;

            return (
              <motion.div
                key={planId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  <div>
                    <h2 className="text-2xl font-bold">{athleteName}</h2>
                    <p className="text-slate-400 mt-2">
                      Goal: {plan.goal || "Not specified"}
                    </p>
                    <p className="text-slate-400">
                      Sport: {sportName || "Not specified"}
                    </p>
                    <p className="text-slate-400">
                      Condition: {plan.condition || "None"}
                    </p>
                    <p className="text-slate-400">
                      Level: {plan.level || "Not specified"}
                    </p>

                    {plan.coachFeedback && (
                      <p className="text-emerald-400 mt-3 flex items-center gap-2">
                        <MessageSquare size={17} />
                        Coach feedback added
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openPlan(plan)}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-3 rounded-xl transition cursor-pointer disabled:opacity-50"
                      disabled={actionLoading}
                    >
                      <Eye size={18} />
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(planId)}
                      disabled={actionLoading || plan.status !== "Pending Coach Review"}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 px-4 py-3 rounded-xl transition cursor-pointer"
                    >
                      {actionLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <CheckCircle size={18} />
                      )}
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReject(planId)}
                      disabled={actionLoading || plan.status !== "Pending Coach Review"}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 px-4 py-3 rounded-xl transition cursor-pointer"
                    >
                      {actionLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <XCircle size={18} />
                      )}
                      Reject
                    </button>
                  </div>
                </div>

                <div className="mt-5">
                  <span
                    className={
                      "px-4 py-2 rounded-full text-sm font-semibold " +
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
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ✅ Modal for viewing details and adding feedback */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-2">
              {selectedPlan.level} - {selectedPlan.goal}
            </h2>

            <p className="text-slate-400 mb-2">
              Athlete: {selectedPlan.athlete?.name || selectedPlan.athleteName || "Unknown"}
            </p>

            <p className="text-slate-400 mb-6">
              Status: {selectedPlan.status === "Approved" 
                ? "Approved ✅" 
                : selectedPlan.status === "Rejected" 
                ? "Rejected ❌" 
                : "Pending ⏳"}
            </p>

            {/* ✅ Exercises */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xl font-bold mb-4">Exercises ({selectedPlan.exercises?.length || 0})</h3>
              {(selectedPlan.exercises || []).map((exercise, idx) => (
                <div 
                  key={exercise._id || idx} 
                  className="bg-slate-800 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h4 className="text-white font-bold">{exercise.name}</h4>
                    <p className="text-slate-400 text-sm">
                      Sets: {exercise.sets} | Reps: {exercise.reps}
                    </p>
                  </div>
                  {exercise.completed && (
                    <span className="text-emerald-400 text-xs bg-emerald-500/10 px-3 py-1 rounded-full">
                      Completed
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* ✅ Coach Feedback */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-4">Coach Feedback</h3>

              <textarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Write your notes for this athlete..."
                rows={5}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-red-500 text-white placeholder-slate-500"
              />

              <button
                type="button"
                disabled={actionLoading}
                onClick={saveFeedback}
                className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {actionLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                Save Feedback
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              className="mt-4 w-full bg-red-500 hover:bg-red-600 py-4 rounded-xl font-semibold transition cursor-pointer"
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