import api from "./api";

export async function getDashboardStats() {
  const response = await api.get(
    "/dashboard/stats"
  );

  return response.data;
}

export async function getDashboardContent() {
  const response = await api.get(
    "/dashboard/content"
  );

  return response.data;
}

export async function createDashboardContent(data) {
  const response = await api.post(
    "/dashboard/content",
    data
  );

  return response.data;
}

export async function updateDashboardContent(id, data) {
  const response = await api.put(
    `/dashboard/content/${id}`,
    data
  );

  return response.data;
}

export async function deleteDashboardContent(id) {
  const response = await api.delete(
    `/dashboard/content/${id}`
  );

  return response.data;
}