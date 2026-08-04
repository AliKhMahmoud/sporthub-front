import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  getChatMessages,
  sendChatMessage,
} from "../services/chatService";

function Chat() {
  const { coachId } = useParams();
  const { user } = useAuth();

  const currentUserId = user?.id || user?.email;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);

  const loadMessages = async () => {
    try {
      const data = await getChatMessages(coachId);

      setMessages(data?.messages || data || []);
      setReceiver(data?.receiver || data?.user || null);
    } catch (error) {
      console.error(error);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (!coachId) return;

    loadMessages();
  }, [coachId]);

  const formatLastSeen = (date) => {
    if (!date) return "Offline";

    const lastSeenDate = new Date(date);
    const now = new Date();

    const diffInMinutes = Math.floor(
      (now - lastSeenDate) / 60000
    );

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

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const sentMessage = await sendChatMessage(
        coachId,
        message
      );

      setMessages((prev) => [
        ...prev,
        sentMessage,
      ]);

      setMessage("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
            Chat with {receiver?.name || "User"}
          </h1>

          <div className="mt-2">
            <p className="text-slate-500">
              {receiver?.role === "coach"
                ? `Coach for ${receiver?.coachSport || "Sport"}`
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

        <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950">
          {messages.length === 0 ? (
            <p className="text-slate-500">
              Start your first conversation.
            </p>
          ) : (
            messages.map((msg) => {
              const senderId =
                msg.senderId ||
                msg.sender?.id ||
                msg.from;

              const isMine =
                String(senderId) === String(currentUserId);

              return (
                <div
                  key={msg.id}
                  className={
                    isMine
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  <div
                    className={
                      isMine
                        ? "bg-red-500 text-white px-4 py-3 rounded-2xl max-w-md"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-2xl max-w-md border border-slate-200 dark:border-slate-700"
                    }
                  >
                    <p>{msg.text || msg.message}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleString()
                        : ""}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex gap-3">
          <input
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Write a message..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white"
          />

          <button
            type="button"
            onClick={sendMessage}
            className="bg-red-500 hover:bg-red-600 text-white px-5 rounded-xl"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </main>
  );
}

export default Chat;