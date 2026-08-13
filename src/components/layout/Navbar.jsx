import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Clock,
  Menu,
  MessageCircle,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  User,
  X,
  Zap,
  Trash2,
  CheckCheck,
} from "lucide-react";

import Button from "../ui/Button";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";



import logo from "../../assets/logo/logo.png";
import { deleteAllNotifications, deleteNotification, getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "../../services/notificationService";

function Navbar() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const {
    user,
    logout,
    isCoach,
    isAthlete,
    isAdmin,
    isPendingCoach,
    isRejectedCoach,
  } = useAuth();

  const { theme, toggleTheme } = useTheme();

  // فحص دقيق وشامل لصلاحية الأدمن أو السوبر أدمن بناءً على البيانات المتوفرة في الكائن
  const canAccessAdmin =
    user?.roleName === "SuperAdmin" ||
    user?.roleName === "Admin" ||
    user?.roleId === 6 ||
    isAdmin === true ||
    user?.isAdmin === true;

  const getNotificationLink = (notification) => {
    if (notification.link) return notification.link;

    if (notification.type === "message") {
      if (notification.senderId) {
        return `/chat/${notification.senderId}`;
      }

      return isCoach ? "/dashboard/chats" : "/my-chats";
    }

    if (
      notification.type === "like" ||
      notification.type === "comment"
    ) {
      if (notification.postId) {
        return `/forum?post=${notification.postId}`;
      }

      return "/forum";
    }

    if (notification.type === "plan_review") {
      return isCoach ? "/dashboard/ai-plans" : "/ai-trainer";
    }

    if (notification.type === "coach_status") {
      return "/profile";
    }

    return "/";
  };

  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadNotifications(0);
      return;
    }

    try {
      const data = await getNotifications();

      // حماية تامة للتأكد من أننا نتعامل مع مصفوفة بغض النظر عن شكل الاستجابة
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.notifications)
        ? data.notifications
        : Array.isArray(data?.data)
        ? data.data
        : [];

      const unreadCount = list.filter(
        (notification) => notification.read === false
      ).length;

      setNotifications(list.slice(0, 6));
      setUnreadNotifications(unreadCount);
    } catch (error) {
      console.error(error);
      setNotifications([]);
      setUnreadNotifications(0);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);
        await loadNotifications();
      }
    } catch (error) {
      console.error(error);
    }

    setIsNotificationsOpen(false);
    navigate(getNotificationLink(notification));
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      await loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try {
      await deleteAllNotifications();
      await loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/sports", label: "Sports" },
    { path: "/forum", label: "Forum" },
    { path: "/profile", label: "Profile" },
    ...(canAccessAdmin ? [{ path: "/admin", label: "Admin Panel" }] : []),
  ];

  const linkClass = ({ isActive }) =>
    isActive
      ? "text-red-500"
      : "text-slate-700 dark:text-white hover:text-red-400 transition";

  const mobileLinkClass = ({ isActive }) =>
    isActive
      ? "block bg-red-500 text-white px-4 py-3 rounded-xl"
      : "block text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-3 rounded-xl transition";

  const iconButtonClass =
    "relative w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-red-500 transition";

  const closeMenus = () => {
    setIsOpen(false);
    setIsAccountOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleLogout = () => {
    closeMenus();
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-24">
          <Link
            to="/"
            onClick={closeMenus}
            className="flex items-center gap-3 group"
          >
            <img
              src={logo}
              alt="SportsHub Logo"
              className="w-24 h-24 object-contain group-hover:scale-105 transition"
            />

            <span className="hidden sm:block text-3xl xl:text-4xl font-extrabold text-red-500">
              SportsHub
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8 font-medium">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={linkClass}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className={iconButtonClass}
            >
              {theme === "dark" ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </button>

            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setIsAccountOpen(false);
                  }}
                  className={iconButtonClass}
                >
                  <Bell size={20} />

                  {unreadNotifications > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <h3 className="font-bold text-slate-950 dark:text-white">
                        Notifications
                      </h3>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 transition"
                          title="Mark all as read"
                        >
                          <CheckCheck size={14} />
                          Mark all read
                        </button>

                        {notifications.length > 0 && (
                          <button
                            type="button"
                            onClick={handleDeleteAllNotifications}
                            className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition"
                            title="Clear all"
                          >
                            <Trash2 size={14} />
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-5 text-slate-500 text-center">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            className={
                              "w-full text-left p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-start justify-between gap-2 " +
                              (notification.read === false
                                ? "bg-red-500/5"
                                : "")
                            }
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <div className="mt-1 text-red-500">
                                <Bell size={18} />
                              </div>

                              <div>
                                <h4 className="font-bold text-slate-950 dark:text-white text-sm">
                                  {notification.title || "New Notification"}
                                </h4>

                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                  {notification.message || "You have a new update."}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) =>
                                handleDeleteNotification(e, notification.id)
                              }
                              className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountOpen(!isAccountOpen);
                    setIsNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-red-500 transition"
                >
                  <User size={18} />

                  <span className="max-w-[120px] truncate">
                    {user.name || user.firstName || "Account"}
                  </span>

                  <ChevronDown size={16} />
                </button>

                {isAccountOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-3 space-y-2">
                      <Link
                        to="/profile"
                        onClick={closeMenus}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <User size={18} />
                        Profile
                      </Link>

                      {isAthlete && (
                        <>
                          <Link
                            to="/coaches"
                            onClick={closeMenus}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Search size={18} />
                            Find Coach
                          </Link>

                          <Link
                            to="/my-chats"
                            onClick={closeMenus}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <MessageCircle size={18} />
                            My Chats
                          </Link>

                          <Link
                            to="/ai-trainer"
                            onClick={closeMenus}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Zap size={18} />
                            AI Trainer
                          </Link>
                        </>
                      )}

                      {isPendingCoach && (
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                          <Clock size={18} className="mt-1" />
                          <div>
                            <p className="font-semibold">
                              Coach Request Pending
                            </p>
                            <p className="text-xs">
                              Waiting for admin approval.
                            </p>
                          </div>
                        </div>
                      )}

                      {isRejectedCoach && (
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 text-red-500">
                          <X size={18} className="mt-1" />
                          <div>
                            <p className="font-semibold">
                              Coach Request Rejected
                            </p>
                            <p className="text-xs">
                              You can continue as an athlete.
                            </p>
                          </div>
                        </div>
                      )}

                      {isCoach && (
                        <>
                          <Link
                            to="/dashboard"
                            onClick={closeMenus}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Zap size={18} />
                            Dashboard
                          </Link>

                          <Link
                            to="/dashboard/chats"
                            onClick={closeMenus}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <MessageCircle size={18} />
                            Coach Chats
                          </Link>
                        </>
                      )}

                      {canAccessAdmin && (
                        <Link
                          to="/admin"
                          onClick={closeMenus}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <ShieldCheck size={18} />
                          Admin Panel
                        </Link>
                      )}

                      <Button
                        variant="outline"
                        className="w-full mt-2"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!user && (
              <Link to="/login">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              setIsAccountOpen(false);
              setIsNotificationsOpen(false);
            }}
            className="lg:hidden text-slate-900 dark:text-white"
          >
            {isOpen ? <X size={30} /> : <Menu size={30} />}
          </button>
        </div>

        {isOpen && (
          <div className="lg:hidden pb-6 space-y-4">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={closeMenus}
                  className={mobileLinkClass}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className={iconButtonClass}
              >
                {theme === "dark" ? (
                  <Sun size={20} />
                ) : (
                  <Moon size={20} />
                )}
              </button>

              {user && (
                <button
                  type="button"
                  onClick={() =>
                    setIsNotificationsOpen(!isNotificationsOpen)
                  }
                  className={iconButtonClass}
                >
                  <Bell size={20} />

                  {unreadNotifications > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              )}
            </div>

            {user ? (
              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-2">
                <Link
                  to="/profile"
                  onClick={closeMenus}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition"
                >
                  <User size={18} />
                  Profile
                </Link>

                {isAthlete && (
                  <>
                    <Link
                      to="/coaches"
                      onClick={closeMenus}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition"
                    >
                      <Search size={18} />
                      Find Coach
                    </Link>

                    <Link
                      to="/my-chats"
                      onClick={closeMenus}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition"
                    >
                      <MessageCircle size={18} />
                      My Chats
                    </Link>

                    <Link
                      to="/ai-trainer"
                      onClick={closeMenus}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition"
                    >
                      <Zap size={18} />
                      AI Trainer
                    </Link>
                  </>
                )}

                {isCoach && (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={closeMenus}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition"
                    >
                      <Zap size={18} />
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/chats"
                      onClick={closeMenus}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition"
                    >
                      <MessageCircle size={18} />
                      Coach Chats
                    </Link>
                  </>
                )}

                {canAccessAdmin && (
                  <Link
                    to="/admin"
                    onClick={closeMenus}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition"
                  >
                    <ShieldCheck size={18} />
                    Admin Panel
                  </Link>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login" onClick={closeMenus}>
                <Button className="w-full">Sign In</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;