import api from "./api";

// 1. جلب نظرة عامة والإحصائيات الخاصة بلوحة تحكم الكوتش
export async function getCoachDashboardOverview() {
  const response = await api.get("/dashboard/coach");
  return response.data;
}

// 2. جلب قائمة المتدربين التابعين لهذا الكوتش
export async function getMyTrainees() {
  const response = await api.get("/dashboard/coach/trainees");
  return response.data;
}

// 3. جلب الخطط الذكية المعلقة التي تنتظر مراجعة وموافقة الكوتش
export async function getPendingAiPlans() {
  const response = await api.get("/dashboard/coach/ai-plans");
  return response.data;
}

// 4. جلب طلبات التدريب الواردة الخاصة باللوحة
export async function getDashboardTrainingRequests() {
  const response = await api.get("/dashboard/coach/requests");
  return response.data;
}