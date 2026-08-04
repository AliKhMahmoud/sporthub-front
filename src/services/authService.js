import api from "./api";

const TOKEN_KEY = "sportshub_token";

export async function loginUser(data) {
  const response = await api.post(
    "/auth/login",
    data
  );

  if (response.data?.token) {
    localStorage.setItem(
      TOKEN_KEY,
      response.data.token
    );
  }

  return response.data;
}

export async function registerUser(data) {
  const response = await api.post(
    "/auth/register",
    data
  );

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get(
    "/auth/me"
  );

  return response.data;
}

export async function logoutUser() {
  await api.post("/auth/logout");

  localStorage.removeItem(TOKEN_KEY);

  return true;
}