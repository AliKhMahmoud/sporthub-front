import api from "./api";

export async function uploadAvatar(file) {
  const formData = new FormData();

  formData.append("avatar", file);

  const response = await api.post(
    "/upload/avatar",
    formData
  );

  return response.data;
}

export async function uploadCover(file) {
  const formData = new FormData();

  formData.append("cover", file);

  const response = await api.post(
    "/upload/cover",
    formData
  );

  return response.data;
}