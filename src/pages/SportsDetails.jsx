import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, X, Edit, Trash2, Plus } from "lucide-react";

import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

import { getSportById } from "../services/sportsService";
import { getPlans } from "../services/planService"; 
import { startPlan, getActiveProgress, toggleExercise } from "../services/workoutProgressService";

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
          // ✅ التعديل هنا: استخراج الـ data من استجابة السيرفر بشكل صحيح
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

  return (
    <main className="bg-slate-950 text-white min-h-screen py-16">
      <Container>
        {/* القسم العلوي (الرياضة وتفاصيلها) */}
        
        <section ref={plansRef} className="mt-24">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-bold">Training Plans</h2>
              
              {(user?.role === 'coach' || user?.role === 'admin') && (
                <Button className="flex items-center gap-2">
                  <Plus size={20} /> Add New Plan
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan._id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-red-500 transition">
                  <div className="flex justify-between items-start">
                    <span className="text-red-400 font-semibold">{plan.level}</span>
                    
                    {(user?.role === 'coach' || user?.role === 'admin') && (
                      <div className="flex gap-2">
                        <button className="text-slate-400 hover:text-white"><Edit size={18}/></button>
                        <button className="text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold my-3">{plan.title}</h3>
                  <p className="text-slate-400 mb-5 line-clamp-2">{plan.description}</p>
                  
                  <Button variant="secondary" onClick={() => setSelectedPlan(plan)}>
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* عرض تفاصيل الخطة المحددة وإدارة التمارين (للرياضي) */}
        {selectedPlan && (
          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold">{selectedPlan.title}</h3>
              <button onClick={() => setSelectedPlan(null)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <p className="text-slate-300 mb-6">{selectedPlan.description}</p>

            {user?.role === 'athlete' && !activeProgress && (
              <Button onClick={handleStartWorkout} className="bg-red-600 hover:bg-red-700">
                Begin Workout Plan
              </Button>
            )}

            {activeProgress && (
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
          </div>
        )}

      </Container>
    </main>
  );
}

export default SportsDetails;