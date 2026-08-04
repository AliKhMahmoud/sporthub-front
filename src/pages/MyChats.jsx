import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import { getMyConversations } from "../services/chatService";

function MyChats() {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await getMyConversations();
        setConversations(data || []);
      } catch (error) {
        console.error(error);
        setConversations([]);
      }
    };

    loadConversations();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-10">
        <span className="text-red-500 font-semibold">
          My Chats
        </span>

        <h1 className="text-5xl font-extrabold mt-3 text-slate-950 dark:text-white">
          Your coach conversations
        </h1>

        <p className="text-slate-600 dark:text-slate-400 mt-4 text-lg">
          Return to your conversations and check coach replies.
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            You have no conversations yet.
          </p>

          <Link to="/coaches">
            <button className="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold">
              Find a Coach
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {conversations.map((conversation) => {
            const coach =
              conversation.user ||
              conversation.coach ||
              conversation.participant ||
              {};

            const coachId =
              coach.id ||
              conversation.coachId ||
              conversation.userId ||
              conversation.participantId;

            return (
              <div
                key={coachId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={
                      coach.avatar ||
                      "https://i.pravatar.cc/150"
                    }
                    alt={coach.name || "Coach"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-red-500/30"
                  />

                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                        {coach.name || "Coach"}
                      </h2>

                      {(conversation.unreadCount || 0) > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {conversation.unreadCount} new
                        </span>
                      )}
                    </div>

                    <p className="text-red-500 font-semibold mt-2">
                      Coach for {coach.coachSport || "Sport"}
                    </p>

                    <p className="text-slate-500 mt-2 line-clamp-1">
                      {conversation.lastMessage?.text ||
                        conversation.lastMessage?.message ||
                        "No messages yet"}
                    </p>

                    <p className="text-sm text-slate-400 mt-2">
                      {conversation.count ||
                        conversation.messagesCount ||
                        0}{" "}
                      message(s)
                    </p>
                  </div>
                </div>
                <Link to={`/chat/${coachId}`}>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl flex items-center gap-2">
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