import { Routes, Route } from "react-router-dom";

// Layouts & Protection
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Public & General Pages
import Home from "./pages/Home";
import Sports from "./pages/Sports";
import SportDetails from "./pages/SportsDetails";
import Forum from "./pages/Forum";
import Login from "./pages/Login";
import Register from "./pages/Register";

// User / Athlete & Shared Protected Pages
import Profile from "./pages/Profile";
import Coaches from "./pages/Coaches";
import Chat from "./pages/Chat";
import MyChats from "./pages/MyChats";
import AiTrainer from "./pages/AITrainer";

// Admin Page
import AdminPanel from "./pages/AdminPanel";

// Coach Dashboard Pages
import CoachDashboardOverview from "./pages/CoachDashboardOverview";
import DashboardAiPlans from "./pages/DashboardAiPlans";
import DashboardProgressReviews from "./pages/DashboardProgressReviews";
import CoachChats from "./pages/CoachChats";
import CoachTraineesManagement from "./pages/CoachTraineesManagement";

function App() {
  return (
    <Routes>
      {/* 1. المسارات الرئيسية العامة وتحت مظلة MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/sports/:id" element={<SportDetails />} />
        <Route path="/forum" element={<Forum />} />

        {/* لوحة تحكم المسؤول (Admin) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* الملف الشخصي (متاح للمستخدمين المسجلين) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* المدربون وخدمات الدردشة الخاصة بالرياضيين */}
        <Route
          path="/coaches"
          element={
            <ProtectedRoute>
              <Coaches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:coachId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-chats"
          element={
            <ProtectedRoute role="athlete">
              <MyChats />
            </ProtectedRoute>
          }
        />

        {/* مدرب الذكاء الاصطناعي (خاص بالرياضيين) */}
        <Route
          path="/ai-trainer"
          element={
            <ProtectedRoute role="athlete">
              <AiTrainer />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 2. مسارات تسجيل الدخول وإنشاء الحساب */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 3. لوحة تحكم المدرب (Coach Dashboard) - تحت مظلة DashboardLayout */}
      <Route
        element={
          <ProtectedRoute role="coach">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<CoachDashboardOverview />} />
        <Route path="/dashboard/athletes" element={<CoachTraineesManagement />} />
        <Route path="/dashboard/pending-ai-plans" element={<DashboardAiPlans />} />
        <Route path="/dashboard/progress-reviews" element={<DashboardProgressReviews />} />
        <Route path="/dashboard/chats" element={<CoachChats />} />
      </Route>
    </Routes>
  );
}

export default App;