import api from "./api"; // عدل مسار الـ api حسب مشروعك

// 1. الرياضي يرسل طلب تدريب
export async function createTrainingRequest(requestData) {
  const response = await api.post("/training-requests", requestData);
  return response.data;
}

// 2. الرياضي يجلب طلباته الخاصة
export async function getMyTrainingRequests() {
  const response = await api.get("/training-requests/my");
  return response.data;
}

// 3. المدرب يجلب الطلبات الواردة (مع إمكانية الفلترة بحالة الطلب مثل pending أو accepted)
export async function getCoachTrainingRequests(status) {
  const response = await api.get("/training-requests/coach", {
    params: { status },
  });
  return response.data;
}

// 4. المدرب يقبل الطلب
export async function acceptTrainingRequest(requestId) {
  const response = await api.put(`/training-requests/${requestId}/accept`);
  return response.data;
}

// 5. المدرب يرفض الطلب (مع إرسال سبب الرفض إن وُجد)
export async function rejectTrainingRequest(requestId, reason) {
  const response = await api.put(`/training-requests/${requestId}/reject`, { reason });
  return response.data;
}