import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle, X } from "lucide-react";

import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

import {
  getTrainingProgressBySport,
  startWorkout,
  requestProgressReview,
} from "../services/trainingProgressService";
import { getSportById } from "../services/sportsService";

const trainingPlans = [
  {
    title: "Beginner Plan",
    level: "Beginner",
    duration: "30 min",
    days: "3 days / week",
    calories: "250 - 350 kcal",
    description:
      "Start your journey with simple and effective routines focused on building strength and consistency.",
    exercises: [
      "Warm-up mobility",
      "Basic strength drills",
      "Light cardio",
      "Stretching",
    ],
  },
  {
    title: "Intermediate Plan",
    level: "Intermediate",
    duration: "45 min",
    days: "4 days / week",
    calories: "400 - 550 kcal",
    description:
      "Improve endurance and technique through structured workouts and progressive intensity.",
    exercises: [
      "Dynamic warm-up",
      "Technique drills",
      "Strength circuits",
      "Conditioning finishers",
    ],
  },
  {
    title: "Advanced Plan",
    level: "Advanced",
    duration: "60 min",
    days: "5 days / week",
    calories: "600 - 800 kcal",
    description:
      "High intensity programs designed for experienced athletes who want peak performance.",
    exercises: [
      "Explosive warm-up",
      "Advanced skill work",
      "HIIT training",
      "Recovery mobility",
    ],
  },
];

function SportsDetails() { // تم توحيد اسم المكون ليطابق المعايير
  const { id } = useParams();
  const { user } = useAuth();

  const plansRef = useRef(null);

  const [sport, setSport] = useState(null);
  const [loadingSport, setLoadingSport] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [myWorkouts, setMyWorkouts] = useState([]);

  // جلب تفاصيل الرياضة من الباك إند بناءً على الـ id
  useEffect(() => {
    const fetchSportDetails = async () => {
      try {
        setLoadingSport(true);
        const response = await getSportById(id);
        setSport(response.data || response);
      } catch (error) {
        console.error("Error fetching sport details:", error);
        setSport(null);
      } finally {
        setLoadingSport(false);
      }
    };

    if (id) {
      fetchSportDetails();
    }
  }, [id]);

  // جلب التمارين الخاصة بهذا الرياضي لهذه الرياضة
  useEffect(() => {
    const loadMyWorkouts = async () => {
      if (!user || !sport) return;

      try {
        const response = await getTrainingProgressBySport(sport.slug || sport._id);
        const data = response?.data || response;
        setMyWorkouts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setMyWorkouts([]);
      }
    };

    loadMyWorkouts();
  }, [user, sport]);

  const reloadMyWorkouts = async () => {
    try {
      if (!sport) return;
      const response = await getTrainingProgressBySport(sport.slug || sport._id);
      const data = response?.data || response;
      setMyWorkouts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const saveNormalWorkout = async () => {
    if (!user || !selectedPlan || !sport) return;

    const existingWorkout = myWorkouts.find(
      (workout) =>
        (workout.sportSlug === sport.slug || workout.sport === sport.name) &&
        workout.title === selectedPlan.title
    );

    if (existingWorkout) {
      setWorkoutStarted(true);
      setTimeout(() => {
        setSelectedPlan(null);
        setWorkoutStarted(false);
      }, 1200);
      return;
    }

    const newWorkout = {
      athleteId: user.id || user.email,
      athleteName: user.name || "Unknown Athlete",
      planType: "normal",
      sport: sport.name,
      sportSlug: sport.slug || sport._id,
      title: selectedPlan.title,
      level: selectedPlan.level,
      duration: selectedPlan.duration,
      schedule: selectedPlan.days,
      calories: selectedPlan.calories,
      exercises: selectedPlan.exercises,
      completedExercises: [],
      startedAt: new Date().toISOString(),
      completedAt: null,
    };

    try {
      await startWorkout(newWorkout);
      await reloadMyWorkouts();
      setWorkoutStarted(true);
      setTimeout(() => {
        setSelectedPlan(null);
        setWorkoutStarted(false);
      }, 1200);
    } catch (error) {
      console.error(error);
      alert("Could not start workout.");
    }
  };

  const getWorkoutProgress = (workout) => {
    const totalExercises = workout.exercises?.length || 0;
    const completedExercises = workout.completedExercises || [];

    if (totalExercises === 0) return 0;
    return Math.round(
      (completedExercises.length / totalExercises) * 100
    );
  };

  const handleRequestProgressReview = async (workoutId) => {
    try {
      await requestProgressReview(workoutId);
      alert("Progress review request sent to your coach.");
    } catch (error) {
      console.error(error);
      alert("Could not send progress review request.");
    }
  };

  if (loadingSport) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <h1 className="text-2xl text-slate-400">Loading sport details...</h1>
      </main>
    );
  }

  if (!sport) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <h1 className="text-4xl font-bold">Sport Not Found</h1>
      </main>
    );
  }

  return (
    <main className="bg-slate-950 text-white min-h-screen py-16">
      <Container>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="text-red-400 font-semibold text-xl">
              SportsHub Training
            </span>

            <h1 className="text-6xl font-extrabold mt-4 mb-6">
              {sport.name}
            </h1>

            <p className="text-slate-300 text-2xl leading-10 mb-8">
              {sport.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Button
                className="px-8 py-4 text-lg"
                onClick={() =>
                  plansRef.current?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
              >
                Start Training
              </Button>

              <Link to="/forum">
                <button className="border border-slate-700 hover:border-red-500 px-8 py-4 rounded-xl font-semibold transition">
                  Join Forum
                </button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <img
              src={sport.image}
              alt={sport.name}
              className="w-full h-[520px] object-cover rounded-3xl border border-slate-800 shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent rounded-3xl" />
          </div>
        </section>

        <section ref={plansRef} className="mt-24">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10">
            <h2 className="text-4xl font-bold mb-6">
              Training Plans
            </h2>

            <p className="text-slate-400 text-lg leading-8 mb-8">
              Explore professional training routines, fitness programs, and
              athlete discussions related to {sport.name}.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trainingPlans.map((plan) => (
                <button
                  key={plan.title}
                  type="button"
                  onClick={() => {
                    setSelectedPlan(plan);
                    setWorkoutStarted(false);
                  }}
                  className="text-left bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-red-500 transition hover:-translate-y-1"
                >
                  <span className="text-red-400 font-semibold">
                    {plan.level}
                  </span>

                  <h3 className="text-2xl font-bold my-3">
                    {plan.title}
                  </h3>

                  <p className="text-slate-400 mb-5">
                    {plan.description}
                  </p>

                  <div className="text-sm text-slate-300 space-y-2">
                    <p>Duration: {plan.duration}</p>
                    <p>Schedule: {plan.days}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10">
            <h2 className="text-4xl font-bold mb-6">
              My Normal Workouts
            </h2>
            {myWorkouts.length === 0 ? (
              <p className="text-slate-400">
                You have not started any workout for this sport yet.
              </p>
            ) : (
              <div className="space-y-6">
                {myWorkouts.map((workout) => {
                  const progress = getWorkoutProgress(workout);

                  return (
                    <div
                      key={workout._id || workout.id}
                      className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                        <div>
                          <span className="text-red-400 font-semibold">
                            {workout.sport} • {workout.level}
                          </span>

                          <h3 className="text-2xl font-bold mt-2">
                            {workout.title}
                          </h3>
                        </div>

                        <span
                          className={
                            progress === 100
                              ? "text-emerald-400 font-bold"
                              : "text-red-400 font-bold"
                          }
                        >
                          {progress}%
                        </span>
                      </div>

                      {progress === 100 && (
                        <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-4 flex items-center gap-3">
                          <CheckCircle size={20} />
                          Workout Completed By Coach
                        </div>
                      )}

                      <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden mb-5">
                        <div
                          className={
                            progress === 100
                              ? "bg-emerald-500 h-4 transition-all"
                              : "bg-red-500 h-4 transition-all"
                          }
                          style={{
                            width: progress + "%",
                          }}
                        />
                      </div>

                      <div className="mb-5">
                        <button
                          type="button"
                          onClick={() =>
                            handleRequestProgressReview(workout._id || workout.id)
                          }
                          className="bg-blue-500 hover:bg-blue-600 px-5 py-3 rounded-xl font-semibold transition"
                        >
                          Request Progress Review
                        </button>
                      </div>

                      <div className="space-y-3">
                        {workout.exercises?.map((exercise) => {
                          const completed =
                            workout.completedExercises?.includes(exercise);

                          return (
                            <div
                              key={exercise}
                              className={
                                "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition " +
                                (completed
                                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                                  : "bg-slate-900 border-slate-700 text-slate-300")
                              }
                            >
                              <span>{exercise}</span>
                              {completed && <CheckCircle size={18} />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </Container>
      
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-6 mb-5">
              <div>
                <span className="text-red-400 font-semibold">
                  {sport.name} • {selectedPlan.level}
                </span>

                <h2 className="text-3xl font-bold mt-2">
                  {selectedPlan.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="w-10 h-10 rounded-xl border border-slate-700 flex items-center justify-center hover:border-red-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-slate-400 leading-7 mb-6">
              {selectedPlan.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
                <p className="text-slate-400 text-sm mb-1">Duration</p>
                <h3 className="text-lg font-bold">{selectedPlan.duration}</h3>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
                <p className="text-slate-400 text-sm mb-1">Schedule</p>
                <h3 className="text-lg font-bold">{selectedPlan.days}</h3>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
                <p className="text-slate-400 text-sm/ mb-1">Calories</p>
                <h3 className="text-lg font-bold">{selectedPlan.calories}</h3>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-4">Workout Focus</h3>
              <ul className="space-y-3">
                {selectedPlan.exercises.map((exercise) => (
                  <li
                    key={exercise}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-300"
                  >
                    {exercise}
                  </li>
                ))}
              </ul>
            </div>

            {workoutStarted && (
              <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 text-emerald-400">
                <CheckCircle size={22} />
                Workout started and added to your progress tracker.
              </div>
            )}

            <Button className="w-full" onClick={saveNormalWorkout}>
              Begin Workout
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

export default SportsDetails;