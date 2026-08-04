import api from "./api";

export async function createNotification(notification) {
  const response = await api.post(
    "/notifications",
    notification
  );

  return response.data;
}

export async function getNotifications() {
  const response = await api.get(
    "/notifications"
  );

  return response.data;
}

export async function markNotificationAsRead(id) {
  // تم تغيير الـ patch إلى put لتتطابق مع راوتر الباك إند
  const response = await api.put(
    `/notifications/${id}/read`
  );

  return response.data;
}