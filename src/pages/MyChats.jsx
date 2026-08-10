import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import { getMyConversations } from "../services/chatService";
import { useAuth } from "../context/AuthContext";

function MyChats() {
  const { user } = useAuth();
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
        console.error("Error loading conversations:", error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadConversations();
    }
  }, [user]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-10">
        <span className="text-red-500 font-semibold">My Chats</span>

        <h1 className="text-5xl font-extrabold mt-3 text-slate-950 dark:text-white">
          Your Conversations
        </h1>

        <p className="text-slate-600 dark:text-slate-400 mt-4 text-lg">
          Return to your conversations and check your latest messages.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          Loading conversations...
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            You have no conversations yet.
          </p>

          <Link to={user?.role === "coach" ? "/dashboard/trainees" : "/coaches"}>
            <button className="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              {user?.role === "coach" ? "View Trainees" : "Find a Coach"}
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {conversations.map((conversation) => {
            const partner =
              user?.role === "coach"
                ? conversation.athlete
                : conversation.coach;

            const partnerId = partner?._id || partner?.id;

            const lastMsgText =
              typeof conversation.lastMessage === "string"
                ? conversation.lastMessage
                : conversation.lastMessage?.text ||
                  conversation.lastMessage?.message ||
                  "No messages yet";

            return (
              <div
                key={conversation._id || conversation.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={partner?.avatar || "https://i.pravatar.cc/150"}
                      alt={partner?.name || "User"}
                      className="w-16 h-16 rounded-full object-cover border-2 border-red-500/30"
                    />
                    {partner?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                        {partner?.name || "User"}
                      </h2>

                      {(conversation.unreadCount || 0) > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {conversation.unreadCount} new
                        </span>
                      )}
                    </div>

                    <p className="text-red-500 font-semibold text-sm mt-1 capitalize">
                      {user?.role === "coach" ? "Athlete" : "Coach"}
                    </p>

                    <p className="text-slate-600 dark:text-slate-300 mt-2 line-clamp-1 font-medium">
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

                <Link to={`/chat/${partnerId}`}>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-colors w-full md:w-auto justify-center">
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

export default MyChats;