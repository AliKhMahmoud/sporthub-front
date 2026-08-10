import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import { getMyConversations } from "../services/chatService";

function CoachChats() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await getMyConversations();
        const dataList = response?.data || response || [];
        setConversations(Array.isArray(dataList) ? dataList : []);
      } catch (error) {
        console.error("Error loading coach conversations:", error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <span className="text-red-500 font-semibold">Coach Inbox</span>

        <h1 className="text-4xl font-extrabold text-slate-950 dark:text-white mt-2">
          Athlete Messages
        </h1>

        <p className="text-slate-500 mt-3">
          View and reply to athletes who contacted you.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          Loading messages...
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center">
          <p className="text-slate-500">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {conversations.map((conversation) => {
            const athlete =
              conversation.athlete ||
              conversation.user ||
              conversation.participant ||
              {};

            const athleteId = athlete._id || athlete.id;

            const lastMsgText =
              typeof conversation.lastMessage === "string"
                ? conversation.lastMessage
                : conversation.lastMessage?.text ||
                  conversation.lastMessage?.message ||
                  "No message";

            return (
              <div
                key={conversation._id || athleteId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={athlete.avatar || "https://i.pravatar.cc/150"}
                    alt={athlete.name || "Athlete"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-red-500/30"
                  />

                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                        {athlete.name || "Unknown Athlete"}
                      </h2>

                      {(conversation.unreadCount || 0) > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {conversation.unreadCount} new
                        </span>
                      )}
                    </div>

                    <p className="text-slate-500 mt-2 line-clamp-1">
                      {lastMsgText}
                    </p>

                    {conversation.lastMessageAt && (
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(conversation.lastMessageAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <Link to={`/chat/${athleteId}`}>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-colors">
                    <MessageCircle size={18} />
                    Open Chat
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default CoachChats;