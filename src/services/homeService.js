import api from "./api";

export async function getHomeData() {
  const response = await api.get("/home");

  return response.data;
}