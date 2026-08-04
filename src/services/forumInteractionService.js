import api from "./api";

export async function getPostComments(postId) {
  const response = await api.get(
    `/forum/posts/${postId}/comments`
  );

  return response.data;
}

export async function createPostComment(postId, data) {
  const response = await api.post(
    `/forum/posts/${postId}/comments`,
    data
  );

  return response.data;
}

export async function updatePostComment(postId, commentId, data) {
  const response = await api.put(
    `/forum/posts/${postId}/comments/${commentId}`,
    data
  );

  return response.data;
}

export async function deletePostComment(postId, commentId) {
  const response = await api.delete(
    `/forum/posts/${postId}/comments/${commentId}`
  );

  return response.data;
}

export async function togglePostLike(postId) {
  const response = await api.post(
    `/forum/posts/${postId}/like`
  );

  return response.data;
}