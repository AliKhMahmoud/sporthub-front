import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

import { getMyConversations } from "../services/chatService";

function CoachChats() {
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
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <span className="text-red-500 font-semibold">
          Coach Inbox
        </span>

        <h1 className="text-4xl font-extrabold text-slate-950 dark:text-white mt-2">
          Athlete Messages
        </h1>

        <p className="text-slate-500 mt-3">
          View and reply to athletes who contacted you.
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center">
          <p className="text-slate-500">
            No messages yet.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {conversations.map((conversation) => {
            const otherUser =
              conversation.user ||
              conversation.athlete ||
              conversation.participant ||
              {};

            const otherUserId =
              otherUser.id ||
              conversation.userId ||
              conversation.athleteId ||
              conversation.participantId;

            return (
              <div
                key={otherUserId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={
                      otherUser.avatar ||
                      "https://i.pravatar.cc/150"
                    }
                    alt={otherUser.name || "Athlete"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-red-500/30"
                  />

                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                        {otherUser.name || "Unknown Athlete"}
                      </h2>

                      {(conversation.unreadCount || 0) > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {conversation.unreadCount} new
                        </span>
                      )}
                    </div>

                    <p className="text-slate-500 mt-2 line-clamp-1">
                      {conversation.lastMessage?.text ||
                        conversation.lastMessage?.message ||
                        "No message"}
                    </p>

                    <p className="text-sm text-slate-400 mt-2">
                      {conversation.count || conversation.messagesCount || 0} message(s)
                    </p>
                  </div>
                </div>

                <Link to={`/chat/${otherUserId}`}>
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

export default CoachChats;