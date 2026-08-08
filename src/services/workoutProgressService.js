import api from "./api";

export async function startPlan(planId) {
  const response = await api.post("/workout-progress", { planId });

  return response.data;
}

export async function getActiveProgress(planId) {
  const response = await api.get(`/workout-progress/${planId}`);

  return response.data;
}

export async function toggleExercise(progressId, exerciseName) {
  const response = await api.patch(
    `/workout-progress/${progressId}`,
    { exerciseName }
  );

  return response.data;
}