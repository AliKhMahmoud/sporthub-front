import api from "./api";

export async function uploadAvatar(file) {
  const formData = new FormData();

  // يجب أن يكون الاسم 'image' ليطابق wrapSingle('image') في الباك إند
  formData.append("image", file); 

  const response = await api.post("/upload/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function uploadCover(file) {
  const formData = new FormData();

  // يجب أن يكون الاسم 'image' ليطابق wrapSingle('image') في الباك إند
  formData.append("image", file);

  const response = await api.post("/upload/cover", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;

  
}