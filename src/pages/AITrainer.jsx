import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Eye,
  Lock,
  Pencil,
  Star,
  Trash2,
  X,
  Brain,
  Sparkles,
  RefreshCw,
} from "lucide-react";

import Input from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";

import {
  getMyAiPlans,
  createAiPlan,
  rateAiPlanFeedback,
  toggleAiPlanDay,
  createAiPlanComment,
  updateAiPlanComment,
  deleteAiPlanComment,
} from "../services/aiTrainerService";

const getExerciseImage = (exercise) => {
  const text = exercise.toLowerCase();

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
  // مراعاة _id المعتمد في MongoDB
  const currentUserId = user?._id || user?.id || user?.email;

  const [formData, setFormData] = useState({
    goal: "",
    level: "Beginner",
    days: "3",
    condition: "",
    sport: "Fitness",
  });

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [myPlans, setMyPlans] = useState([]);
  const [selectedSavedPlan, setSelectedSavedPlan] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editingText, setEditingText] = useState("");

  const loadMyPlans = async () => {
    try {
      const data = await getMyAiPlans();
      setMyPlans(data || []);
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

  // توليد الأيام ديناميكياً بحسب العدد المحدد في الفروم
  const generateLocalPlan = () => {
    const totalDays = parseInt(formData.days, 10) || 3;
    const daysArr = [];

    for (let i = 1; i <= totalDays; i++) {
      daysArr.push({
        day: `Day ${i}`,
        focus: i % 2 === 1 ? "Mobility & Strength" : "Endurance & Recovery",
        exercises: [
          "Warm-up stretch & mobility",
          `${formData.sport} specific drills`,
          "Core stability exercise",
          "Cool down stretching",
        ],
      });
    }

    return {
      title: `${formData.level} ${formData.sport} AI Plan`,
      days: daysArr,
    };
  };

  const generatePlan = async (event) => {
    event.preventDefault();
    if (!currentUserId) return;

    setLoading(true);
    const generatedPlan = generateLocalPlan();
    setPlan(generatedPlan);

    try {
      await createAiPlan({
        athleteId: currentUserId,
        athleteName: user?.name || user?.username || "Unknown Athlete",
        athleteEmail: user?.email || "",
        goal: formData.goal,
        sport: formData.sport,
        level: formData.level,
        daysPerWeek: formData.days,
        condition: formData.condition,
        plan: generatedPlan,
      });

      setSavedMessage("Your AI plan has been sent to the coach for review.");
      await loadMyPlans();
    } catch (error) {
      console.error(error);
      setSavedMessage("Failed to send the plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const rateCoachFeedback = async (planId, rating) => {
    try {
      await rateAiPlanFeedback(planId, rating);
      await loadMyPlans();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleDayCompletion = async (planId, dayName) => {
    try {
      await toggleAiPlanDay(planId, dayName);
      await loadMyPlans();
    } catch (error) {
      console.error(error);
    }
  };

  const getProgress = (item) => {
    if (item.status !== "Approved") return 0;
    const totalDays = item.plan?.days?.length || 0;
    const completedDays = item.completedDays || [];
    if (totalDays === 0) return 0;
    return Math.round((completedDays.length / totalDays) * 100);
  };

  const addComment = async (planId) => {
    const text = commentInputs[planId];
    if (!text?.trim()) return;

    try {
      await createAiPlanComment(planId, { text });
      setCommentInputs({ ...commentInputs, [planId]: "" });
      await loadMyPlans();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteComment = async (planId, commentId) => {
    try {
      await deleteAiPlanComment(planId, commentId);
      await loadMyPlans();
    } catch (error) {
      console.error(error);
    }
  };

  const startEditComment = (comment) => {
    const commentId = comment._id || comment.id;
    setEditingComment(commentId);
    setEditingText(comment.text);
  };

  const saveEditedComment = async (planId, commentId) => {
    if (!editingText.trim()) return;

    try {
      await updateAiPlanComment(planId, commentId, { text: editingText });
      setEditingComment(null);
      setEditingText("");
      await loadMyPlans();
    } catch (error) {
      console.error(error);
    }
  };

  // التحقق من ملكية التعليق بشرط آمن
  const isCommentOwner = (comment) => {
    const authorId = comment.userId?._id || comment.userId || comment.authorId || comment.user?._id || comment.user?.id;
    return String(authorId) === String(currentUserId);
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-5xl font-extrabold mb-10 text-slate-950 dark:text-white">
        Personalized AI Training Plan
      </h1>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.form
          onSubmit={generatePlan}
          className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-5"
        >
          <Input
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            placeholder="Your goal"
          />

          <select
            name="sport"
            value={formData.sport}
            onChange={handleChange}
            className="w-full rounded-xl px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
          >
            <option>Fitness</option>
            <option>Boxing</option>
            <option>Bodybuilding</option>
            <option>Karate</option>
            <option>Taekwondo</option>
          </select>

          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full rounded-xl px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>

          <select
            name="days"
            value={formData.days}
            onChange={handleChange}
            className="w-full rounded-xl px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
          >
            <option value="3">3 Days / Week</option>
            <option value="4">4 Days / Week</option>
            <option value="5">5 Days / Week</option>
          </select>

          <textarea
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            rows="5"
            placeholder="Condition or injury"
            className="w-full rounded-xl px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 outline-none focus:border-red-500"
          />

          <button
            type="submit"
            disabled={loading}
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
          {plan ? (
            <>
              <h2 className="text-3xl font-bold mb-6 text-white">
                {plan.title}
              </h2>

              <div className="space-y-4">
                {plan.days.map((item) => (
                  <div
                    key={item.day}
                    className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/50"
                  >
                    <h3 className="text-xl font-bold text-white mb-1">
                      {item.day}
                    </h3>

                    <p className="text-slate-400 text-sm mb-4">
                      {item.focus}
                    </p>

                    <div className="space-y-3">
                      {item.exercises.map((exercise, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 bg-slate-900 rounded-xl p-3"
                        >
                          <img
                            src={getExerciseImage(exercise)}
                            alt={exercise}
                            className="w-20 h-16 object-cover rounded-xl"
                          />

                          <span className="text-slate-300 text-sm">
                            {exercise}
                          </span>
                        </div>
                      ))}
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
              return (
                <div
                  key={planId}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                        {item.plan?.title}
                      </h3>

                      <p className="mt-2 text-slate-500">
                        Goal: {item.goal || "Not specified"}
                      </p>
                    </div>

                    <span
                      className={
                        item.status === "Approved"
                          ? "text-emerald-500 font-bold"
                          : item.status === "Rejected"
                          ? "text-red-500 font-bold"
                          : "text-yellow-500 font-bold"
                      }
                    >
                      {item.status}
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

                  {item.status !== "Approved" && (
                    <div className="mt-5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-xl p-4 flex items-center gap-3 text-sm">
                      <Lock size={18} />
                      Waiting for coach approval before training can begin.
                    </div>
                  )}

                  {item.status === "Approved" && (
                    <>
                      <div className="mt-6">
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold text-slate-950 dark:text-white">
                            Progress
                          </span>

                          <span className="font-bold text-red-500">
                            {getProgress(item)}%
                          </span>
                        </div>

                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-red-500 h-4 transition-all"
                            style={{ width: `${getProgress(item)}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        {item.plan?.days?.map((day) => {
                          const completed = item.completedDays?.includes(day.day);

                          return (
                            <button
                              key={day.day}
                              type="button"
                              onClick={() => toggleDayCompletion(planId, day.day)}
                              className={
                                "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition cursor-pointer " +
                                (completed
                                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                                  : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white")
                              }
                            >
                              <span>{day.day}</span>
                              {completed && <CheckCircle size={18} />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  <div className="mt-6 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
                    <p className="font-semibold mb-3 text-slate-950 dark:text-white">
                      Rate Coach Feedback
                    </p>

                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => rateCoachFeedback(planId, star)}
                          className="hover:scale-110 transition cursor-pointer"
                        >
                          <Star
                            size={28}
                            className={
                              star <= (item.coachRating || 0)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-slate-400"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 bg-slate-100 dark:bg-slate-800 rounded-2xl p-5">
                    <h4 className="text-xl font-bold mb-4 text-slate-950 dark:text-white">
                      Plan Comments
                    </h4>

                    <div className="flex flex-col md:flex-row gap-3 mb-5">
                      <input
                        value={commentInputs[planId] || ""}
                        onChange={(event) =>
                          setCommentInputs({
                            ...commentInputs,
                            [planId]: event.target.value,
                          })
                        }
                        placeholder="Write a comment..."
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-red-500"
                      />

                      <button
                        type="button"
                        onClick={() => addComment(planId)}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer transition"
                      >
                        Add Comment
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(item.comments || []).length === 0 ? (
                        <p className="text-slate-500 text-sm">No comments yet.</p>
                      ) : (
                        item.comments.map((comment) => {
                          const commentId = comment._id || comment.id;
                          return (
                            <div
                              key={commentId}
                              className="bg-white dark:bg-slate-900 rounded-xl p-4"
                            >
                              <p className="font-semibold text-red-500 text-sm">
                                {comment.userName ||
                                  comment.authorName ||
                                  comment.user?.name ||
                                  "User"}
                              </p>

                              {editingComment === commentId ? (
                                <input
                                  value={editingText}
                                  onChange={(event) =>
                                    setEditingText(event.target.value)
                                  }
                                  className="w-full mt-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-slate-900 dark:text-white outline-none border border-red-500"
                                />
                              ) : (
                                <p className="mt-2 text-slate-700 dark:text-slate-300 text-sm">
                                  {comment.text}
                                </p>
                              )}

                              {isCommentOwner(comment) && (
                                <div className="flex gap-3 mt-3">
                                  {editingComment === commentId ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        saveEditedComment(planId, commentId)
                                      }
                                      className="text-emerald-500 text-sm font-semibold cursor-pointer"
                                    >
                                      Save
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => startEditComment(comment)}
                                      className="text-yellow-500 cursor-pointer"
                                    >
                                      <Pencil size={18} />
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteComment(planId, commentId)
                                    }
                                    className="text-red-500 cursor-pointer"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
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
                  {selectedSavedPlan.plan?.title}
                </h2>

                <p className="text-slate-500 text-sm mt-1">
                  Status: {selectedSavedPlan.status}
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

            <div className="space-y-5">
              {selectedSavedPlan.plan?.days?.map((day) => {
                const completed =
                  selectedSavedPlan.completedDays?.includes(day.day);

                return (
                  <div
                    key={day.day}
                    className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                          {day.day}
                        </h3>

                        <p className="text-slate-500 text-sm">{day.focus}</p>
                      </div>

                      {completed && (
                        <span className="text-emerald-500 font-bold flex items-center gap-2 text-sm">
                          <CheckCircle size={18} />
                          Completed
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {day.exercises.map((exercise, idx) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-slate-900 rounded-xl p-3 flex items-center gap-4"
                        >
                          <img
                            src={getExerciseImage(exercise)}
                            alt={exercise}
                            className="w-24 h-20 object-cover rounded-xl"
                          />

                          <p className="text-slate-700 dark:text-slate-300 text-sm">
                            {exercise}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AiTrainer;