import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, X, Edit, Trash2, Plus, AlertCircle, RotateCcw } from "lucide-react";

import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

import { getSportById } from "../services/sportsService";
import { startPlan, getActiveProgress, toggleExercise } from "../services/workoutProgressService";
import { createPlan, deletePlan, getPlans, updatePlan } from "../services/planService";
import { CustomAlert } from "../components/CustomAlert";

function SportsDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const plansRef = useRef(null);

  const [sport, setSport] = useState(null);
  const [loadingSport, setLoadingSport] = useState(true);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [activeProgress, setActiveProgress] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // حالات نافذة الإضافة أو التعديل (Modal States)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);

  // حالة الفورم مطابقة لـ Joi Validation
  const [planForm, setPlanForm] = useState({
    title: "",
    description: "",
    level: "beginner",
    durationWeeks: 4,
    exercises: [{ name: "", sets: 3, reps: 10 }]
  });

  // حالة لتخزين رسالة الخطأ لتظهر داخل الفورم
  const [formError, setFormError] = useState("");

  // 1. جلب الرياضة والخطط الخاصة بها
  useEffect(() => {
    const fetchSportDetails = async () => {
      try {
        setLoadingSport(true);
        const response = await getSportById(id);
        const sportData = response.data || response;
        setSport(sportData);

        if (sportData) {
          const plansRes = await getPlans(sportData.slug);
          const plansList = plansRes.data || plansRes;
          setPlans(Array.isArray(plansList) ? plansList : []);
        }
      } catch (error) {
        console.error("Error fetching details:", error);
        CustomAlert.error(error, "Failed to load sport details");
      } finally {
        setLoadingSport(false);
      }
    };
    if (id) fetchSportDetails();
  }, [id]);

  // جلب حالة التقدم عندما يتم اختيار خطة معينة (للرياضي)
  useEffect(() => {
    const fetchActiveProgress = async () => {
      if (!selectedPlan || user?.role !== "athlete") return;
      try {
        setLoadingProgress(true);
        const res = await getActiveProgress(selectedPlan._id);
        setActiveProgress(res.data || res);
      } catch (error) {
        setActiveProgress(null);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchActiveProgress();
  }, [selectedPlan, user?.role]);

  // --- التحقق من ملكية الكوتش للرياضة باستخدام user.sport ---
  const userSportId = typeof user?.sport === "object" ? user?.sport?._id : user?.sport;
  const currentSportId = sport?._id || id;

  const coachId = typeof sport?.coach === "object" ? sport?.coach?._id : sport?.coach;
  const createdById = typeof sport?.createdBy === "object" ? sport?.createdBy?._id : sport?.createdBy;
  const currentUserId = user?._id || user?.id;

  const isOwnerCoach =
    user?.role === "admin" ||
    (user?.role === "coach" &&
      ((userSportId && currentSportId && String(userSportId) === String(currentSportId)) ||
        (currentUserId && (String(coachId) === String(currentUserId) || String(createdById) === String(currentUserId)))));

  // دالة بدء الخطة التدريبية (لرياضي)
  const handleStartWorkout = async () => {
    try {
      const res = await startPlan(selectedPlan._id);
      setActiveProgress(res.data || res);
      CustomAlert.success("Workout Started", "You have successfully started this training plan!");
    } catch (error) {
      console.error("Error starting plan:", error);
      CustomAlert.error(error, "Failed to start workout");
    }
  };

  // دالة إعادة تشغيل الخطة (Reset Workout)
  const handleRestartWorkout = async () => {
    const isConfirmed = await CustomAlert.confirmDelete(
      "Restart Workout Plan",
      "Are you sure you want to reset your progress for this plan?",
      "Yes, Restart"
    );

    if (!isConfirmed) return;

    try {
      const res = await startPlan(selectedPlan._id);
      setActiveProgress(res.data || res);
      CustomAlert.success("Workout Restarted", "Your progress for this plan has been reset.");
    } catch (error) {
      console.error("Error restarting plan:", error);
      CustomAlert.error(error, "Failed to restart workout");
    }
  };

  // دالة الضغط على التمرين (Check / Uncheck)
  const handleToggleExercise = async (exerciseName) => {
    if (!activeProgress) return;
    try {
      const res = await toggleExercise(activeProgress._id, exerciseName);
      setActiveProgress(res.data || res);
    } catch (error) {
      console.error("Error updating exercise:", error);
      CustomAlert.error(error, "Failed to update exercise status");
    }
  };

  // فتح نافذة الإضافة
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentPlanId(null);
    setFormError("");
    setPlanForm({
      title: "",
      description: "",
      level: "beginner",
      durationWeeks: 4,
      exercises: [{ name: "", sets: 3, reps: 10 }]
    });
    setIsModalOpen(true);
  };

  // فتح نافذة التعديل
  const handleOpenEditModal = (plan, e) => {
    e.stopPropagation();
    setIsEditing(true);
    setCurrentPlanId(plan._id);
    setFormError("");
    setPlanForm({
      title: plan.title,
      description: plan.description,
      level: plan.level || "beginner",
      durationWeeks: plan.durationWeeks || 4,
      exercises: plan.exercises && plan.exercises.length > 0 ? plan.exercises : [{ name: "", sets: 3, reps: 10 }]
    });
    setIsModalOpen(true);
  };

  // حفظ الخطة (إضافة أو تعديل)
  const handleSavePlan = async (e) => {
    e.preventDefault();
    setFormError("");

    try {
      const payload = {
        ...planForm,
        sport: sport.slug
      };

      if (isEditing) {
        const res = await updatePlan(currentPlanId, payload);
        const updated = res.data || res;
        setPlans(plans.map((p) => (p._id === currentPlanId ? updated : p)));
        if (selectedPlan?._id === currentPlanId) setSelectedPlan(updated);
        CustomAlert.success("Plan Updated", "Training plan has been updated successfully.");
      } else {
        const res = await createPlan(payload);
        const newPlan = res.data || res;
        setPlans([...plans, newPlan]);
        CustomAlert.success("Plan Created", "New training plan has been added successfully.");
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving plan:", error);
      const errorMessage = error.response?.data?.message || "Failed to save plan. Please check your inputs.";
      setFormError(errorMessage);
    }
  };

  // دالة حذف الخطة
  const handleDeletePlan = async (planId, e) => {
    e.stopPropagation();

    const planToDelete = plans.find((p) => p._id === planId);
    const planTitle = planToDelete ? planToDelete.title : "this plan";

    const isConfirmed = await CustomAlert.confirmDelete(
      "Delete Training Plan",
      `Are you sure you want to delete "${planTitle}"? This action cannot be undone.`,
      "Yes, Delete Plan"
    );

    if (!isConfirmed) return;

    try {
      await deletePlan(planId);
      setPlans((prevPlans) => prevPlans.filter((p) => p._id !== planId));
      if (selectedPlan?._id === planId) setSelectedPlan(null);

      CustomAlert.success("Plan Deleted", `"${planTitle}" was deleted successfully.`);
    } catch (error) {
      console.error("Error deleting plan:", error);
      CustomAlert.error(error, "Failed to delete plan");
    }
  };

  // إدارة مصفوفة التمارين داخل Form
  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...planForm.exercises];
    updatedExercises[index][field] = value;
    setPlanForm({ ...planForm, exercises: updatedExercises });
  };

  const handleAddExerciseRow = () => {
    setPlanForm({
      ...planForm,
      exercises: [...planForm.exercises, { name: "", sets: 3, reps: 10 }]
    });
  };

  const handleRemoveExerciseRow = (index) => {
    const updatedExercises = planForm.exercises.filter((_, i) => i !== index);
    setPlanForm({ ...planForm, exercises: updatedExercises });
  };

  if (loadingSport) {
    return (
      <main className="bg-slate-950 text-white min-h-screen py-16 flex items-center justify-center">
        <div className="text-slate-400 animate-pulse text-lg">Loading sport details...</div>
      </main>
    );
  }

  return (
    <main className="bg-slate-950 text-white min-h-screen py-16">
      <Container>
        {/* قسم خطط التدريب */}
        <section ref={plansRef} className="mt-12">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-4xl font-bold">{sport?.name || "Training"} Plans</h2>
                <p className="text-slate-400 mt-2">{sport?.description}</p>
              </div>

              {/* يظهر الزر فقط إذا كان المستخدم أدمن أو الكوتش المالك لهذه الرياضة */}
              {isOwnerCoach && (
                <Button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
                  <Plus size={20} /> Add New Plan
                </Button>
              )}
            </div>

            {/* عرض الخطط */}
            {plans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan._id}
                    onClick={() => setSelectedPlan(plan)}
                    className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-red-500 transition cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-red-400 font-semibold capitalize text-sm bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                          {plan.level}
                        </span>

                        {/* أزرار التعديل والحذف تظهر فقط للمدرب المسؤول عن هذه الرياضة */}
                        {isOwnerCoach && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleOpenEditModal(plan, e)}
                              className="text-slate-400 hover:text-white p-1 transition"
                              title="Edit Plan"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={(e) => handleDeletePlan(plan._id, e)}
                              className="text-slate-400 hover:text-red-500 p-1 transition"
                              title="Delete Plan"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </div>

                      <h3 className="text-2xl font-bold my-3">{plan.title}</h3>
                      <p className="text-slate-400 mb-5 line-clamp-2 text-sm">{plan.description}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 mb-4">Duration: {plan.durationWeeks} weeks</p>
                      <Button variant="secondary" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-800">
                <p className="text-slate-400 text-lg">No training plans available for this sport yet.</p>
                {isOwnerCoach && (
                  <p className="text-slate-500 text-sm mt-1">Click the button above to add the first plan.</p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* عرض تفاصيل الخطة المحددة */}
        {selectedPlan && (
          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold">{selectedPlan.title}</h3>
              <button onClick={() => setSelectedPlan(null)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <p className="text-slate-300 mb-2">{selectedPlan.description}</p>
            <p className="text-sm text-red-400 font-medium mb-6">
              Level: {selectedPlan.level} | Duration: {selectedPlan.durationWeeks} weeks
            </p>

            {user?.role === "athlete" && !activeProgress && (
              <Button onClick={handleStartWorkout} className="bg-red-600 hover:bg-red-700">
                Begin Workout Plan
              </Button>
            )}

            {activeProgress && user?.role === "athlete" && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Progress: {activeProgress.progressPercentage}%</span>
                  <button
                    onClick={handleRestartWorkout}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/50 px-3 py-1.5 rounded-xl transition"
                    title="Restart Plan"
                  >
                    <RotateCcw size={16} /> Restart Plan
                  </button>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full mb-6 overflow-hidden">
                  <div
                    className="bg-red-500 h-full transition-all duration-300"
                    style={{ width: `${activeProgress.progressPercentage}%` }}
                  ></div>
                </div>

                <h4 className="text-xl font-semibold mb-4">Exercises:</h4>
                <div className="space-y-3">
                  {selectedPlan.exercises?.map((ex, index) => {
                    const isCompleted = activeProgress.completedExercises?.includes(ex.name);
                    return (
                      <div
                        key={index}
                        onClick={() => handleToggleExercise(ex.name)}
                        className={`flex justify-between items-center p-4 rounded-xl border cursor-pointer transition ${
                          isCompleted ? "bg-red-950/30 border-red-500" : "bg-slate-800 border-slate-700 hover:border-slate-600"
                        }`}
                      >
                        <div>
                          <h5 className="font-bold text-lg">{ex.name}</h5>
                          <p className="text-sm text-slate-400">Sets: {ex.sets} | Reps: {ex.reps}</p>
                        </div>
                        <CheckCircle className={isCompleted ? "text-red-500" : "text-slate-600"} size={24} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {user?.role !== "athlete" && (
              <div className="mt-6">
                <h4 className="text-xl font-semibold mb-4">Exercises List:</h4>
                <div className="space-y-3">
                  {selectedPlan.exercises?.map((ex, index) => (
                    <div key={index} className="flex justify-between items-center p-4 rounded-xl border bg-slate-800 border-slate-700">
                      <h5 className="font-bold text-lg">{ex.name}</h5>
                      <p className="text-sm text-slate-400">Sets: {ex.sets} | Reps: {ex.reps}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal الإضافة والتعديل */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">{isEditing ? "Edit Plan" : "Add New Plan"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {formError && (
                <div className="mb-6 bg-red-950/50 border border-red-500 text-red-300 p-4 rounded-xl flex items-center gap-3 text-sm">
                  <AlertCircle size={20} className="shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSavePlan} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={planForm.title}
                    onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="e.g. Advanced Muscle Building"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    rows="3"
                    required
                    value={planForm.description}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                    placeholder="Plan description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Level</label>
                    <select
                      value={planForm.level}
                      onChange={(e) => setPlanForm({ ...planForm, level: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Duration (Weeks)</label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      required
                      value={planForm.durationWeeks}
                      onChange={(e) => setPlanForm({ ...planForm, durationWeeks: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium">Exercises</label>
                    <button type="button" onClick={handleAddExerciseRow} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1">
                      <Plus size={16} /> Add Exercise
                    </button>
                  </div>

                  <div className="space-y-3">
                    {planForm.exercises.map((ex, index) => (
                      <div key={index} className="flex gap-2 items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                        <input
                          type="text"
                          placeholder="Exercise Name"
                          required
                          value={ex.name}
                          onChange={(e) => handleExerciseChange(index, "name", e.target.value)}
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white"
                        />
                        <input
                          type="number"
                          placeholder="Sets"
                          min="1"
                          required
                          value={ex.sets}
                          onChange={(e) => handleExerciseChange(index, "sets", Number(e.target.value))}
                          className="w-20 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white"
                        />
                        <input
                          type="number"
                          placeholder="Reps"
                          min="1"
                          required
                          value={ex.reps}
                          onChange={(e) => handleExerciseChange(index, "reps", Number(e.target.value))}
                          className="w-20 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white"
                        />
                        {planForm.exercises.length > 1 && (
                          <button type="button" onClick={() => handleRemoveExerciseRow(index)} className="text-slate-400 hover:text-red-500 p-1">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700">
                    {isEditing ? "Update Plan" : "Create Plan"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}

export default SportsDetails;