import api from "./api";

export async function getMyAiPlans() {
  const response = await api.get("/ai-plans/my");
  return response.data;
}

export async function getAiPlans() {
  const response = await api.get("/ai-plans");
  return response.data;
}

export async function createAiPlan(planData) {
  const response = await api.post("/ai-plans", planData);
  return response.data;
}

export async function rateAiPlanFeedback(planId, rating) {
  const response = await api.patch(
    `/ai-plans/${planId}/rating`,
    { rating }
  );

  return response.data;
}

export async function toggleAiPlanDay(planId, dayName) {
  const response = await api.patch(
    `/ai-plans/${planId}/days/toggle`,
    { dayName }
  );

  return response.data;
}

export async function createAiPlanComment(planId, data) {
  const response = await api.post(
    `/ai-plans/${planId}/comments`,
    data
  );

  return response.data;
}

export async function updateAiPlanComment(
  planId,
  commentId,
  data
) {
  const response = await api.put(
    `/ai-plans/${planId}/comments/${commentId}`,
    data
  );

  return response.data;
}

export async function deleteAiPlanComment(
  planId,
  commentId
) {
  const response = await api.delete(
    `/ai-plans/${planId}/comments/${commentId}`
  );

  return response.data;
}

export async function updateAiPlanStatus(
  planId,
  status,
  feedback = ""
) {
  const response = await api.patch(
    `/ai-plans/${planId}/status`,
    {
      status,
      feedback,
    }
  );

  return response.data;
}

export async function saveAiPlanFeedback(
  planId,
  feedback
) {
  const response = await api.patch(
    `/ai-plans/${planId}/feedback`,
    {
      feedback,
    }
  );

  return response.data;
}

export async function deleteAiPlan(planId) {
  const response = await api.delete(
    `/ai-plans/${planId}`
  );

  return response.data;
}