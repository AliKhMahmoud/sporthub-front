import { useEffect, useState } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Flame,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { getNotifications } from "../../../services/notificationService";

const getActivityIcon = (type) => {
  if (type === "message") return <MessageCircle size={32} />;
  if (type === "like") return <Heart size={32} />;
  if (type === "comment") return <MessageCircle size={32} />;
  if (type === "plan_review") return <Flame size={32} />;
  if (type === "follow") return <UserPlus size={32} />;

  return <Bell size={32} />;
};

const formatTime = (date) => {
  if (!date) return "Recently";

  const diff = Math.floor(
    (new Date() - new Date(date)) / 60000
  );

  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff} min ago`;

  const hours = Math.floor(diff / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  return new Date(date).toLocaleDateString();
};

function CommunityActivity() {
  const { user } = useAuth();

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const loadActivities = async () => {
      if (!user) {
        setActivities([]);
        return;
      }

      try {
        const data = await getNotifications();

        const list = Array.isArray(data) 
          ? data 
          : (Array.isArray(data?.notifications) ? data.notifications : (Array.isArray(data?.data) ? data.data : []));

        setActivities(list.slice(0, 4));
      } catch (error) {
        console.error(error);
        setActivities([]);
      }
    };

    loadActivities();
  }, [user]);

  return (
    <section className="pb-20">
      <div className="text-center mb-12">
        <span className="bg-red-500/10 text-red-500 dark:text-red-400 px-4 py-2 rounded-full font-semibold">
          Personal Activity
        </span>

        <h2 className="text-4xl font-bold mt-6 mb-4 text-slate-950 dark:text-white">
          Your Latest Activity
        </h2>

        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Notifications and updates related to your account.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            No personal activity yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-red-500 transition shadow-sm dark:shadow-none hover:-translate-y-1"
            >
              <div className="text-red-500 dark:text-red-400 mb-5">
                {getActivityIcon(activity.type)}
              </div>

              <h3 className="text-xl font-bold mb-2 text-slate-950 dark:text-white">
                {activity.title || "New Activity"}
              </h3>

              <p className="text-slate-600 dark:text-slate-400 mb-4 leading-7">
                {activity.message || "You have a new update."}
              </p>

              <span className="text-sm text-red-500 dark:text-red-400">
                {formatTime(activity.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default CommunityActivity;