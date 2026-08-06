import api from "./api";

// 1. جلب نظرة عامة والإحصائيات الخاصة بلوحة تحكم الكوتش
export async function getCoachDashboardOverview() {
  const response = await api.get("/coach-dashboard");
  return response.data;
}

// 2. جلب قائمة المتدربين التابعين لهذا الكوتش
export async function getMyTrainees() {
  const response = await api.get("/coach-dashboard/trainees");
  return response.data;
}

// 3. جلب الخطط الذكية المعلقة التي تنتظر مراجعة وموافقة الكوتش
export async function getPendingAiPlans() {
  const response = await api.get("/coach-dashboard/pending-ai-plans");
  return response.data;
}

// 4. جلب طلبات التدريب الواردة الخاصة باللوحة
export async function getDashboardTrainingRequests() {
  const response = await api.get("/coach-dashboard/training-requests");
  return response.data;
}