import {NavLink, Outlet } from "react-router-dom";
import {
  Bot,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Users,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function DashboardLayout() {
  const { logout } = useAuth();

  const links = [
    { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { label: "Content", path: "/dashboard/content", icon: FileText },
    { label: "Athletes", path: "/dashboard/athletes", icon: Users },
    { label: "AI Plans", path: "/dashboard/ai-plans", icon: Bot },
    { label: "Progress Reviews", path: "/dashboard/progress-reviews", icon: CheckCircle },
    { label: "Messages", path: "/dashboard/chats", icon: MessageCircle },
  ];

  const getLinkClass = ({ isActive }) =>
    isActive
      ? "flex items-center gap-3 px-4 py-3 rounded-xl transition bg-red-500 text-white"
      : "flex items-center gap-3 px-4 py-3 rounded-xl transition text-slate-300 hover:bg-slate-800 hover:text-white";

  return (
    <div className="bg-slate-950 min-h-[calc(100vh-80px)] text-white flex">
      {/* السايدبار: يبدأ تحت النافبار وله ارتفاع مخصص مع تمرير إن احتجت */}
      <aside className="hidden lg:flex w-72 bg-slate-900 border-r border-slate-800 p-6 flex-col sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto">
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
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500 hover:text-white transition mt-auto"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      {/* محتوى الـ Dashboard */}
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;