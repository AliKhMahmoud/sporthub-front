import api from "./api";

// ─── Posts Services ──────────────────────────────────────────────────────

export async function getForumPosts(params) {
  try {
    const response = await api.get("/posts", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    throw error;
  }
}

export async function getPostsBySport(sportId, params) {
  try {
    const response = await api.get(`/posts/sport/${sportId}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts for sport ${sportId}:`, error);
    throw error;
  }
}

export async function getPostById(postId) {
  try {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error);
    throw error;
  }
}

export async function createForumPost(data) {
  try {
    const response = await api.post("/posts", data);
    return response.data;
  } catch (error) {
    console.error("Error creating forum post:", error);
    throw error;
  }
}

export async function updateForumPost(postId, data) {
  try {
    const response = await api.put(`/posts/${postId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating post ${postId}:`, error);
    throw error;
  }
}

export async function deleteForumPost(postId) {
  try {
    const response = await api.delete(`/posts/${postId}`);
    // Handle 204 No Content — response.data might be empty
    return response.data || { success: true };
  } catch (error) {
    console.error(`Error deleting post ${postId}:`, error);
    throw error;
  }
}

// ─── Likes Services (Two separate endpoints) ─────────────────────────────

export async function likePost(postId) {
  try {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error(`Error liking post ${postId}:`, error);
    throw error;
  }
}

export async function unlikePost(postId) {
  try {
    const response = await api.delete(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error(`Error unliking post ${postId}:`, error);
    throw error;
  }
}

// ─── Comments Services ───────────────────────────────────────────────────

export async function getPostComments(postId) {
  try {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    throw error;
  }
}

export async function createPostComment(postId, data) {
  try {
    const response = await api.post(`/posts/${postId}/comments`, data);
    return response.data;
  } catch (error) {
    console.error(`Error creating comment on post ${postId}:`, error);
    throw error;
  }
}

export async function updateComment(commentId, data) {
  try {
    const response = await api.put(`/comments/${commentId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating comment ${commentId}:`, error);
    throw error;
  }
}

export async function deletePostComment(commentId) {
  try {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data || { success: true };
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    throw error;
  }
}