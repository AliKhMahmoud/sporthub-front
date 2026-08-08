import api from "./api";

// GET /api/sports (Public) — جلب كل الرياضات النشطة
export async function getAllSports() {
  const response = await api.get("/sports");
  return response.data;
}

// GET /api/sports/:id (Public) — جلب رياضة محددة بالـ ID
export async function getSportById(sportId) {
  const response = await api.get(`/sports/${sportId}`);
  return response.data;
}

// PUT /api/sports/:id (Admin only) — تعديل رياضة
export async function updateSport(sportId, sportData) {
  const response = await api.put(`/sports/${sportId}`, sportData);
  return response.data;
}

// DELETE /api/sports/:id (Admin only) — حذف رياضة (Soft Delete)
export async function deleteSport(sportId) {
  const response = await api.delete(`/sports/${sportId}`);
  return response.data;
}