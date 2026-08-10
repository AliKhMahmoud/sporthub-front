import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  Save,
  Trash2,
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

  const totalPlans = plans.length;
  const pendingPlans = plans.filter((plan) => plan.status === "Pending").length;
  const approvedPlans = plans.filter((plan) => plan.status === "Approved").length;
  const rejectedPlans = plans.filter((plan) => plan.status === "Rejected").length;

  const stats = [
    { title: "Total Plans", value: totalPlans, icon: Brain, color: "text-red-400" },
    { title: "Pending", value: pendingPlans, icon: Clock, color: "text-yellow-400" },
    { title: "Approved", value: approvedPlans, icon: CheckCircle, color: "text-emerald-400" },
    { title: "Rejected", value: rejectedPlans, icon: XCircle, color: "text-red-400" },
  ];

  const updateStatus = async (id, status) => {
    try {
      await aiPlanService.updateStatus(id, status);
      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          (plan._id === id || plan.id === id) ? { ...plan, status } : plan
        )
      );

      if (selectedPlan?._id === id || selectedPlan?.id === id) {
        setSelectedPlan((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (error) {
      console.error("Error updating plan status:", error);
    }
  };

  const deletePlan = async (id) => {
    try {
      await aiPlanService.deletePlan(id);
      setPlans((prevPlans) => prevPlans.filter((plan) => plan._id !== id && plan.id !== id));

      if (selectedPlan?._id === id || selectedPlan?.id === id) {
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
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
      await aiPlanService.updateStatus(planId, selectedPlan.status, feedback);

      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          (plan._id === planId || plan.id === planId) ? { ...plan, coachFeedback: feedback } : plan
        )
      );

      setSelectedPlan((prev) => (prev ? { ...prev, coachFeedback: feedback } : null));
    } catch (error) {
      console.error("Error saving feedback:", error);
    } finally {
      setActionLoading(false);
    }
  };

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
          AI Coach Review
        </span>

        <h1 className="text-5xl font-extrabold mt-6 mb-4">
          AI Generated Plans
        </h1>

        <p className="text-slate-400 text-lg">
          Review, approve, reject, delete, or add coach feedback to athlete training plans.
        </p>
      </motion.div>

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

      {plans.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">
          <Brain size={60} className="mx-auto text-red-400 mb-5" />
          <h2 className="text-3xl font-bold mb-3">No Plans Yet</h2>
          <p className="text-slate-400">
            AI generated plans will appear here when athletes create them.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => {
            const planId = plan._id || plan.id || "";
            const athleteName = plan.user?.name || plan.userName || "Unknown Athlete";
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
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-3 rounded-xl transition cursor-pointer"
                    >
                      <Eye size={18} />
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus(planId, "Approved")}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-4 py-3 rounded-xl transition cursor-pointer"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus(planId, "Rejected")}
                      className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-3 rounded-xl transition cursor-pointer"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePlan(planId)}
                      className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 size={18} />
                      Delete
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
                    {plan.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {selectedPlan && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-2">
              {selectedPlan.level} Plan - {selectedPlan.goal}
            </h2>

            <p className="text-slate-400 mb-6">
              Athlete: {selectedPlan.user?.name || selectedPlan.userName || "Unknown"}
            </p>

            <div className="space-y-3 mb-6">
              {(selectedPlan.exercises || []).map((exercise, idx) => (
                <div key={exercise._id || idx} className="bg-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-bold">{exercise.name}</h4>
                    <p className="text-slate-400 text-xs">
                      Sets: {exercise.sets} | Reps: {exercise.reps}
                    </p>
                  </div>
                  {exercise.isCompleted && (
                    <span className="text-emerald-400 text-xs bg-emerald-500/10 px-3 py-1 rounded-full">
                      Completed
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-bold mb-4">Coach Feedback</h3>

              <textarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Write your notes for this athlete..."
                rows={5}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-red-500 text-white"
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