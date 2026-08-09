import api from "./api";

// إضافة سجل تقدم جديد (خاص بالمدرب لمتدربه)
export async function addProgress(progressData) {
  const response = await api.post("/progress", progressData);
  return response.data;
}

// جلب كل سجلات التقدم الخاصة بالمستخدم المسجل حالياً (مع إمكانية الفلترة اختيارياً بـ sport أو metric)
export async function getMyProgress(params = {}) {
  const response = await api.get("/progress/me", { params });
  return response.data;
}

// جلب إحصائيات البروفايل والرسوم البيانية (Latest, Best, Average, History)
export async function getMyStats(params = {}) {
  const response = await api.get("/progress/me/stats", { params });
  return response.data;
}

// حذف سجل تقدم معين
export async function deleteProgress(progressId) {
  const response = await api.delete(`/progress/${progressId}`);
  return response.data;
}

// جلب سجلات تقدم متدرب معين (خاص بالمدرب)
export async function getTraineeProgress(traineeId) {
  const response = await api.get(`/progress/trainee/${traineeId}`);
  return response.data;
}