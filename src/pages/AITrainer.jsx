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

  const currentUserId = user?.id || user?.email;

  const [formData, setFormData] = useState({
    goal: "",
    level: "Beginner",
    days: "3",
    condition: "",
    sport: "Fitness",
  });

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
      console.error(error);
      setMyPlans([]);
    }
  };

  useEffect(() => {
    loadMyPlans();
  }, [user]);
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setSavedMessage("");
  };

  const generateLocalPlan = () => {
    return {
      title:
        formData.level +
        " " +
        formData.sport +
        " AI Training Plan",
      days: [
        {
          day: "Day 1",
          focus: "Mobility & Light Strength",
          exercises: [
            "10 min warm-up walk",
            "Bodyweight squats",
            "Light core exercises",
            "Stretching and breathing",
          ],
        },
        {
          day: "Day 2",
          focus: "Technique & Controlled Training",
          exercises: [
            "Dynamic warm-up",
            formData.sport + " basic drills",
            "Low impact cardio",
            "Recovery stretching",
          ],
        },
        {
          day: "Day 3",
          focus: "Endurance & Recovery",
          exercises: [
            "Light jogging or cycling",
            "Resistance band exercises",
            "Balance training",
            "Full body stretching",
          ],
        },
      ],
    };
  };

  const generatePlan = async (event) => {
    event.preventDefault();

    if (!currentUserId) return;

    const generatedPlan = generateLocalPlan();

    setPlan(generatedPlan);

    try {
      await createAiPlan({
        athleteId: currentUserId,
        athleteName: user?.name || "Unknown Athlete",
        athleteEmail: user?.email || "",

        goal: formData.goal,
        sport: formData.sport,
        level: formData.level,
        daysPerWeek: formData.days,
        condition: formData.condition,

        plan: generatedPlan,
      });

      setSavedMessage(
        "Your AI plan has been sent to the coach for review."
      );

      await loadMyPlans();
    } catch (error) {
      console.error(error);
      setSavedMessage(
        "Failed to send the plan. Please try again."
      );
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

    return Math.round(
      (completedDays.length / totalDays) * 100
    );
  };
  const addComment = async (planId) => {
    const text = commentInputs[planId];

    if (!text?.trim()) return;

    try {
      await createAiPlanComment(planId, {
        text,
      });

      setCommentInputs({
        ...commentInputs,
        [planId]: "",
      });

      await loadMyPlans();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteComment = async (planId, commentId) => {
    try {
      await deleteAiPlanComment(
        planId,
        commentId
      );

      await loadMyPlans();
    } catch (error) {
      console.error(error);
    }
  };

  const startEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditingText(comment.text);
  };

  const saveEditedComment = async (
    planId,
    commentId
  ) => {
    if (!editingText.trim()) return;

    try {
      await updateAiPlanComment(
        planId,
        commentId,
        {
          text: editingText,
        }
      );

      setEditingComment(null);
      setEditingText("");

      await loadMyPlans();
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
            className="w-full rounded-xl px-4 py-3 bg-slate-800 text-white"
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
            className="w-full rounded-xl px-4 py-3 bg-slate-800 text-white"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>

          <select
            name="days"
            value={formData.days}
            onChange={handleChange}
            className="w-full rounded-xl px-4 py-3 bg-slate-800 text-white"
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
            className="w-full rounded-xl px-4 py-3 bg-slate-800 text-white"
          />

          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl"
          >
            Generate AI Plan
          </button>

          {savedMessage && (
            <div className="bg-emerald-500/10 p-4 rounded-xl text-emerald-400">
              {savedMessage}
            </div>
          )}
        </motion.form>

        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8">
          {plan ? (
            <>
              <h2 className="text-3xl font-bold mb-6 text-white">
                {plan.title}
              </h2>

              <div className="space-y-4">
                {plan.days.map((item) => (
                  <div
                    key={item.day}
                    className="bg-slate-800 rounded-2xl p-5"
                  >
                    <h3 className="text-xl font-bold text-white mb-3">
                      {item.day}
                    </h3>

                    <p className="text-slate-400 mb-4">
                      {item.focus}
                    </p>

                    <div className="space-y-3">
                      {item.exercises.map((exercise) => (
                        <div
                          key={exercise}
                          className="flex items-center gap-4 bg-slate-900 rounded-xl p-3"
                        >
                          <img
                            src={getExerciseImage(exercise)}
                            alt={exercise}
                            className="w-20 h-16 object-cover rounded-xl"
                          />

                          <span className="text-slate-300">
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
            <p className="text-slate-400">
              Your generated plan will appear here.
            </p>
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
            myPlans.map((item) => (
              <div
                key={item.id}
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
                  className="mt-5 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-3 rounded-xl transition text-slate-900 dark:text-white"
                >
                  <Eye size={18} />
                  View Plan Details
                </button>

                {item.status !== "Approved" && (
                  <div className="mt-5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-xl p-4 flex items-center gap-3">
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
                          style={{
                            width: getProgress(item) + "%",
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {item.plan?.days?.map((day) => {
                        const completed =
                          item.completedDays?.includes(day.day);

                        return (
                          <button
                            key={day.day}
                            type="button"
                            onClick={() =>
                              toggleDayCompletion(item.id, day.day)
                            }
                            className={
                              "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition " +
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
                        onClick={() =>
                          rateCoachFeedback(item.id, star)
                        }
                        className="hover:scale-110 transition"
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
                      value={commentInputs[item.id] || ""}
                      onChange={(event) =>
                        setCommentInputs({
                          ...commentInputs,
                          [item.id]: event.target.value,
                        })
                      }
                      placeholder="Write a comment..."
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white"
                    />

                    <button
                      type="button"
                      onClick={() => addComment(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl"
                    >
                      Add Comment
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(item.comments || []).length === 0 ? (
                      <p className="text-slate-500">
                        No comments yet.
                      </p>
                    ) : (
                      item.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-white dark:bg-slate-900 rounded-xl p-4"
                        >
                          <p className="font-semibold text-red-500">
                            {comment.userName ||
                              comment.authorName ||
                              comment.user?.name ||
                              "User"}
                          </p>

                          {editingComment === comment.id ? (
                            <input
                              value={editingText}
                              onChange={(event) =>
                                setEditingText(event.target.value)
                              }
                              className="w-full mt-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-slate-900 dark:text-white"
                            />
                          ) : (
                            <p className="mt-2 text-slate-700 dark:text-slate-300">
                              {comment.text}
                            </p>
                          )}

                          {String(
                            comment.userId ||comment.authorId ||
                              comment.user?.id
                          ) === String(currentUserId) && (
                            <div className="flex gap-3 mt-3">
                              {editingComment === comment.id ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    saveEditedComment(
                                      item.id,
                                      comment.id
                                    )
                                  }
                                  className="text-emerald-500"
                                >
                                  Save
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    startEditComment(comment)
                                  }
                                  className="text-yellow-500"
                                >
                                  <Pencil size={18} />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  deleteComment(item.id, comment.id)
                                }
                                className="text-red-500"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {selectedSavedPlan && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-5 mb-6">
              <div>
                <span className="text-red-500 font-semibold">
                  Saved AI Plan
                </span>

                <h2 className="text-3xl font-bold mt-2 text-slate-950 dark:text-white">
                  {selectedSavedPlan.plan?.title}
                </h2>

                <p className="text-slate-500 mt-2">
                  Status: {selectedSavedPlan.status}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSavedPlan(null)}
                className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:border-red-500 transition"
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

                        <p className="text-slate-500">
                          {day.focus}
                        </p>
                      </div>
                      {completed && (
                        <span className="text-emerald-500 font-bold flex items-center gap-2">
                          <CheckCircle size={18} />
                          Completed
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {day.exercises.map((exercise) => (
                        <div
                          key={exercise}
                          className="bg-white dark:bg-slate-900 rounded-xl p-3 flex items-center gap-4"
                        >
                          <img
                            src={getExerciseImage(exercise)}
                            alt={exercise}
                            className="w-24 h-20 object-cover rounded-xl"
                          />

                          <p className="text-slate-700 dark:text-slate-300">
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