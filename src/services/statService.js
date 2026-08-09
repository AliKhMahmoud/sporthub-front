import api from './api'; // axios instance الخاص بك

const statService = {
  /**
   * جلب إحصائيات الرياضي الحالي (المسجل دخوله)
   * يرجع البيانات المفصلة (XP, Badges مع التفاصيل، Activity)
   */
  getMyStats: async () => {
    try {
      const response = await api.get('/stats/me');
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch stats');
      }

      return response.data.data; // يرجع فقط البيانات مبلاش الـ wrapper
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error fetching your stats';
      console.error('getMyStats error:', errorMessage);
      throw {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      };
    }
  },

  /**
   * جلب إحصائيات رياضي آخر (عام)
   * بستخدمها الكوتش أو حد بشوف profile رياضي معين
   * يرجع معلومات مبسطة (badge IDs بدون تفاصيل)
   */
  getUserStats: async (userId) => {
    // ─── Validation ─────────────────────────────────────────────────
    if (!userId) {
      throw {
        message: 'User ID is required',
        status: 400,
      };
    }

    if (typeof userId !== 'string' && typeof userId !== 'object') {
      throw {
        message: 'Invalid user ID format',
        status: 400,
      };
    }

    try {
      const response = await api.get(`/stats/${userId}`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to fetch user stats');
      }

      return response.data.data; // يرجع فقط البيانات
    } catch (error) {
      const errorMessage = 
        error.response?.status === 404 
          ? 'User not found' 
          : error.response?.data?.message || error.message || 'Error fetching user stats';
      
      console.error('getUserStats error:', errorMessage);
      throw {
        message: errorMessage,
        status: error.response?.status || 500,
        data: error.response?.data,
      };
    }
  },

  /**
   * Helper: تحويل XP لـ display format
   * مثال: { xp: 150, level: 2, xpProgress: 50 } → "150 XP (50% → Level 3)"
   */
  formatXPDisplay: (xp, level, xpProgress) => {
    return `${xp} XP (${xpProgress}% → Level ${level + 1})`;
  },

  /**
   * Helper: تحويل Badges للـ display
   * بيرجع array من badge objects أو IDs حسب الـ format
   */
  formatBadges: (badges) => {
    if (!badges || badges.length === 0) {
      return [];
    }

    // إذا كانت objects (من getMyStats)
    if (typeof badges[0] === 'object' && badges[0]?.id) {
      return badges.map(b => ({
        id: b.id,
        name: b.name,
        icon: b.icon,
        description: b.description,
      }));
    }

    // إذا كانت strings (من getUserStats)
    return badges.map(id => ({
      id,
      name: id.replace(/_/g, ' '),
      icon: '🏆', // default icon
    }));
  },
};

export default statService;