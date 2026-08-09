import api from './api'; // تأكد من استيراد الـ axios instance الخاص بك

const statService = {
  // جلب إحصائيات الرياضي الحالي (المسجل دخوله)
  getMyStats: async () => {
    try {
      const response = await api.get('/api/stats/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // جلب إحصائيات رياضي آخر (عام)
  getUserStats: async (userId) => {
    try {
      const response = await api.get(`/api/stats/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default statService;