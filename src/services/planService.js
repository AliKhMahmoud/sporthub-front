import api from "./api";

// GET /api/plans (Public) — جلب كل الخطط مع إمكانية الفلترة حسب الرياضة (sport slug) أو المستوى (level)
export async function getPlans(sportSlug = "", level = "") {
  let url = "/plans";
  const params = [];

  if (sportSlug) params.push(`sport=${sportSlug}`);
  if (level) params.push(`level=${level}`);

  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  const response = await api.get(url);
  return response.data;
}

// GET /api/plans/:id (Public) — جلب خطة محددة بالـ ID
export async function getPlanById(planId) {
  const response = await api.get(`/plans/${planId}`);
  return response.data;
}

// POST /api/plans (Coach only) — إنشاء خطة جديدة
export async function createPlan(planData) {
  const response = await api.post("/plans", planData);
  return response.data;
}

// PUT /api/plans/:id (Coach/Admin) — تعديل خطة
export async function updatePlan(planId, planData) {
  const response = await api.put(`/plans/${planId}`, planData);
  return response.data;
}

// DELETE /api/plans/:id (Coach/Admin) — حذف خطة (Soft Delete)
export async function deletePlan(planId) {
  const response = await api.delete(`/plans/${planId}`);
  return response.data;
}