import api from "./api";

export async function getForumPosts() {
  const response = await api.get("/posts");

  return response.data;
}

export async function createForumPost(data) {
  const response = await api.post(
    "/forum/posts",
    data
  );

  return response.data;
}

export async function deleteForumPost(postId) {
  const response = await api.delete(
    `/forum/posts/${postId}`
  );

  return response.data;
}

export async function updateForumPost(postId, data) {
  const response = await api.put(
    `/forum/posts/${postId}`,
    data
  );

  return response.data;
}