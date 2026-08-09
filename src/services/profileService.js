import api from "./api";

// 1. جلب بيانات المستخدم الشخصية
export async function getProfile() {
  const response = await api.get("/profile/me");
  return response.data;
}

// 2. جلب نشاطات المستخدم (الإحصائيات، المنشورات، الخطط)
export async function getMyActivity() {
  const response = await api.get("/profile/me/activity");
  return response.data;
}

// 3. تحديث البيانات الشخصية (الاسم، البيو، الهاتف، الطول، الوزن)
export async function updateProfile(data) {
  const response = await api.put("/profile/me", data);
  return response.data;
}

export async function getProfileById(userId) {
  const response = await api.get(`/profile/${userId}`);
  return response.data;
}

// 6. ربط المستخدم بمدرب
export async function assignCoach(coachId) {
  const response = await api.put("/profile/assign-coach", { coachId });
  return response.data;
}

// 7. اختيار الرياضة
export async function assignSport(sportId) {
  const response = await api.put("/profile/assign-sport", { sportId });
  return response.data;
}

