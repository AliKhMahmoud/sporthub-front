import api from "./api";

// ─── 1. إحصائيات لوحة التحكم ─────────────────────────────
export const getDashboardStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

// ─── 2. إدارة طلبات المدربين (Coach Requests) ─────────────

// جلب طلبات المدربين (الافتراضي pending ويمكن إرسال status أخرى)
export const getPendingCoachRequests = async (status = "pending") => {
  const response = await api.get("/admin/coach-requests", {
    params: { status },
  });
  return response.data;
};

// الموافقة على طلب مدرب
export const approveCoachRequest = async (coachId) => {
  const response = await api.put(`/admin/coach-requests/${coachId}/approve`);
  return response.data;
};

// رفض طلب مدرب (مع إمكانية إرسال سبب الرفض)
export const rejectCoachRequest = async (coachId, reason = "") => {
  const response = await api.put(`/admin/coach-requests/${coachId}/reject`, {
    reason,
  });
  return response.data;
};

// ─── 3. إدارة المستخدمين (Users Management) ────────────────

// جلب قائمة المستخدمين مع دعم الفلترة حسب الـ role والتصفح (Pagination)
export const getUsers = async (params = {}) => {
  // params مثال: { role: 'athlete', page: 1, limit: 10 }
  const response = await api.get("/admin/users", { params });
  return response.data;
};

// تعطيل / حظر مستخدم (Deactivate User)
export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};