import api from "./api";

// إضافة سجل تقدم جديد (خاص بالمدرب لمتدربه)
export async function addProgress(progressData) {
  try {
    const response = await api.post("/progress", progressData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// جلب كل سجلات التقدم الخاصة بالمستخدم المسجل حالياً (مع إمكانية الفلترة اختيارياً بـ sport أو metric)
export async function getMyProgress(params = {}) {
  try {
    const response = await api.get("/progress/me", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// جلب إحصائيات التقدم (Latest, Best, Average, History)
export async function getMyProgressStats(params = {}) {
  try {
    const response = await api.get("/progress/me/stats", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// حذف سجل تقدم معين
export async function deleteProgress(progressId) {
  try {
    const response = await api.delete(`/progress/${progressId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// جلب سجلات تقدم متدرب معين (خاص بالمدرب)
export async function getTraineeProgress(traineeId) {
  try {
    const response = await api.get(`/progress/trainee/${traineeId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// جلب إحصائيات تقدم متدرب معين
export async function getTraineeProgressStats(traineeId, params = {}) {
  try {
    const response = await api.get(`/progress/trainee/${traineeId}/stats`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

// جلب إحصائيات التقدم لكل المتدربين
export async function getAllTraineesProgress() {
  try {
    const response = await api.get('/progress/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}