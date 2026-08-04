import api from "./api";

export async function getMyConversations() {
  const response = await api.get(
    "/chats/conversations"
  );

  return response.data;
}

export async function getChatMessages(userId) {
  const response = await api.get(
    `/chats/${userId}/messages`
  );

  return response.data;
}

export async function sendChatMessage(userId, text) {
  const response = await api.post(
    `/chats/${userId}/messages`,
    { text }
  );

  return response.data;
}