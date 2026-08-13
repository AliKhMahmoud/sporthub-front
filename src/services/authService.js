import api from "./api";

// 1. تسجيل الدخول
export async function loginUser(data) {
  // الكوكيز تتكفل بالتوكنات تلقائياً من الباك إند عبر (withCredentials: true)
  const response = await api.post("/auth/login", data);
  return response.data;
}

// 2. إنشاء حساب جديد
export async function registerUser(data) {
  const response = await api.post("/auth/register", data);
  return response.data;
}

// 3. جلب بيانات المستخدم الحالي
export async function getCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data;
}

// 4. تسجيل الخروج
export async function logoutUser() {
  try {
    await api.post("/auth/logout");
  } finally {
    // تنظيف أي بيانات مؤقتة متصلة بالجلسة إن وجدت
    localStorage.clear();
  }
  return true;
}

// 5. تأكيد الإيميل عبر الرابط
export async function verifyEmail(token) {
  const response = await api.get(`/auth/verify-email/${token}`);
  return response.data;
}

// 6. طلب رابط إعادة تعيين كلمة المرور
export async function forgotPassword(email) {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
}

// 7. تغيير كلمة المرور بالتوكن الجديد
export async function resetPassword(token, password, confirmPassword) {
  const response = await api.post(`/auth/reset-password/${token}`, {
    password: password,
    newPassword: password, // لترضية الكنترولر إذا لم تفرغ الباك إند
    confirmPassword: confirmPassword,
  });
  return response.data;
}