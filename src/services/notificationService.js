import api from "./api";

// 1. جلب الإشعارات مع دعم الفلترة (read) والصفحات (page, limit)
export async function getNotifications(params = {}) {
  const response = await api.get("/notifications", { params });
  return response.data;
}

// 2. تعليم إشعار محدد كمقروء
export async function markNotificationAsRead(id) {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
}

// 3. تعليم كل الإشعارات كمقروءة
export async function markAllNotificationsAsRead() {
  const response = await api.put("/notifications/read-all");
  return response.data;
}

// 4. حذف إشعار واحد
export async function deleteNotification(id) {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
}

// 5. حذف كل الإشعارات
export async function deleteAllNotifications() {
  const response = await api.delete("/notifications");
  return response.data;
}