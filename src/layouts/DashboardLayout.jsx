import { Link, NavLink, Outlet } from "react-router-dom";

import {
  Bot,
  LayoutDashboard,
  LogOut,
  Users,
  ClipboardList,
  Plus,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function DashboardLayout() {
  const { logout } = useAuth();

  const links = [
    {
      label: "Overview",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Trainees",
      path: "/dashboard/trainees", // تعديل المسار ليتطابق مع الخدمة
      icon: Users,
    },
    {
      label: "Training Requests",
      path: "/dashboard/requests", // إضافة تبويب الطلبات (قبول ورفض المتدربين)
      icon: ClipboardList,
    },
    {
      label: "Pending AI Plans",
      path: "/dashboard/pending-ai-plans",
      icon: Plus,
    },
    {
      label: "Chats",
      path: "/dashboard/chats",
      icon: Bot,
    },
  ];

  const getLinkClass = ({ isActive }) =>
    isActive
      ? "flex items-center gap-3 px-4 py-3 rounded-xl transition bg-red-500 text-white"
      : "flex items-center gap-3 px-4 py-3 rounded-xl transition text-slate-300 hover:bg-slate-800 hover:text-white";

  return (
    <div className="bg-slate-950 min-h-screen text-white flex">
      <aside className="hidden lg:flex w-72 bg-slate-900 border-r border-slate-800 min-h-screen p-6 flex-col">
        <Link
          to="/"
          className="text-3xl font-extrabold text-red-500 mb-10"
        >
          SportsHub
        </Link>

        <nav className="space-y-3 flex-1">
          {links.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={getLinkClass}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500 hover:text-white transition"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;