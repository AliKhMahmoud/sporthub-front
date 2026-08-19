import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Eye,
  Lock,
  X,
  Brain,
  Sparkles,
  RefreshCw,
} from "lucide-react";

import Input from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import aiPlanService from "../services/aiPlanService";
import { getAllSports } from "../services/sportsService";

const getExerciseImage = (name = "") => {
  const text = name.toLowerCase();

  if (text.includes("walk") || text.includes("jogging")) {
    return "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=600&auto=format&fit=crop";
  }
  if (text.includes("squat") || text.includes("strength")) {
    return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop";
  }
  if (text.includes("core") || text.includes("balance")) {
    return "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop";
  }
  if (text.includes("stretch")) {
    return "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop";
  }
  if (text.includes("cardio") || text.includes("cycling")) {
    return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&auto=format&fit=crop";
  }

  return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600&auto=format&fit=crop";
};

function AiTrainer() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    goal: "",
    level: "Beginner",
    durationWeeks: "4",
    condition: "",
    sport: "", // ObjectId للرياضة
  });

  const [sports, setSports] = useState([]);
  const [loadingSports, setLoadingSports] = useState(false);

  const [loading, setLoading] = useState(false);
  const [createdPlan, setCreatedPlan] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [myPlans, setMyPlans] = useState([]);
  const [selectedSavedPlan, setSelectedSavedPlan] = useState(null);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        setLoadingSports(true);
        const data = await getAllSports();
        const sportsList = data?.data || data || [];
        setSports(Array.isArray(sportsList) ? sportsList : []);
      } catch (error) {
        console.error("Error fetching sports:", error);
        setSports([]);
      } finally {
        setLoadingSports(false);
      }
    };

    fetchSports();
  }, []);

  const loadMyPlans = async () => {
    try {
      const response = await aiPlanService.getPlans();
      const plansList = response.data || response || [];
      setMyPlans(Array.isArray(plansList) ? plansList : []);
    } catch (error) {
      console.error("Error loading plans:", error);
      setMyPlans([]);
    }
  };

  useEffect(() => {
    if (user) {
      loadMyPlans();
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSavedMessage("");
  };

  const handleCreatePlan = async (event) => {
    event.preventDefault();
    if (!formData.sport || !formData.goal) return;

    setLoading(true);
    try {
      const response = await aiPlanService.createPlan({
        sport: formData.sport,
        goal: formData.goal,
        level: formData.level,
        durationWeeks: Number(formData.durationWeeks),
        condition: formData.condition,
      });

      const newPlan = response.data || response;
      setCreatedPlan(newPlan);
      setSavedMessage("Your AI plan has been created and sent to the coach.");
      await loadMyPlans();
    } catch (error) {
      console.error(error);
      setSavedMessage("Failed to create the plan. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExercise = async (planId, exerciseId) => {
    try {
      await aiPlanService.toggleExercise(planId, exerciseId);
      await loadMyPlans();
      if (selectedSavedPlan && (selectedSavedPlan._id || selectedSavedPlan.id) === planId) {
        const updated = await aiPlanService.getPlanById(planId);
        setSelectedSavedPlan(updated.data || updated);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-5xl font-extrabold mb-10 text-slate-950 dark:text-white">
        Personalized AI Training Plan
      </h1>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.form
          onSubmit={handleCreatePlan}
          className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-5"
        >
          <Input
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            placeholder="Your goal (min 5 chars)"
          />

          <select
            name="sport"
            value={formData.sport}
            onChange={handleChange}
            disabled={loadingSports}
            className="w-full rounded-xl px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 outline-none focus:border-red-500"
          >
            <option value="">
              {loadingSports ? "Loading sports..." : "Select Sport"}
            </option>
            {sports.map((s) => {
              const sportId = s._id || s.id;
              return (
                <option key={sportId} value={sportId}>
                  {s.name}
                </option>
              );
            })}
          </select>

          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full rounded-xl px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            name="durationWeeks"
            value={formData.durationWeeks}
            onChange={handleChange}
            className="w-full rounded-xl px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
          >
            <option value="2">2 Weeks</option>
            <option value="4">4 Weeks</option>
            <option value="8">8 Weeks</option>
            <option value="12">12 Weeks</option>
          </select>

          <textarea
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            rows="5"
            placeholder="Condition or injury (optional)"
            className="w-full rounded-xl px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 outline-none focus:border-red-500"
          />

          <button
            type="submit"
            disabled={loading || !formData.sport}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={18} />
                Generating Plan...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate AI Plan
              </>
            )}
          </button>

          {savedMessage && (
            <div className="bg-emerald-500/10 p-4 rounded-xl text-emerald-400 text-sm">
              {savedMessage}
            </div>
          )}
        </motion.form>

        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 border border-slate-800">
          {createdPlan ? (
            <>
              <h2 className="text-3xl font-bold mb-6 text-white">
                {createdPlan.level} Plan - {createdPlan.goal}
              </h2>

              <div className="space-y-3">
                {(createdPlan.exercises || []).map((ex, idx) => (
                  <div
                    key={ex._id || idx}
                    className="flex items-center gap-4 bg-slate-800 rounded-xl p-3"
                  >
                    <img
                      src={getExerciseImage(ex.name)}
                      alt={ex.name}
                      className="w-20 h-16 object-cover rounded-xl"
                    />
                    <div>
                      <h4 className="text-white font-semibold">{ex.name}</h4>
                      <p className="text-slate-400 text-xs">
                        Sets: {ex.sets} | Reps: {ex.reps}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
              <Brain size={48} className="mb-4" />
              <p>Your generated plan will appear here.</p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-4xl font-bold mb-8 text-slate-950 dark:text-white">
          My AI Plans
        </h2>

        <div className="space-y-5">
          {myPlans.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                No AI plans yet.
              </p>
            </div>
          ) : (
            myPlans.map((item) => {
              const planId = item._id || item.id;
              const isPending = item.status === "Pending Coach Review";
              const isApproved = item.status === "Approved";
              const isRejected = item.status === "Rejected";

              return (
                <div
                  key={planId}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                        {item.level} Plan
                      </h3>
                      <p className="mt-2 text-slate-500">
                        Goal: {item.goal || "Not specified"}
                      </p>
                    </div>

                    <span
                      className={
                        isApproved
                          ? "text-emerald-500 font-bold"
                          : isRejected
                          ? "text-red-500 font-bold"
                          : "text-yellow-500 font-bold"
                      }
                    >
                      {isApproved ? "Approved" : isRejected ? "Rejected" : "Pending Coach Review"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedSavedPlan(item)}
                    className="mt-5 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-3 rounded-xl transition text-slate-900 dark:text-white cursor-pointer"
                  >
                    <Eye size={18} />
                    View Plan Details
                  </button>

                  {/* ✅ ONLY show waiting message if Pending */}
                  {isPending && (
                    <div className="mt-5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 rounded-xl p-4 flex items-center gap-3 text-sm">
                      <Lock size={18} />
                      Waiting for coach approval before training can begin.
                    </div>
                  )}

                  {/* ✅ Show rejection message if Rejected */}
                  {isRejected && (
                    <div className="mt-5 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl p-4 flex items-center gap-3 text-sm">
                      <Lock size={18} />
                      This plan has been rejected by your coach.
                    </div>
                  )}

                  {/* ✅ Progress Bar - ONLY show if Approved (from Backend) */}
                  {isApproved && (
                    <div className="mt-6">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-slate-950 dark:text-white">
                          Progress
                        </span>
                        <span className="font-bold text-red-500">
                          {item.progress || 0}%
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress || 0}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="bg-red-500 h-4 rounded-full"
                        />
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        {item.completedExercises || 0} of {item.totalExercises || 0} exercises completed
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {selectedSavedPlan && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-5 mb-6">
              <div>
                <span className="text-red-500 font-semibold text-sm">
                  Saved AI Plan
                </span>
                <h2 className="text-3xl font-bold mt-2 text-slate-950 dark:text-white">
                  {selectedSavedPlan.level} Plan
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Status: {selectedSavedPlan.status === "Approved" 
                    ? "Approved ✅" 
                    : selectedSavedPlan.status === "Rejected" 
                    ? "Rejected ❌" 
                    : "Pending ⏳"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSavedPlan(null)}
                className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:border-red-500 transition cursor-pointer text-slate-900 dark:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* ✅ ONLY show exercises if Approved */}
            {selectedSavedPlan.status === "Approved" ? (
              <div className="space-y-3">
                {(selectedSavedPlan.exercises || []).map((ex) => {
                  const planId = selectedSavedPlan._id || selectedSavedPlan.id;
                  const exId = ex._id || ex.id;

                  return (
                    <div
                      key={exId}
                      className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={getExerciseImage(ex.name)}
                          alt={ex.name}
                          className="w-20 h-16 object-cover rounded-xl"
                        />
                        <div>
                          <h4 className="text-slate-950 dark:text-white font-bold">
                            {ex.name}
                          </h4>
                          <p className="text-slate-500 text-xs">
                            Sets: {ex.sets} | Reps: {ex.reps}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleExercise(planId, exId)}
                        className={
                          "flex items-center gap-2 px-4 py-2 rounded-xl border transition cursor-pointer text-sm font-semibold " +
                          (ex.completed
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                            : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300")
                        }
                      >
                        <span>{ex.completed ? "Completed" : "Mark Done"}</span>
                        {ex.completed && <CheckCircle size={16} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 text-center">
                <p className="text-slate-600 dark:text-slate-400">
                  {selectedSavedPlan.status === "Rejected"
                    ? "This plan has been rejected by your coach. Please create a new plan."
                    : "Exercises will be available once your coach approves this plan."}
                </p>
              </div>
            )}

            {/* ✅ Coach Feedback - show if exists */}
            {selectedSavedPlan.coachFeedback && (
              <div className="mt-6 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                  Coach Feedback
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedSavedPlan.coachFeedback}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default AiTrainer;