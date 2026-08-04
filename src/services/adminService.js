import api from "./api";

export const getPendingCoachRequests = async () => {
  const response = await api.get(
    "/admin/coach-requests"
  );

  return response.data;
};

export const approveCoachRequest = async (coachId) => {
  // تم تغيير الـ patch إلى put أو جعلها متوافقة مع مسارات الباك إند الشائعة
  const response = await api.put(
    `/admin/coach-requests/${coachId}/approve`
  );

  return response.data;
};

export const rejectCoachRequest = async (coachId) => {
  // تم تغيير الـ patch إلى put لضمان عدم حدوث خطأ 404 Route not found إذا كان الباك إند يستقبل PUT
  const response = await api.put(
    `/admin/coach-requests/${coachId}/reject`
  );

  return response.data;
};