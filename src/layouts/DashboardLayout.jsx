import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";

import {
  Bot,
  LayoutDashboard,
  LogOut,
  Plus,
  CheckCircle,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    {
      label: "Overview",
      path: "/dashboard",
      icon: LayoutDashboard,
    },

    {
      label: "Pending AI Plans",
      path: "/dashboard/ai-plans",
      icon: Plus,
    },
    {
      label: "Progress Reviews",
      path: "/dashboard/progress-reviews",
      icon: CheckCircle,
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

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-slate-900 border-r border-slate-800 min-h-screen p-6 flex-col">
        <div className="mb-8">
          <Link
            to="/"
            className="text-3xl font-extrabold text-red-500 block mb-4"
          >
            SportsHub
          </Link>

          {/* زر الرجوع للخلف */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
        </div>

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

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: -288 }}
        animate={{ x: sidebarOpen ? 0 : -288 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed lg:hidden left-0 top-0 w-72 h-screen bg-slate-900 border-r border-slate-800 p-6 flex flex-col z-40"
      >
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-extrabold text-red-500"
          >
            SportsHub
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white transition p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* زر الرجوع */}
        <button
          type="button"
          onClick={() => {
            navigate("/");
            setSidebarOpen(false);
          }}
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <nav className="space-y-2 flex-1">
          {links.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={getLinkClass}
                onClick={handleNavClick}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => {
            logout();
            setSidebarOpen(false);
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500 hover:text-white transition"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </motion.aside>

      {/* Mobile Sidebar Backdrop/Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 lg:hidden z-30"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header with Toggle Button */}
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white transition p-1"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link
            to="/"
            className="text-xl font-extrabold text-red-500 flex-1 text-center"
          >
            SportsHub
          </Link>
          <div className="w-10" />
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;