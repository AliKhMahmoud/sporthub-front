import api from "./api";

/**
 * جلب جميع المحادثات الخاصة بالمستخدم الحالي
 */
export async function getMyConversations() {
  const response = await api.get("/conversations");
  return response.data;
}

/**
 * بدء محادثة جديدة أو جلب المحادثة الموجودة مسبقاً
 * @param {Object} payload - { coachId } إذا كان المستخدم athlete، أو { athleteId } إذا كان coach
 */
export async function startConversation(payload) {
  const response = await api.post("/conversations", payload);
  return response.data;
}

/**
 * جلب كل الرسائل الخاصة بمحادثة معينة وعلامها كمقروءة
 * @param {string} conversationId - معرّف المحادثة (وليس معرّف المستخدم)
 */
export async function getChatMessages(conversationId) {
  const response = await api.get(`/messages/${conversationId}`);
  return response.data;
}

/**
 * إرسال رسالة جديدة داخل محادثة
 * @param {string} conversationId - معرّف المحادثة
 * @param {string} content - محتوى الرسالة النصية
 */
export async function sendChatMessage(conversationId, content) {
  const response = await api.post("/messages", {
    conversationId,
    content,
  });
  return response.data;
}