import api from "./api";

// تعديل المسار ليطابق router.get('/me', ...) في الباك إند
export async function getProfile() {
  const response = await api.get("/profile/me");
  return response.data;
}

export async function getProfileStats() {
  const response = await api.get("/profile/stats"); // تأكد إذا كانت موجودة بالباك أو عدلها حسب الحاجة
  return response.data;
}

// تعديل المسار ليطابق router.put('/me', ...) في الباك إند
export async function updateProfile(data) {
  const response = await api.put("/profile/me", data);
  return response.data;
}

export async function uploadAvatar(formData) {
  const response = await api.post("/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function uploadCover(formData) {
  const response = await api.post("/profile/cover", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}