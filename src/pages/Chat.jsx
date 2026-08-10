import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, ArrowLeft } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  startConversation,
  getChatMessages,
  sendChatMessage,
} from "../services/chatService";

function Chat() {
  const { recipientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentUserId = user?._id || user?.id;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    const initChat = async () => {
      if (!recipientId) return;

      try {
        setLoading(true);
        setErrorMsg("");

        // 1️⃣ إنشاء أو جلب المحادثة للحصول على conversationId
        const payload =
          user?.role === "athlete"
            ? { coachId: recipientId }
            : { athleteId: recipientId };

        const convRes = await startConversation(payload);
        const convData = convRes?.data || convRes?.conversation || convRes;
        const convId = convData?._id || convData?.id;

        if (!convId) {
          if (isMounted) setErrorMsg("Could not load conversation.");
          return;
        }

        if (isMounted) setConversationId(convId);

        // 2️⃣ جلب الرسائل
        const msgRes = await getChatMessages(convId);

        if (isMounted) {
          const messagesList =
            msgRes?.data?.messages || msgRes?.messages || msgRes?.data || msgRes || [];
          setMessages(Array.isArray(messagesList) ? messagesList : []);

          const receiverData =
            msgRes?.data?.receiver || msgRes?.receiver || msgRes?.participant || null;
          if (receiverData) {
            setReceiver(receiverData);
          }
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        if (isMounted) {
          const backendMsg =
            error?.response?.data?.message || "Failed to load chat.";
          setErrorMsg(backendMsg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initChat();

    return () => {
      isMounted = false;
    };
  }, [recipientId, user?.role]);

  const formatLastSeen = (date) => {
    if (!date) return "Offline";
    const lastSeenDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastSeenDate) / 60000);

    if (diffInMinutes < 1) return "Last seen just now";
    if (diffInMinutes < 60) return `Last seen ${diffInMinutes} min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `Last seen ${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;

    return `Last seen ${lastSeenDate.toLocaleDateString()}`;
  };

  const sendMessageHandler = async () => {
    if (!message.trim() || !conversationId) return;

    const messageText = message;
    setMessage("");

    try {
      const res = await sendChatMessage(conversationId, messageText);
      const newMessage = res?.data || res?.message || res;

      if (newMessage && (newMessage._id || newMessage.id)) {
        setMessages((prev) => [...prev, newMessage]);
      } else {
        const msgRes = await getChatMessages(conversationId);
        const messagesList =
          msgRes?.data?.messages || msgRes?.messages || msgRes?.data || [];
        setMessages(Array.isArray(messagesList) ? messagesList : []);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert(error?.response?.data?.message || "Failed to send message");
      setMessage(messageText);
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

  if (errorMsg) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <p className="text-red-500 font-semibold text-lg">{errorMsg}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {/* رأس المحادثة */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
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

          <button
            onClick={() => navigate(-1)}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-2 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* قائمة الرسائل */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950">
          {messages.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              Start your first conversation.
            </p>
          ) : (
            messages.map((msg, idx) => {
              const senderId =
                msg.senderId ||
                msg.sender?._id ||
                msg.sender?.id ||
                msg.sender;

              const isMine = String(senderId) === String(currentUserId);

              return (
                <div
                  key={msg._id || msg.id || idx}
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