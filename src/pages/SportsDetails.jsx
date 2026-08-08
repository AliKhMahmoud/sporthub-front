import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, X, Edit, Trash2, Plus, AlertCircle } from "lucide-react";

import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

import { getSportById } from "../services/sportsService";
import { startPlan, getActiveProgress, toggleExercise } from "../services/workoutProgressService";
import { createPlan, deletePlan, getPlans, updatePlan } from "../services/planService";

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
  
  // حالة الفورم مطابقة لـ Joi Validation (الحروف صغيرة للمستوى + إضافة durationWeeks)
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
      } finally {
        setLoadingSport(false);
      }
    };
    if (id) fetchSportDetails();
  }, [id]);

  // جلب حالة التقدم عندما يتم اختيار خطة معينة (للرياضي)
  useEffect(() => {
    const fetchActiveProgress = async () => {
      if (!selectedPlan || user?.role !== 'athlete') return;
      try {
        setLoadingProgress(true);
        const res = await getActiveProgress(selectedPlan._id);
        setActiveProgress(res.data || res);
      } catch (error) {
        // إذا كان الخطأ 404 فهذا طبيعي (لأن المستخدم لم يبدأ الخطة بعد) فلا داعي لاعتباره خطأ حقيقي
        setActiveProgress(null);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchActiveProgress();
  }, [selectedPlan]);

  // دالة بدء الخطة التدريبية (لرياضي)
  const handleStartWorkout = async () => {
    try {
      const res = await startPlan(selectedPlan._id);
      setActiveProgress(res.data || res);
    } catch (error) {
      console.error("Error starting plan:", error);
      alert(error.response?.data?.message || "Failed to start workout");
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
    }
  };

  // فتح نافذة الإضافة
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentPlanId(null);
    setFormError(""); // تصفير الأخطاء السابقة
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
    e.stopPropagation(); // منع ضغط الكرت بالكامل
    setIsEditing(true);
    setCurrentPlanId(plan._id);
    setFormError(""); // تصفير الأخطاء السابقة
    setPlanForm({
      title: plan.title,
      description: plan.description,
      level: plan.level || "beginner",
      durationWeeks: plan.durationWeeks || 4,
      exercises: plan.exercises && plan.exercises.length > 0 ? plan.exercises : [{ name: "", sets: 3, reps: 10 }]
    });
    setIsModalOpen(true);
  };

  // حفظ الخطة (إضافة أو تعديل) مع عرض الخطأ داخل الفورم
  const handleSavePlan = async (e) => {
    e.preventDefault();
    setFormError(""); // إعادة ضبط الخطأ قبل الإرسال

    try {
      const payload = {
        ...planForm,
        sport: sport.slug // ربط الخطة بالرياضة الحالية
      };

      if (isEditing) {
        const res = await updatePlan(currentPlanId, payload);
        const updated = res.data || res;
        setPlans(plans.map((p) => (p._id === currentPlanId ? updated : p)));
        if (selectedPlan?._id === currentPlanId) setSelectedPlan(updated);
      } else {
        const res = await createPlan(payload);
        const newPlan = res.data || res;
        setPlans([...plans, newPlan]);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving plan:", error);
      // التقاط رسالة الخطأ القادمة من الـ Backend (Joi) وعرضها داخل الفورم
      const errorMessage = error.response?.data?.message || "Failed to save plan. Please check your inputs.";
      setFormError(errorMessage);
    }
  };

  // دالة حذف الخطة
  const handleDeletePlan = async (planId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    try {
      await deletePlan(planId);
      setPlans(plans.filter((p) => p._id !== planId));
      if (selectedPlan?._id === planId) setSelectedPlan(null);
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert(error.response?.data?.message || "Failed to delete plan");
    }
  };

  // إدارة مصفوفة التمارين داخل نموذج الإضافة/التعديل
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

  return (
    <main className="bg-slate-950 text-white min-h-screen py-16">
      <Container>
        {/* القسم العلوي (الرياضة وتفاصيلها) */}
        
        <section ref={plansRef} className="mt-24">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-bold">Training Plans</h2>
              
              {(user?.role === 'coach' || user?.role === 'admin') && (
                <Button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
                  <Plus size={20} /> Add New Plan
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div 
                  key={plan._id} 
                  onClick={() => setSelectedPlan(plan)}
                  className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-red-500 transition cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-red-400 font-semibold capitalize">{plan.level}</span>
                    
                    {(user?.role === 'coach' || user?.role === 'admin') && (
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => handleOpenEditModal(plan, e)} 
                          className="text-slate-400 hover:text-white p-1"
                        >
                          <Edit size={18}/>
                        </button>
                        <button 
                          onClick={(e) => handleDeletePlan(plan._id, e)} 
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold my-3">{plan.title}</h3>
                  <p className="text-slate-400 mb-5 line-clamp-2">{plan.description}</p>
                  <p className="text-xs text-slate-500 mb-4">Duration: {plan.durationWeeks} weeks</p>
                  
                  <Button variant="secondary">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* عرض تفاصيل الخطة المحددة وإدارة التمارين */}
        {selectedPlan && (
          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold">{selectedPlan.title}</h3>
              <button onClick={() => setSelectedPlan(null)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <p className="text-slate-300 mb-2">{selectedPlan.description}</p>
            <p className="text-sm text-red-400 font-medium mb-6">Level: {selectedPlan.level} | Duration: {selectedPlan.durationWeeks} weeks</p>

            {user?.role === 'athlete' && !activeProgress && (
              <Button onClick={handleStartWorkout} className="bg-red-600 hover:bg-red-700">
                Begin Workout Plan
              </Button>
            )}

            {activeProgress && user?.role === 'athlete' && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Progress: {activeProgress.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full mb-6 overflow-hidden">
                  <div 
                    className="bg-red-500 h-full transition-all duration-300" 
                    style={{ width: `${activeProgress.progressPercentage}%` }}
                  ></div>
                </div>

                <h4 className="text-xl font-semibold mb-4">Exercises:</h4>
                <div className="space-y-3">
                  {selectedPlan.exercises.map((ex, index) => {
                    const isCompleted = activeProgress.completedExercises?.includes(ex.name);
                    return (
                      <div 
                        key={index} 
                        onClick={() => handleToggleExercise(ex.name)}
                        className={`flex justify-between items-center p-4 rounded-xl border cursor-pointer transition ${
                          isCompleted ? 'bg-red-950/30 border-red-500' : 'bg-slate-800 border-slate-700'
                        }`}
                      >
                        <div>
                          <h5 className="font-bold text-lg">{ex.name}</h5>
                          <p className="text-sm text-slate-400">Sets: {ex.sets} | Reps: {ex.reps}</p>
                        </div>
                        <CheckCircle className={isCompleted ? 'text-red-500' : 'text-slate-600'} size={24} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* إذا كان المستخدم كوتش يعرض التمارين كقائمة عادية بدون تتبع */}
            {user?.role !== 'athlete' && (
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

        {/* نافذة (Modal) إضافة أو تعديل خطة للـ Coach / Admin */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">{isEditing ? "Edit Plan" : "Add New Plan"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {/* عرض رسالة الخطأ داخل الفورم إذا وجدت */}
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
                  {/* مطابقة القيم مع Joi Schema (beginner, intermediate, advanced) */}
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

                  {/* حقل مدة الخطة بالأسابيع المطلوبة في الـ Joi Schema */}
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
                          onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white"
                        />
                        <input 
                          type="number" 
                          placeholder="Sets" 
                          min="1"
                          required
                          value={ex.sets}
                          onChange={(e) => handleExerciseChange(index, 'sets', Number(e.target.value))}
                          className="w-20 bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white"
                        />
                        <input 
                          type="number" 
                          placeholder="Reps" 
                          min="1"
                          required
                          value={ex.reps}
                          onChange={(e) => handleExerciseChange(index, 'reps', Number(e.target.value))}
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