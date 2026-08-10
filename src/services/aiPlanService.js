import api from "./api"; // أو مسار axios instance المعتمد لديك

export const aiPlanService = {
  // 1. إنشاء خطة AI جديدة (Athlete)
  createPlan: async (planData) => {
    const response = await api.post("/ai-plans", planData);
    return response.data;
  },

  // 2. جلب جميع الخطط حسب الدور والفلتر (Athlete / Coach / Admin)
  getPlans: async (status = "") => {
    const response = await api.get("/ai-plans", {
      params: status ? { status } : {},
    });
    return response.data;
  },

  // 3. جلب تفاصيل خطة واحدة بواسطة المعرف
  getPlanById: async (id) => {
    const response = await api.get(`/ai-plans/${id}`);
    return response.data;
  },

  // 4. تحديث حالة إنجاز تمرين معين (Athlete)
  toggleExercise: async (planId, exerciseId) => {
    const response = await api.put(
      `/ai-plans/${planId}/exercise/${exerciseId}/toggle`
    );
    return response.data;
  },

  // 5. الموافقة على الخطة (Coach)
  approvePlan: async (id) => {
    const response = await api.put(`/ai-plans/${id}/approve`);
    return response.data;
  },

  // 6. رفض الخطة (Coach)
  rejectPlan: async (id) => {
    const response = await api.put(`/ai-plans/${id}/reject`);
    return response.data;
  },

  // 7. إضافة تقييم وملاحظات على الخطة (Coach)
  addFeedback: async (id, feedbackData) => {
    const response = await api.put(`/ai-plans/${id}/feedback`, feedbackData);
    return response.data;
  },

  // 8. حذف خطة - Soft Delete (Athlete)
  deletePlan: async (id) => {
    const response = await api.delete(`/ai-plans/${id}`);
    return response.data;
  },
};

export default aiPlanService;