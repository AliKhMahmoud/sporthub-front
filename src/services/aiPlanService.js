import api from "./api";

export async function getAiPlans() {
  const response = await api.get(
    "/ai-plans"
  );

  return response.data;
}

export async function getMyAiPlans() {
  const response = await api.get(
    "/ai-plans/my"
  );

  return response.data;
}

export async function createAiPlan(data) {
  const response = await api.post(
    "/ai-plans",
    data
  );

  return response.data;
}

export async function approveAiPlan(id) {
  const response = await api.put(
    `/ai-plans/${id}/approve`
  );

  return response.data;
}

export async function rejectAiPlan(id) {
  const response = await api.put(
    `/ai-plans/${id}/reject`
  );

  return response.data;
}

export async function saveCoachFeedback(
  id,
  feedback
) {
  const response = await api.put(
    `/ai-plans/${id}/feedback`,
    { feedback }
  );

  return response.data;
}