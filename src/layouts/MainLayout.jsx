import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function MainLayout() {
  return (
    <div className="min-h-screen bg-blue-50 text-slate-950 dark:bg-slate-950 dark:text-white transition">
      <Navbar />

      <Outlet />

      <Footer />
    </div>
  );
}

export default MainLayout;