import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  startConversation,
  getChatMessages,
  sendChatMessage,
} from "../services/chatService";

function Chat() {
  const { coachId } = useParams();
  const { user } = useAuth();

  const currentUserId = user?._id || user?.id;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);

  // جلب المحادثة والرسائل بطلب متسلسل منظم داخل دالة واحدة
  useEffect(() => {
    let isMounted = true;

    const initChat = async () => {
      if (!coachId) return;

      try {
        setLoading(true);

        // 1️⃣ إنشاء أو جلب المحادثة للحصول على conversationId
        const payload =
          user?.role === "athlete"
            ? { coachId }
            : { athleteId: coachId };

        const convData = await startConversation(payload);
        const convId =
          convData?.conversation?._id ||
          convData?.conversation?.id ||
          convData?._id ||
          convData?.id;

        if (!convId) {
          console.error("Conversation ID not found in response:", convData);
          if (isMounted) setLoading(false);
          return;
        }

        if (isMounted) setConversationId(convId);

        // 2️⃣ جلب الرسائل مباشرة باستخدام الـ convId الذي حصلنا عليه
        const msgData = await getChatMessages(convId);

        if (isMounted) {
          const messagesList =
            msgData?.messages || msgData?.data || msgData || [];
          setMessages(Array.isArray(messagesList) ? messagesList : []);

          const receiverData =
            msgData?.receiver || msgData?.participant || msgData?.user || null;
          if (receiverData) {
            setReceiver(receiverData);
          }
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        if (isMounted) setMessages([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initChat();

    return () => {
      isMounted = false;
    };
  }, [coachId, user?.role]);

  const formatLastSeen = (date) => {
    if (!date) return "Offline";

    const lastSeenDate = new Date(date);
    const now = new Date();

    const diffInMinutes = Math.floor((now - lastSeenDate) / 60000);

    if (diffInMinutes < 1) {
      return "Last seen just now";
    }

    if (diffInMinutes < 60) {
      return `Last seen ${diffInMinutes} min ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInHours < 24) {
      return `Last seen ${diffInHours} hour${
        diffInHours === 1 ? "" : "s"
      } ago`;
    }

    return `Last seen ${lastSeenDate.toLocaleDateString()}`;
  };

  const sendMessageHandler = async () => {
    if (!message.trim() || !conversationId) return;

    try {
      const sentMessage = await sendChatMessage(conversationId, message);

      const newMessage =
        sentMessage?.message || sentMessage?.data || sentMessage;
      setMessages((prev) => [...prev, newMessage]);

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Loading conversation...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {/* رأس المحادثة */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
            Chat with {receiver?.name || "User"}
          </h1>

          <div className="mt-2">
            <p className="text-slate-600 dark:text-slate-400">
              {receiver?.role === "coach"
                ? `Coach for ${receiver?.sport?.name || "Sport"}`
                : "Athlete"}
            </p>

            {receiver?.isOnline ? (
              <p className="text-emerald-500 text-sm font-semibold mt-1">
                ● Online
              </p>
            ) : (
              <p className="text-slate-400 text-sm mt-1">
                {formatLastSeen(receiver?.lastSeen)}
              </p>
            )}
          </div>
        </div>

        {/* قائمة الرسائل */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950">
          {messages.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              Start your first conversation.
            </p>
          ) : (
            messages.map((msg) => {
              const senderId =
                msg.senderId ||
                msg.sender?._id ||
                msg.sender?.id ||
                msg.from;

              const isMine = String(senderId) === String(currentUserId);

              return (
                <div
                  key={msg._id || msg.id || Math.random()}
                  className={
                    isMine ? "flex justify-end" : "flex justify-start"
                  }
                >
                  <div
                    className={
                      isMine
                        ? "bg-red-500 text-white px-4 py-3 rounded-2xl max-w-xs lg:max-w-md break-words"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-2xl max-w-xs lg:max-w-md break-words border border-slate-200 dark:border-slate-700"
                    }
                  >
                    <p className="text-sm md:text-base">
                      {msg.content || msg.text || msg.message}
                    </p>
                    <p className="text-xs opacity-70 mt-2">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* مربع الإدخال */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex gap-3 bg-white dark:bg-slate-900">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessageHandler();
              }
            }}
            placeholder="Write a message..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 outline-none focus:border-red-500 transition-colors"
          />

          <button
            type="button"
            onClick={sendMessageHandler}
            disabled={!message.trim()}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-5 py-3 rounded-xl transition-colors flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </main>
  );
}

export default Chat;