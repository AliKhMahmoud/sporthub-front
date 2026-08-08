import api from "./api";

// ─── Posts Services (1 to 6) ─────────────────────────────────────────────

export async function getForumPosts(params) {
  const response = await api.get("/posts", { params });
  return response.data;
}

export async function getPostsBySport(sportId, params) {
  const response = await api.get(`/posts/sport/${sportId}`, { params });
  return response.data;
}

export async function getPostById(postId) {
  const response = await api.get(`/posts/${postId}`);
  return response.data;
}

export async function createForumPost(data) {
  const response = await api.post("/posts", data);
  return response.data;
}

export async function updateForumPost(postId, data) {
  const response = await api.put(`/posts/${postId}`, data);
  return response.data;
}

export async function deleteForumPost(postId) {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
}

// ─── Likes Services (7 & 8) ──────────────────────────────────────────────

export async function togglePostLike(postId) {
  const response = await api.post(`/posts/${postId}/like`);
  return response.data;
}

export async function unlikePost(postId) {
  const response = await api.delete(`/posts/${postId}/like`);
  return response.data;
}

// ─── Comments Services (9 to 12) ─────────────────────────────────────────

// 9. جلب تعليقات منشور معين
export async function getPostComments(postId) {
  const response = await api.get(`/posts/${postId}/comments`);
  return response.data;
}

// 10. إضافة تعليق جديد على منشور
export async function createPostComment(postId, data) {
  const response = await api.post(`/posts/${postId}/comments`, data);
  return response.data;
}

// 11. تعديل تعليق (عبر الـ commentId مباشرة)
export async function updateComment(commentId, data) {
  const response = await api.put(`/comments/${commentId}`, data);
  return response.data;
}

// 12. حذف تعليق (عبر الـ commentId مباشرة)
export async function deleteComment(commentId) {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
}